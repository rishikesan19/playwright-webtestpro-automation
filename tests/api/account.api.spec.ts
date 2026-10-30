import { env } from '@config/env';
// data.fixture builds on the API fixtures (no browser) and adds generated, self-cleaning users.
import { test, expect } from '@fixtures/data.fixture';
import type { UserDetail } from '@api/UserApi';
import type { UserAccount } from '@test-data/types';
import { buildUser, uniqueEmail } from '@utils/dataFactory';

/** The fields getUserDetailByEmail echoes back (it does not return the password or mobile number). */
function toUserDetail(user: UserAccount): Omit<UserDetail, 'id'> {
  return {
    name: user.name,
    email: user.email,
    title: user.title,
    birth_day: user.birthDay,
    birth_month: user.birthMonth,
    birth_year: user.birthYear,
    first_name: user.firstName,
    last_name: user.lastName,
    company: user.company,
    address1: user.address1,
    address2: user.address2,
    country: user.country,
    state: user.state,
    city: user.city,
    zipcode: user.zipcode,
  };
}

test.describe('API 11-14: account lifecycle', () => {
  // The fixture-generated account is deleted in teardown even if a step below fails.
  test('creates, reads, updates and deletes an account @smoke', async ({ userApi, newUser }) => {
    await test.step('POST /createAccount registers the user', async () => {
      const response = await userApi.createAccount(newUser);
      expect(response).toHaveResponseCode(201);
      expect(response).toMatchSchema('message');
      expect(response.body.message).toBe('User created!');
      expect(response).toRespondWithin(env.apiResponseTimeLimitMs);
    });

    await test.step('POST /verifyLogin accepts the new credentials', async () => {
      const response = await userApi.verifyLogin({ email: newUser.email, password: newUser.password });
      expect(response).toHaveResponseCode(200);
      expect(response.body.message).toBe('User exists!');
    });

    await test.step('GET /getUserDetailByEmail returns the stored details', async () => {
      const response = await userApi.getUserDetailByEmail(newUser.email);
      expect(response).toHaveResponseCode(200);
      expect(response).toMatchSchema('user-detail');
      expect(response.body.user).toMatchObject(toUserDetail(newUser));
    });

    const updatedUser: UserAccount = {
      ...newUser,
      firstName: 'Updated',
      company: 'WebTestPro Updated Ltd',
      address1: '99 Updated Road',
      city: 'Edinburgh',
    };

    await test.step('PUT /updateAccount changes the stored details', async () => {
      const response = await userApi.updateAccount(updatedUser);
      expect(response).toHaveResponseCode(200);
      expect(response).toMatchSchema('message');
      expect(response.body.message).toBe('User updated!');
    });

    await test.step('GET /getUserDetailByEmail reflects the update', async () => {
      const response = await userApi.getUserDetailByEmail(newUser.email);
      expect(response).toHaveResponseCode(200);
      expect(response.body.user).toMatchObject(toUserDetail(updatedUser));
    });

    await test.step('DELETE /deleteAccount removes the account', async () => {
      const response = await userApi.deleteAccount(newUser.email, newUser.password);
      expect(response).toHaveResponseCode(200);
      expect(response).toMatchSchema('message');
      expect(response.body.message).toBe('Account deleted!');
    });

    await test.step('the deleted account can no longer log in or be read', async () => {
      const login = await userApi.verifyLogin({ email: newUser.email, password: newUser.password });
      expect(login).toHaveResponseCode(404);
      const detail = await userApi.getUserDetailByEmail(newUser.email);
      expect(detail).toHaveResponseCode(404);
    });
  });
});

test.describe('API 7-10: /api/verifyLogin', () => {
  test('POST with valid credentials confirms the user exists', async ({ userApi, registeredUser }) => {
    const response = await userApi.verifyLogin({
      email: registeredUser.email,
      password: registeredUser.password,
    });

    expect(response).toHaveResponseCode(200);
    expect(response).toMatchSchema('message');
    expect(response.body.message).toBe('User exists!');
    expect(response).toRespondWithin(env.apiResponseTimeLimitMs);
  });

  const missingParameterCases = [
    { scenario: 'email', credentials: { password: 'Any-Password-1' } },
    { scenario: 'password', credentials: { email: 'someone@example.com' } },
  ];

  for (const { scenario, credentials } of missingParameterCases) {
    test(`POST without ${scenario} is rejected as a bad request`, async ({ userApi }) => {
      const response = await userApi.verifyLogin(credentials);

      expect(response).toHaveResponseCode(400);
      expect(response).toMatchSchema('message');
      expect(response.body.message).toBe(
        'Bad request, email or password parameter is missing in POST request.',
      );
    });
  }

  test('POST with a wrong password reports user not found', async ({ userApi, registeredUser }) => {
    const response = await userApi.verifyLogin({
      email: registeredUser.email,
      password: 'Definitely-Not-The-Password-1',
    });

    expect(response).toHaveResponseCode(404);
    expect(response.body.message).toBe('User not found!');
  });

  test('POST with an unregistered email reports user not found', async ({ userApi }) => {
    const response = await userApi.verifyLogin({
      email: uniqueEmail('wtp.unknown'),
      password: 'Any-Password-1',
    });

    expect(response).toHaveResponseCode(404);
    expect(response).toMatchSchema('message');
    expect(response.body.message).toBe('User not found!');
  });

  test('DELETE is rejected as an unsupported method', async ({ apiClient }) => {
    const response = await apiClient.delete('verifyLogin');

    expect(response).toHaveResponseCode(405);
    expect(response).toMatchSchema('message');
    expect(response.body.message).toBe('This request method is not supported.');
  });
});

test.describe('Account negative scenarios', () => {
  test('createAccount rejects an email that is already registered', async ({ userApi, registeredUser }) => {
    const response = await userApi.createAccount(buildUser({ email: registeredUser.email }));

    expect(response).toHaveResponseCode(400);
    expect(response).toMatchSchema('message');
    expect(response.body.message).toBe('Email already exists!');
  });

  test('getUserDetailByEmail reports an unknown email as not found', async ({ userApi }) => {
    const response = await userApi.getUserDetailByEmail(uniqueEmail('wtp.unknown'));

    expect(response).toHaveResponseCode(404);
    expect(response).toMatchSchema('message');
    expect(response.body.message).toBe('Account not found with this email, try another email!');
  });

  test('deleteAccount refuses a wrong password and keeps the account', async ({
    userApi,
    registeredUser,
  }) => {
    const response = await userApi.deleteAccount(registeredUser.email, 'Definitely-Not-The-Password-1');

    expect(response).toHaveResponseCode(404);
    expect(response.body.message).toBe('Account not found!');

    const stillThere = await userApi.verifyLogin({
      email: registeredUser.email,
      password: registeredUser.password,
    });
    expect(stillThere, 'account must survive a rejected delete').toHaveResponseCode(200);
  });
});
