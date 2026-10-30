import { test as base } from '@playwright/test';
import { env } from '@config/env';
import { AccountDeletedPage } from '@pages/AccountDeletedPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { ContactUsPage } from '@pages/ContactUsPage';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { PaymentPage } from '@pages/PaymentPage';
import { ProductDetailsPage } from '@pages/ProductDetailsPage';
import { ProductsPage } from '@pages/ProductsPage';
import { SignupPage } from '@pages/SignupPage';
import { createLogger } from '@utils/logger';
import { blockThirdPartyAds } from '@utils/networkBlocker';

const log = createLogger('site-health');

interface InfrastructureFixtures {
  /** Auto fixture: records 5xx responses from the application so site outages are visible in reports. */
  siteErrorMonitor: void;
}

export interface PageFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountDeletedPage: AccountDeletedPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  contactUsPage: ContactUsPage;
}

export const test = base.extend<PageFixtures & InfrastructureFixtures>({
  // Overriding `context` guarantees the route is registered before the first page is created.
  context: async ({ context }, use) => {
    if (env.blockThirdPartyAds) await blockThirdPartyAds(context);
    await use(context);
  },

  // The public site intermittently returns Cloudflare 520 pages under load. Annotating the test
  // separates "the site was down" from "the test found a defect" when triaging a failure.
  siteErrorMonitor: [
    async ({ page }, use, testInfo) => {
      const serverErrors: string[] = [];
      page.on('response', (response) => {
        if (response.status() >= 500 && response.url().startsWith(env.baseUrl)) {
          serverErrors.push(`HTTP ${response.status()} ${response.request().method()} ${response.url()}`);
        }
      });
      await use();
      if (serverErrors.length > 0) {
        testInfo.annotations.push({ type: 'site-server-error', description: serverErrors.join('\n') });
        log.warn(`${testInfo.title}: application returned ${serverErrors.length} server error(s)`);
      }
    },
    { auto: true },
  ],

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  accountDeletedPage: async ({ page }, use) => use(new AccountDeletedPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
  contactUsPage: async ({ page }, use) => use(new ContactUsPage(page)),
});
