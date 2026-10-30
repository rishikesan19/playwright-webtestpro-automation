import { test, expect } from '@fixtures/test';

test.describe('User registration', () => {
  test('registers a new user through the signup form @smoke', async ({
    homePage,
    loginPage,
    signupPage,
    userApi,
    newUser,
  }) => {
    await homePage.open();
    await homePage.header.goToSignupLogin();
    await expect(loginPage.signupHeading).toBeVisible();

    await loginPage.startSignup(newUser.name, newUser.email);
    await expect(signupPage.accountInfoHeading).toBeVisible();
    await expect(signupPage.nameInput).toHaveValue(newUser.name);
    await expect(signupPage.emailInput).toHaveValue(newUser.email);

    await signupPage.createAccount(newUser, { newsletter: true, specialOffers: true });
    await expect(signupPage.accountCreatedHeading).toBeVisible();

    await signupPage.continueAfterAccountCreated();
    await expect(signupPage.header.loggedInAs).toHaveText(`Logged in as ${newUser.name}`);

    // Cross-layer check: what the UI submitted is what the backend persisted.
    const { body } = await userApi.getUserDetailByEmail(newUser.email);
    expect(body.responseCode).toBe(200);
    expect(body.user).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      title: newUser.title,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      company: newUser.company,
      address1: newUser.address1,
      address2: newUser.address2,
      country: newUser.country,
      state: newUser.state,
      city: newUser.city,
      zipcode: newUser.zipcode,
    });
  });

  test('rejects signup with an email that is already registered', async ({
    page,
    loginPage,
    signupPage,
    registeredUser,
  }) => {
    await loginPage.open();
    await loginPage.startSignup('Duplicate Signup', registeredUser.email);

    await expect(loginPage.signupError).toBeVisible();
    await expect(signupPage.accountInfoHeading).toBeHidden();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test('deletes the logged-in account', async ({
    page,
    homePage,
    accountDeletedPage,
    userApi,
    authenticatedUser,
  }) => {
    await homePage.open();
    await homePage.header.deleteAccount();

    await expect(accountDeletedPage.heading).toBeVisible();
    await accountDeletedPage.continueButton.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(homePage.header.signupLoginLink).toBeVisible();

    const { body } = await userApi.verifyLogin({
      email: authenticatedUser.email,
      password: authenticatedUser.password,
    });
    expect(body.responseCode, 'deleted account must no longer authenticate').toBe(404);
  });
});
