import type { UserApi } from '@api/UserApi';
import type { UserAccount } from '@test-data/types';
import { buildUser } from '@utils/dataFactory';
import { createLogger } from '@utils/logger';
import { test as apiTest } from './api.fixture';

export interface DataFixtures {
  /** Unique user data that does NOT exist on the site yet (for registration flows). Cleaned up after. */
  newUser: UserAccount;
  /** Unique user already registered through the API before the test starts. Deleted after the test. */
  registeredUser: UserAccount;
}

const log = createLogger('test-data');

/**
 * Teardown must never mask the real test result, so cleanup failures are logged, not thrown.
 * A 404 is expected when the test itself deleted the account (e.g. a "delete account" scenario).
 */
async function deleteUserQuietly(userApi: UserApi, user: UserAccount): Promise<void> {
  try {
    const { body } = await userApi.deleteAccount(user.email, user.password);
    if (body.responseCode === 200) log.debug(`Deleted test user ${user.email}`);
    else if (body.responseCode !== 404) log.warn(`Cleanup of ${user.email} returned ${body.responseCode}`);
  } catch (error) {
    log.error(`Cleanup of ${user.email} failed`, error);
  }
}

export const test = apiTest.extend<DataFixtures>({
  newUser: async ({ userApi }, use) => {
    const user = buildUser();
    await use(user);
    await deleteUserQuietly(userApi, user);
  },

  registeredUser: async ({ userApi }, use) => {
    const user = buildUser();
    const { body } = await userApi.createAccount(user);
    if (body.responseCode !== 201) {
      throw new Error(`Could not create test user ${user.email}: ${body.responseCode} ${body.message ?? ''}`);
    }
    log.debug(`Created test user ${user.email}`);
    await use(user);
    await deleteUserQuietly(userApi, user);
  },
});

export { expect } from '@utils/apiMatchers';
