import { test, expect } from '@fixtures/test';
import { products } from '@test-data/index';

test.describe('Session and unauthenticated behaviour', () => {
  test('logs out and returns to the login page @smoke', async ({
    page,
    homePage,
    loginPage,
    authenticatedUser,
  }) => {
    await homePage.open();
    await expect(homePage.header.loggedInAs).toHaveText(`Logged in as ${authenticatedUser.name}`);

    await homePage.header.logout();

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.loginHeading).toBeVisible();
    await expect(loginPage.header.loggedInAs).toBeHidden();
    await expect(loginPage.header.logoutLink).toBeHidden();
    await expect(loginPage.header.signupLoginLink).toBeVisible();
  });

  test('anonymous visitors see only public account links', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.header.signupLoginLink).toBeVisible();
    await expect(homePage.header.loggedInAs).toBeHidden();
    await expect(homePage.header.logoutLink).toBeHidden();
    await expect(homePage.header.deleteAccountLink).toBeHidden();
  });

  test('anonymous visitors are asked to register or log in at checkout', async ({
    page,
    productsPage,
    cartPage,
    loginPage,
  }) => {
    await productsPage.open();
    await productsPage.addToCart(products.blueTop.name);
    await productsPage.cartModal.viewCart();

    await cartPage.proceedToCheckout();
    await expect(cartPage.checkoutModal).toBeVisible();
    await expect(cartPage.checkoutModal).toContainText('Register / Login account to proceed on checkout.');

    await cartPage.checkoutModalLoginLink.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.loginHeading).toBeVisible();
  });
});
