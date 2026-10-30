import type { UserAccount } from '@test-data/types';
import type { ApiBody, ApiClient, ApiResponse, FormFields } from './ApiClient';

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface UserDetailBody extends ApiBody {
  user?: UserDetail;
}

/** Maps the framework's camelCase model onto the documented form field names. */
export function toAccountForm(user: UserAccount): FormFields {
  return {
    name: user.name,
    email: user.email,
    password: user.password,
    title: user.title,
    birth_date: user.birthDay,
    birth_month: user.birthMonth,
    birth_year: user.birthYear,
    firstname: user.firstName,
    lastname: user.lastName,
    company: user.company,
    address1: user.address1,
    address2: user.address2,
    country: user.country,
    zipcode: user.zipcode,
    state: user.state,
    city: user.city,
    mobile_number: user.mobileNumber,
  };
}

/** Documented account endpoints (API 7-14 on https://automationexercise.com/api_list). */
export class UserApi {
  constructor(private readonly client: ApiClient) {}

  createAccount(user: UserAccount): Promise<ApiResponse> {
    return this.client.post('createAccount', toAccountForm(user));
  }

  updateAccount(user: UserAccount): Promise<ApiResponse> {
    return this.client.put('updateAccount', toAccountForm(user));
  }

  deleteAccount(email: string, password: string): Promise<ApiResponse> {
    return this.client.delete('deleteAccount', { email, password });
  }

  /** Pass a partial credential set to exercise the documented "missing parameter" behaviour. */
  verifyLogin(credentials: { email?: string; password?: string }): Promise<ApiResponse> {
    const form: FormFields = {};
    if (credentials.email !== undefined) form.email = credentials.email;
    if (credentials.password !== undefined) form.password = credentials.password;
    return this.client.post('verifyLogin', form);
  }

  getUserDetailByEmail(email: string): Promise<ApiResponse<UserDetailBody>> {
    return this.client.get<UserDetailBody>('getUserDetailByEmail', { email });
  }
}
