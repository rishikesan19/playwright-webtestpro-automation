import { test, expect } from '@fixtures/test';

test.describe('Home page', () => {
  test('loads successfully with navigation and featured products @smoke', async ({ page, homePage }) => {
    const response = await homePage.open();

    expect(response?.status(), 'home page HTTP status').toBe(200);
    await expect(page).toHaveTitle('Automation Exercise');
    await expect(homePage.header.logo).toBeVisible();
    await expect(homePage.carousel).toBeVisible();
    await expect(homePage.featuresItemsHeading).toBeVisible();
    await expect(homePage.sidebar.categoryHeading).toBeVisible();
    await expect(homePage.sidebar.brandsHeading).toBeVisible();
  });

  test('header links navigate to their pages', async ({ page, homePage }) => {
    await homePage.open();

    await homePage.header.goToProducts();
    await expect(page).toHaveURL(/\/products$/);

    await homePage.header.goToCart();
    await expect(page).toHaveURL(/\/view_cart$/);

    await homePage.header.goToSignupLogin();
    await expect(page).toHaveURL(/\/login$/);

    await homePage.header.goToContactUs();
    await expect(page).toHaveURL(/\/contact_us$/);
  });
});
