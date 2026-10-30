import { env } from '@config/env';
import { test, expect } from '@fixtures/api.fixture';

/**
 * Pins down transport-level behaviour that differs from REST conventions, so any change to the
 * API contract is detected deliberately instead of surfacing as confusing failures elsewhere.
 */
test.describe('API transport contract (documented site limitations)', () => {
  test('error outcomes are reported in the body while HTTP status stays 200', async ({ productApi }) => {
    const unsupportedMethod = await productApi.postToAllProducts();

    test.info().annotations.push({
      type: 'site-limitation',
      description: 'The API returns HTTP 200 for every outcome; the real status is body.responseCode.',
    });
    expect(unsupportedMethod.httpStatus).toBe(200);
    expect(unsupportedMethod.body.responseCode).toBe(405);
  });

  test('JSON bodies are served with a text/html content type', async ({ productApi }) => {
    const response = await productApi.getAllBrands();

    test.info().annotations.push({
      type: 'site-limitation',
      description: 'JSON is mislabelled as text/html, so the client parses the body text explicitly.',
    });
    expect(response.contentType).toContain('text/html');
    expect(response).toMatchSchema('brand-list');
  });

  test('read-only endpoints respond within the configured time budget', async ({ productApi }) => {
    const responses = await Promise.all([
      productApi.getAllProducts(),
      productApi.getAllBrands(),
      productApi.searchProducts('top'),
    ]);

    for (const response of responses) {
      expect(response).toRespondWithin(env.apiResponseTimeLimitMs);
    }
  });
});
