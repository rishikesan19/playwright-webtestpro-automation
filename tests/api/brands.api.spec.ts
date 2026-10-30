import { env } from '@config/env';
import { test, expect } from '@fixtures/api.fixture';
import { catalogue } from '@test-data/index';

test.describe('API 3-4: /api/brandsList', () => {
  test('GET returns the brand list @smoke', async ({ productApi }) => {
    const response = await productApi.getAllBrands();

    expect(response).toHaveResponseCode(200);
    expect(response).toMatchSchema('brand-list');
    expect(response).toRespondWithin(env.apiResponseTimeLimitMs);

    const brandNames = new Set((response.body.brands ?? []).map((entry) => entry.brand));
    expect([...brandNames].sort()).toEqual([...catalogue.brands].sort());
  });

  // brandsList returns one entry per product (names repeat), so compare the distinct sets.
  test('lists exactly the brands used by the product catalogue', async ({ productApi }) => {
    const [brandsResponse, productsResponse] = await Promise.all([
      productApi.getAllBrands(),
      productApi.getAllProducts(),
    ]);

    const listedBrands = new Set((brandsResponse.body.brands ?? []).map((entry) => entry.brand));
    const productBrands = new Set((productsResponse.body.products ?? []).map((product) => product.brand));
    expect([...listedBrands].sort()).toEqual([...productBrands].sort());
  });

  test('PUT is rejected as an unsupported method', async ({ productApi }) => {
    const response = await productApi.putToAllBrands();

    expect(response).toHaveResponseCode(405);
    expect(response).toMatchSchema('message');
    expect(response.body.message).toBe('This request method is not supported.');
  });
});
