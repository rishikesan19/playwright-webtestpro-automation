import { env } from '@config/env';
import { test, expect } from '@fixtures/api.fixture';
import { products } from '@test-data/index';

test.describe('API 1-2: /api/productsList', () => {
  test('GET returns the full product catalogue @smoke', async ({ productApi }) => {
    const response = await productApi.getAllProducts();

    expect(response).toHaveResponseCode(200);
    expect(response).toMatchSchema('product-list');
    expect(response).toRespondWithin(env.apiResponseTimeLimitMs);

    const catalogue = response.body.products ?? [];
    expect(catalogue.length).toBeGreaterThan(0);
    expect(new Set(catalogue.map((product) => product.id)).size, 'product ids are unique').toBe(
      catalogue.length,
    );
  });

  test('GET returns the expected details for known products', async ({ productApi }) => {
    const { body } = await productApi.getAllProducts();

    for (const expected of Object.values(products)) {
      const [usertype, category] = expected.category.split(' > ');
      expect(body.products, `catalogue should contain "${expected.name}"`).toContainEqual({
        id: expected.id,
        name: expected.name,
        price: expected.price,
        brand: expected.brand,
        category: { usertype: { usertype }, category },
      });
    }
  });

  test('POST is rejected as an unsupported method', async ({ productApi }) => {
    const response = await productApi.postToAllProducts();

    expect(response).toHaveResponseCode(405);
    expect(response).toMatchSchema('message');
    expect(response.body.message).toBe('This request method is not supported.');
  });
});
