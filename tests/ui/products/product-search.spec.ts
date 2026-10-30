import { test, expect } from '@fixtures/test';
import { catalogue } from '@test-data/index';

test.describe('Product search', () => {
  test('finds products matching the search term @smoke', async ({ page, productsPage }) => {
    const { term, expectedProducts } = catalogue.search;

    await productsPage.open();
    await productsPage.search(term);

    await expect(page).toHaveURL(new RegExp(`/products\\?search=${term}$`));
    await expect(productsPage.listingTitle).toHaveText('Searched Products', { ignoreCase: true });
    await expect(productsPage.productNames).toHaveText(expectedProducts);
  });

  // The site matches on product name AND category (e.g. "top" returns "Little Girls Mr. Panda Shirt"
  // from "Kids > Tops & Shirts"), so the documented search API is the oracle rather than a name filter.
  for (const term of ['top', 'tshirt', 'dress']) {
    test(`results for "${term}" match the search API`, async ({ productsPage, productApi }) => {
      const { body } = await productApi.searchProducts(term);
      const expectedNames = (body.products ?? []).map((product) => product.name);
      expect(expectedNames.length, `API should return results for "${term}"`).toBeGreaterThan(0);

      await productsPage.open();
      await productsPage.search(term);

      await expect(productsPage.productNames).toHaveText(expectedNames);
    });
  }

  test('shows no products for a term with no matches', async ({ productsPage }) => {
    await productsPage.open();
    await productsPage.search(catalogue.search.unmatchedTerm);

    await expect(productsPage.listingTitle).toHaveText('Searched Products', { ignoreCase: true });
    await expect(productsPage.productCards).toHaveCount(0);
  });
});
