import { test, expect } from '@fixtures/test';

test.describe('Product listing', () => {
  test('shows every catalogue product with name, price and details link @smoke', async ({
    page,
    homePage,
    productsPage,
    productApi,
  }) => {
    const { body } = await productApi.getAllProducts();
    const catalogueSize = body.products?.length ?? 0;
    expect(catalogueSize, 'API catalogue should not be empty').toBeGreaterThan(0);

    await homePage.open();
    await homePage.header.goToProducts();

    await expect(page).toHaveURL(/\/products$/);
    await expect(productsPage.listingTitle).toHaveText('All Products', { ignoreCase: true });
    // The UI listing and the public API are served from the same catalogue.
    await expect(productsPage.productCards).toHaveCount(catalogueSize);

    const firstCard = productsPage.productCards.first();
    await expect(firstCard.locator('.productinfo p')).not.toBeEmpty();
    await expect(firstCard.locator('.productinfo h2')).toHaveText(/^Rs\. \d+$/);
    await expect(firstCard.getByRole('link', { name: 'View Product' })).toBeVisible();
  });

  test('lists products in the same order as the products API', async ({ productsPage, productApi }) => {
    const { body } = await productApi.getAllProducts();
    const apiNames = (body.products ?? []).map((product) => product.name);

    await productsPage.open();

    await expect(productsPage.productNames).toHaveText(apiNames);
  });
});
