# WebTestPro - Web UI & API Automation Framework

End-to-end UI and API test automation for [automationexercise.com](https://automationexercise.com/), built
with **Playwright Test** and **TypeScript** using the Page Object Model.

- **55 UI tests** per browser project: authentication, product catalogue, search, categories and brands,
  reviews, cart, checkout and contact form.
- **26 API tests** against every endpoint in the site's [official API list](https://automationexercise.com/api_list),
  including JSON Schema contract checks and response-time budgets.
- 6 Playwright projects (API, Chromium, Firefox, WebKit, Pixel 7, iPhone 14): **301 tests** in total.

---

## Contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Executing tests](#executing-tests)
- [Reports](#reports)
- [Debugging](#debugging)
- [CI/CD](#cicd)
- [Example scenarios](#example-scenarios)
- [Known site limitations](#known-site-limitations)
- [Framework limitations](#framework-limitations)

---

## Architecture

```
            tests/ui/**  ───────────────┐            tests/api/**
                 │                      │                 │
                 ▼                      │                 ▼
   src/fixtures/test.ts (mergeTests)    │    src/fixtures/data.fixture.ts / api.fixture.ts
     ├─ pages.fixture   page objects, ad blocking, 5xx monitor
     ├─ data.fixture    newUser / registeredUser (created + cleaned up per test)
     └─ api.fixture     ApiClient, UserApi, ProductApi
                 │                                        │
                 ▼                                        ▼
   src/pages  ──► src/components                 src/api ──► src/api/schemas (Ajv)
   (one class per page)  (header, cart modal,     (typed endpoint wrappers over
                          sidebar, cart table)     Playwright APIRequestContext)
                 │                                        │
                 └──────────► src/test-data, src/utils, src/config/env ◄──┘
```

Design decisions:

- **Page Object Model with components.** Pages expose locators and intent-level actions
  (`productsPage.addToCartAndContinue(id)`); assertions stay in the specs. Repeated widgets (header nav,
  cart modal, category sidebar, cart table) are components shared between pages.
- **Locator priority:** `getByRole` → `getByLabel` / `getByPlaceholder` → `getByTestId` (mapped to the site's
  own `data-qa` attributes via `testIdAttribute`) → scoped CSS only where the site offers nothing better.
  No XPath.
- **Fixtures, not hooks.** Test users are created through the API by a fixture and deleted in its
  teardown, so every test owns its data and tests run fully parallel without shared mutable state.
  `authenticatedUser` logs in through the UI on top of an API-created account.
- **API layer.** `ApiClient` wraps `APIRequestContext`, records response time and parses the JSON body
  (the site always answers HTTP 200 with `text/html`; see [limitations](#known-site-limitations)).
  `UserApi` / `ProductApi` expose one method per documented endpoint.
- **Custom matchers** (`src/utils/apiMatchers.ts`): `toHaveResponseCode`, `toMatchSchema`, `toRespondWithin`.
- **No hard-coded waits.** Synchronisation uses web-first assertions and load states. ESLint enforces
  `no-wait-for-timeout`, `no-force-option`, `no-skipped-test` and `no-focused-test`.

## Tech stack

| Concern                           | Tool                                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| Test runner, browsers, API client | `@playwright/test` 1.64 (`APIRequestContext` for API tests)         |
| Language                          | TypeScript 6 (strict, `noUncheckedIndexedAccess`)                   |
| Schema validation                 | Ajv 8 + ajv-formats (JSON Schema draft-07)                          |
| Configuration                     | dotenv (`.env`, `.env.<TEST_ENV>`)                                  |
| Test data                         | Typed JSON files + a data factory for unique users                  |
| Reporting                         | Playwright HTML, JSON, JUnit, blob (CI merge), GitHub annotations   |
| Code quality                      | ESLint 10 (typescript-eslint, eslint-plugin-playwright), Prettier 3 |
| CI/CD                             | GitHub Actions                                                      |

## Folder structure

```
.
├── .github/workflows/playwright.yml   CI: quality gate → API + 5 browser jobs → merged report
├── playwright.config.ts               projects, reporters, timeouts, retries, failure artifacts
├── merge.config.ts                    merges CI blob reports into one HTML/JUnit report
├── .env.example                       every supported environment variable, documented
├── src
│   ├── api
│   │   ├── ApiClient.ts               request wrapper: JSON parsing, timing, error pages
│   │   ├── ProductApi.ts              productsList, brandsList, searchProduct
│   │   ├── UserApi.ts                 createAccount, verifyLogin, getUserDetailByEmail, update/delete
│   │   └── schemas/*.schema.json      response contracts
│   ├── components                     HeaderNav, CartModal, CategorySidebar, CartTable
│   ├── config/env.ts                  validated, typed environment configuration
│   ├── fixtures
│   │   ├── api.fixture.ts             API clients
│   │   ├── data.fixture.ts            per-test users with automatic cleanup
│   │   ├── pages.fixture.ts           page objects, ad blocking, server-error monitor
│   │   └── test.ts                    merged `test` / `expect` used by UI specs
│   ├── pages                          one page object per page
│   ├── test-data                      products, catalogue, checkout, contact JSON + types
│   └── utils                          data factory, schema validator, matchers, logger, helpers
└── tests
    ├── api                            *.api.spec.ts
    └── ui
        ├── authentication             homepage, registration, login, session
        ├── products                   listing, details, search, categories & brands, reviews
        ├── cart
        ├── checkout
        └── contact
```

## Installation

Prerequisites: Node.js 20 or newer (CI uses the version in `.nvmrc`, 22) and npm.

```bash
npm install
```

```bash
npx playwright install
```

On Linux CI images use `npx playwright install --with-deps` to also install system libraries.

## Configuration

Copy `.env.example` to `.env` and adjust as needed. All values are optional; defaults target the public site.

| Variable                     | Default                              | Purpose                                           |
| ---------------------------- | ------------------------------------ | ------------------------------------------------- |
| `TEST_ENV`                   | `production`                         | Also loads `.env.<TEST_ENV>` if present           |
| `BASE_URL`                   | `https://automationexercise.com`     | UI base URL                                       |
| `API_BASE_URL`               | `https://automationexercise.com/api` | API base URL                                      |
| `TEST_USER_PASSWORD`         | random per user                      | Fixed password for generated users                |
| `API_RESPONSE_TIME_LIMIT_MS` | `3000`                               | Budget used by `toRespondWithin`                  |
| `BLOCK_THIRD_PARTY_ADS`      | `true`                               | Abort ad/consent hosts that overlay the page      |
| `STUB_PRODUCT_IMAGES`        | `true`                               | Serve product pictures as a local placeholder     |
| `LOG_LEVEL`                  | `info`                               | `debug`, `info`, `warn`, `error`                  |
| `WORKERS`                    | 4 locally, 2 on CI                   | Parallel workers                                  |
| `RETRIES`                    | 1 locally, 2 on CI                   | Retries; retried passes are reported as **flaky** |

Precedence: real environment variables → `.env.<TEST_ENV>` → `.env` → defaults. Values are validated at
start-up (invalid URLs or numbers fail fast). `.env` files are git-ignored; no credentials are committed.
Test accounts are generated per test with unique `@example.com` addresses and are deleted afterwards.

## Executing tests

| Command                                                  | What it runs                                        |
| -------------------------------------------------------- | --------------------------------------------------- |
| `npm test`                                               | Everything: API + all 5 browser projects            |
| `npm run test:ui`                                        | UI tests on every browser project                   |
| `npm run test:api`                                       | API tests only                                      |
| `npm run test:smoke`                                     | Tests tagged `@smoke`                               |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | One desktop browser                                 |
| `npm run test:mobile`                                    | Pixel 7 (Chromium) and iPhone 14 (WebKit) emulation |
| `npm run test:headed`                                    | UI tests in a visible Chromium window               |
| `npm run test:debug`                                     | UI tests in Chromium with the Playwright Inspector  |
| `npm run test:ui-mode`                                   | Playwright UI mode (watch, time-travel)             |
| `npm run lint` / `lint:fix`                              | ESLint                                              |
| `npm run format` / `format:check`                        | Prettier                                            |
| `npm run typecheck`                                      | `tsc --noEmit`                                      |

Any Playwright CLI option can be appended after `--`:

```bash
npm run test:chromium -- tests/ui/cart --grep "remove"
```

```bash
npx playwright test --project=webkit --workers=2 --retries=0
```

## Reports

| Report | Location                              | When                                                    |
| ------ | ------------------------------------- | ------------------------------------------------------- |
| HTML   | `reports/html`                        | Local runs (`npm run report` opens it)                  |
| JSON   | `reports/json/results.json`           | Local runs; also holds run metadata (environment, URLs) |
| JUnit  | `reports/junit/results.xml`           | Always (test names include the project)                 |
| Blob   | `reports/blob/report-<REPORT_ID>.zip` | CI only; merged by `npm run report:merge`               |

Failure evidence is written to `test-results/`: a full-page **screenshot** and **video** for every failing
test, and a full **trace** (DOM snapshots, network, console) on the first retry. All of these are attached
to the HTML report.

Tests that hit a 5xx response from the site carry a `site-server-error` annotation listing the failing
URLs, so infrastructure failures can be told apart from functional defects in the report.

Notes:

- Passing `--reporter=...` on the command line **replaces** the configured reporters for that run.
- The blob reporter empties `reports/blob` at the start of every run. On CI each job uploads its own blob,
  so this is harmless; to merge locally, copy each run's blob aside before starting the next run.
- The HTML report's "Metadata" panel shows git commit details only; the custom metadata
  (environment, base URLs) is stored in the JSON report.

## Debugging

- **Inspector:** `npm run test:debug -- -g "test title"` pauses at each action with a live locator picker.
- **UI mode:** `npm run test:ui-mode` to run, filter and time-travel through tests.
- **Traces:** open a recorded trace with `npx playwright show-trace test-results/<test-folder>/trace.zip`,
  or click the trace in the HTML report. Force a trace for every test with `--trace=on`.
- **Headed run:** `npm run test:headed`, optionally with `--workers=1`.
- **Verbose logs:** `LOG_LEVEL=debug` prints API calls and fixture set-up/teardown.
- **Locators:** `npx playwright codegen https://automationexercise.com` to explore the page.

## CI/CD

`.github/workflows/playwright.yml` runs on pushes and pull requests to `main`, nightly at 03:00 UTC, and
manually (`workflow_dispatch` with an optional `grep` filter such as `@smoke`).

1. **quality** - `npm ci`, ESLint, Prettier check, TypeScript check.
2. **api-tests** - the API project (no browser download).
3. **ui-tests** - a matrix job per project (`chromium`, `firefox`, `webkit`, `mobile-chrome`,
   `mobile-safari`) with `fail-fast: false`; each installs only the browser it needs.
4. **report** - downloads every blob report and publishes a single merged **HTML report** and merged
   JUnit file as artifacts, even when tests failed.

Each test job uploads its blob report and JUnit results; failing jobs also upload `test-results/`
(screenshots, videos, traces). Optional repository **variables** `BASE_URL` / `API_BASE_URL` and the
**secret** `TEST_USER_PASSWORD` are passed through the environment. The workflow has read-only repository
permissions, and the manual `grep` input reaches the shell only through an environment variable, so it
cannot inject commands.

## Example scenarios

**UI** (`tests/ui`)

- Register a new account through the sign-up form and verify it through the API; reject a duplicate email;
  delete the logged-in account.
- Log in with valid credentials; reject invalid credentials; require email and password; log out.
- Search for "jean" and verify the exact matching products, cross-checked against the search API; an
  unmatched term shows no results.
- Filter by category (Women > Dress, Men > Jeans, Kids > Tops & Shirts) and by each of 8 brands.
- Product listing matches the products API order; product details pages; submit a review.
- Add products to the cart, verify price/quantity/total per row, re-add to increase quantity, remove items.
- Cart contents persist across navigation and after logging in.
- Checkout as a logged-in user: verify delivery and billing addresses against the account, review the
  order table, pay with a test card, download the invoice; payment is blocked without card details.
- Register during checkout and complete the order.
- Contact form: submit with an attachment, return home, required-field and email-format validation.

**API** (`tests/api`)

- `GET /productsList`, `GET /brandsList`: schema, response code and response time.
- `POST /productsList`, `PUT /brandsList`: documented `405` responses.
- `POST /searchProduct`: matches, no matches and missing parameter (`400`).
- Account lifecycle: create → verify login → get details → update → delete, plus duplicate email,
  invalid credentials, missing parameters and the documented `405` for `DELETE /verifyLogin`.

## Known site limitations

The tests assert what the site actually does; these behaviours were verified while building the suite.

- **API status codes:** every API response is HTTP 200 with `Content-Type: text/html`. The real status is
  the `responseCode` field in the JSON body, so tests assert `toHaveResponseCode()` on the body.
- **Consent overlay and ads:** a Google consent dialog and ad iframes cover the page and intercept clicks.
  With `BLOCK_THIRD_PARTY_ADS=true` (default) these hosts are aborted at the network level.
- **Late JavaScript binding:** jQuery click handlers (add to cart, review, contact submit) are attached by
  synchronous scripts at the end of the page, some behind a slow Google Maps script. Page objects wait
  for `DOMContentLoaded` (which fires only after those scripts have run) before such clicks; an earlier
  click silently does nothing.
- **Slow product images:** images come from `/get_product_picture/<id>`, generated by the origin. Under
  load single images take 15-45 s, so the `load` event can take over a minute, and the pending image
  requests hold the browser's connections so the site's own AJAX calls (add to cart, remove) queue
  behind them and time out. Navigation therefore waits for `domcontentloaded`, and with
  `STUB_PRODUCT_IMAGES=true` (default) product pictures are answered locally with a 1x1 placeholder.
  No test asserts on product images; set it to `false` to load the real pictures.
- **Cloudflare errors under load:** the shared public site intermittently returns HTTP 520 (origin error)
  and 503 ("heavy load / queue full"), more often with high parallelism. Workers are kept low and one
  retry is allowed locally (two on CI); such retries show up as **flaky**, never as clean passes, and are
  annotated with `site-server-error`.
- **Cart:** there is no quantity editor; re-adding a product increments its quantity. The cart survives
  login, and is emptied by logout and by placing an order.
- **Contact form:** only the email field is required, and success is shown client-side after a
  `confirm()` dialog; nothing proves server-side delivery.
- **Search** matches product names _and_ category names, not just names.
- **getUserDetailByEmail** does not return the mobile number that was submitted at registration.
- **Payment** is a demo form; tests use only the public test number `4111 1111 1111 1111`, never real details.

## Framework limitations

- **Firefox on this development machine:** Windows Smart App Control blocks Playwright's unsigned
  Firefox build (`spawn UNKNOWN`), so Firefox was only listed locally and is expected to run on CI.
  On other machines `npm run test:firefox` works normally.
- **CI not yet exercised on GitHub:** the workflow is schema-validated and a CI run was simulated locally
  (blob reports merged into one HTML report), but it has not run on GitHub runners. Cloudflare may treat
  datacenter IPs differently.
- **Orphaned test accounts:** cleanup runs in fixture teardown; if the site returns a 5xx at that moment
  the account stays behind (logged, not failed). Accounts use unique `@example.com` addresses and are
  never shared.
