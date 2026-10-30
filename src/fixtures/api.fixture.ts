import { test as base } from '@playwright/test';
import { ApiClient } from '@api/ApiClient';
import { ProductApi } from '@api/ProductApi';
import { UserApi } from '@api/UserApi';

export interface ApiFixtures {
  apiClient: ApiClient;
  userApi: UserApi;
  productApi: ProductApi;
}

/**
 * API-only fixtures. They depend solely on Playwright's `request` context, so API specs that import
 * this `test` never launch a browser.
 */
export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
  userApi: async ({ apiClient }, use) => {
    await use(new UserApi(apiClient));
  },
  productApi: async ({ apiClient }, use) => {
    await use(new ProductApi(apiClient));
  },
});

export { expect } from '@utils/apiMatchers';
