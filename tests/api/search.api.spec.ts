import { env } from '@config/env';
import { test, expect } from '@fixtures/api.fixture';
import type { ApiProduct } from '@api/ProductApi';
import { catalogue } from '@test-data/index';

/** The search matches name or category, ignoring case and punctuation ("tshirt" finds "T-Shirt"). */
function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchesTerm(product: ApiProduct, term: string): boolean {
  const searchable = [product.name, product.category.category, product.category.usertype.usertype];
  return searchable.some((field) => normalise(field).includes(normalise(term)));
}

test.describe('API 5-6: /api/searchProduct', () => {
  for (const term of ['top', 'tshirt', 'jean']) {
    test(`POST search_product="${term}" returns only matching products`, async ({ productApi }) => {
      const response = await productApi.searchProducts(term);

      expect(response).toHaveResponseCode(200);
      expect(response).toMatchSchema('product-list');
      expect(response).toRespondWithin(env.apiResponseTimeLimitMs);

      const results = response.body.products ?? [];
      expect(results.length).toBeGreaterThan(0);
      const nonMatching = results.filter((product) => !matchesTerm(product, term)).map((p) => p.name);
      expect(nonMatching, `results unrelated to "${term}"`).toEqual([]);
    });
  }

  test('POST returns the documented example results for "jean" @smoke', async ({ productApi }) => {
    const response = await productApi.searchProducts(catalogue.search.term);

    expect(response).toHaveResponseCode(200);
    expect(response.body.products?.map((product) => product.name)).toEqual(catalogue.search.expectedProducts);
  });

  test('POST is case-insensitive', async ({ productApi }) => {
    const [lower, upper] = await Promise.all([
      productApi.searchProducts('jean'),
      productApi.searchProducts('JEAN'),
    ]);

    expect(upper).toHaveResponseCode(200);
    expect(upper.body.products).toEqual(lower.body.products);
  });

  test('POST with an unmatched term returns an empty list', async ({ productApi }) => {
    const response = await productApi.searchProducts(catalogue.search.unmatchedTerm);

    expect(response).toHaveResponseCode(200);
    expect(response).toMatchSchema('product-list');
    expect(response.body.products).toEqual([]);
  });

  test('POST without search_product is rejected as a bad request', async ({ productApi }) => {
    const response = await productApi.searchProducts();

    expect(response).toHaveResponseCode(400);
    expect(response).toMatchSchema('message');
    expect(response.body.message).toBe('Bad request, search_product parameter is missing in POST request.');
  });
});
