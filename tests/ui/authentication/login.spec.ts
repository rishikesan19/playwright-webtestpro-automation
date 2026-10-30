import { test, expect } from '@fixtures/test';
import { uniqueEmail } from '@utils/dataFactory';
import { isValueMissing } from '@utils/formValidation';
import type { UserAccount } from '@test-data/types';

test.describe('Login', () => {
  test('logs in with valid credentials @smoke', async ({ page, loginPage, registeredUser }) => {
    await loginPage.open();
    await expect(loginPage.loginHeading).toBeVisible();

    await loginPage.login(registeredUser.email, registeredUser.password);

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.header.loggedInAs).toHaveText(`Logged in as ${registeredUser.name}`);
    await expect(loginPage.header.logoutLink).toBeVisible();
    await expect(loginPage.header.deleteAccountLink).toBeVisible();
    await expect(loginPage.header.signupLoginLink).toBeHidden();
  });

  const invalidCredentialCases: { scenario: string; emailFor: (user: UserAccount) => string }[] = [
    { scenario: 'a wrong password for an existing account', emailFor: (user) => user.email },
    { scenario: 'an email that is not registered', emailFor: () => uniqueEmail('wtp.unknown') },
  ];

  for (const { scenario, emailFor } of invalidCredentialCases) {
    test(`rejects ${scenario}`, async ({ page, loginPage, registeredUser }) => {
      const email = emailFor(registeredUser);

      await loginPage.open();
      await loginPage.login(email, 'Definitely-Not-The-Password-1');

      await expect(loginPage.loginError).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
      await expect(loginPage.header.loggedInAs).toBeHidden();
    });
  }

  test('requires email and password before submitting', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.loginButton.click();

    // Native HTML5 constraint validation blocks the request, so the page never navigates.
    await expect(page).toHaveURL(/\/login$/);
    expect(await isValueMissing(loginPage.loginEmailInput)).toBe(true);
    await expect(loginPage.loginError).toBeHidden();
  });
});
