import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { env } from './src/config/env';

const UI_TEST_DIR = './tests/ui';
const REPORT_TITLE = 'WebTestPro - automationexercise.com';

const sharedReporters: ReporterDescription[] = [
  ['list'],
  ['junit', { outputFile: './reports/junit/results.xml', includeProjectInTestName: true }],
];

// Locally: one HTML/JSON report per run. On CI every job emits a uniquely named blob that the
// workflow merges into a single HTML report across all browser jobs.
const reporters: ReporterDescription[] = env.isCI
  ? [
      ...sharedReporters,
      ['github'],
      ['blob', { outputDir: './reports/blob', fileName: `report-${process.env.REPORT_ID ?? 'ci'}.zip` }],
    ]
  : [
      ...sharedReporters,
      ['html', { outputFolder: './reports/html', open: 'never', title: REPORT_TITLE }],
      ['json', { outputFile: './reports/json/results.json' }],
    ];

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  // The site under test is slow and ad-heavy; allow realistic headroom per test.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: env.isCI,
  // The public site intermittently returns Cloudflare 520s. Retried passes are reported as "flaky",
  // never as clean passes, so instability stays visible in the report.
  retries: env.retries ?? (env.isCI ? 2 : 1),
  // automationexercise.com is a shared public site behind Cloudflare; higher concurrency triggers
  // intermittent origin errors (HTTP 520), so concurrency is kept deliberately low.
  workers: env.workers ?? (env.isCI ? 2 : 4),
  reporter: reporters,
  // Recorded in the JSON report so every run states what it ran against. The HTML report's
  // "Metadata" panel shows git commit details (captureGitInfo) rather than these custom keys.
  metadata: {
    environment: env.testEnv,
    baseUrl: env.baseUrl,
    apiBaseUrl: env.apiBaseUrl,
  },
  captureGitInfo: { commit: true },
  use: {
    baseURL: env.baseUrl,
    // The site exposes stable `data-qa` hooks; map getByTestId() onto them.
    testIdAttribute: 'data-qa',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // Failure evidence: full-page screenshot and video only when a test fails, plus a full
    // trace (DOM snapshots, network, console) on the first retry to diagnose intermittent failures.
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'chromium',
      testDir: UI_TEST_DIR,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: UI_TEST_DIR,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: UI_TEST_DIR,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      testDir: UI_TEST_DIR,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      testDir: UI_TEST_DIR,
      use: { ...devices['iPhone 14'] },
    },
  ],
});
