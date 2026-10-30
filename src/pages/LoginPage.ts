import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /login hosts two independent forms: "Login to your account" and "New User Signup!". */
export class LoginPage extends BasePage {
  protected readonly path = '/login';

  readonly loginHeading: Locator;
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;

  readonly signupHeading: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly signupError: Locator;

  constructor(page: Page) {
    super(page);
    // Both forms reuse the "Email Address" placeholder, so each is scoped to its own container.
    const loginForm = page.locator('.login-form');
    const signupForm = page.locator('.signup-form');

    this.loginHeading = loginForm.getByRole('heading', { name: 'Login to your account' });
    this.loginEmailInput = loginForm.getByPlaceholder('Email Address');
    this.loginPasswordInput = loginForm.getByPlaceholder('Password');
    this.loginButton = loginForm.getByRole('button', { name: 'Login' });
    this.loginError = loginForm.getByText('Your email or password is incorrect!');

    this.signupHeading = signupForm.getByRole('heading', { name: 'New User Signup!' });
    this.signupNameInput = signupForm.getByPlaceholder('Name');
    this.signupEmailInput = signupForm.getByPlaceholder('Email Address');
    this.signupButton = signupForm.getByRole('button', { name: 'Signup' });
    this.signupError = signupForm.getByText('Email Address already exist!');
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(password);
    await this.loginButton.click();
  }

  /** Step one of registration; on success the site navigates to the account information form. */
  async startSignup(name: string, email: string): Promise<void> {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }
}
