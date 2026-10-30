import { mergeTests } from '@playwright/test';
import type { UserAccount } from '@test-data/types';
import { test as dataTest } from './data.fixture';
import { test as pagesTest } from './pages.fixture';

export interface AuthFixtures {
  /** A fresh API-registered user, logged in through the UI on the test's own page. */
  authenticatedUser: UserAccount;
}

/**
 * The single entry point for UI specs: page objects + API clients + generated test data.
 *
 *   import { test, expect } from '@fixtures/test';
 */
export const test = mergeTests(pagesTest, dataTest).extend<AuthFixtures>({
  authenticatedUser: async ({ registeredUser, loginPage }, use) => {
    await loginPage.open();
    await loginPage.login(registeredUser.email, registeredUser.password);
    // Synchronise on the logged-in header before handing control to the test.
    await loginPage.header.loggedInAs.waitFor();
    await use(registeredUser);
  },
});

export { expect } from '@utils/apiMatchers';
