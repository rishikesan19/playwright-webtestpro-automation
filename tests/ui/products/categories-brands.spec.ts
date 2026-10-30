import { test, expect } from '@fixtures/test';
import { catalogue } from '@test-data/index';

test.describe('Browse by category', () => {
  for (const category of Object.values(catalogue.categories)) {
    test(`opens ${category.group} > ${category.name} from the sidebar`, async ({
      page,
      homePage,
      productsPage,
    }) => {
      await homePage.open();
      await homePage.sidebar.openCategory(category.group, category.name);

      await expect(page).toHaveURL(new RegExp(`/category_products/${category.id}$`));
      await expect(productsPage.listingTitle).toHaveText(category.title, { ignoreCase: true });
      await expect(productsPage.productCards.first()).toBeVisible();
    });
  }

  test('switches between categories from different groups @smoke', async ({
    page,
    homePage,
    productsPage,
  }) => {
    const { womenDress, menJeans } = catalogue.categories;

    await homePage.open();
    await homePage.sidebar.openCategory(womenDress.group, womenDress.name);
    await expect(productsPage.listingTitle).toHaveText(womenDress.title, { ignoreCase: true });

    await productsPage.sidebar.openCategory(menJeans.group, menJeans.name);
    await expect(page).toHaveURL(new RegExp(`/category_products/${menJeans.id}$`));
    await expect(productsPage.listingTitle).toHaveText(menJeans.title, { ignoreCase: true });
  });
});

test.describe('Browse by brand', () => {
  for (const brand of catalogue.brands) {
    test(`lists every "${brand}" product advertised in the sidebar`, async ({ productsPage, productApi }) => {
      const { body } = await productApi.getAllProducts();
      const apiBrandCount = (body.products ?? []).filter((product) => product.brand === brand).length;

      await productsPage.open();
      const advertisedCount = await productsPage.sidebar.advertisedBrandCount(brand);
      await productsPage.sidebar.openBrand(brand);

      await expect(productsPage.listingTitle).toHaveText(`Brand - ${brand} Products`, { ignoreCase: true });
      await expect(productsPage.productCards).toHaveCount(advertisedCount);
      expect(advertisedCount, 'sidebar count should match the products API').toBe(apiBrandCount);
    });
  }
});
