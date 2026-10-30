import type { Locator, Page } from '@playwright/test';

/** Site-wide top navigation. Link names carry an icon glyph, so names are matched as substrings. */
export class HeaderNav {
  readonly root: Locator;
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly testCasesLink: Locator;
  readonly apiTestingLink: Locator;
  readonly contactUsLink: Locator;
  readonly loggedInAs: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('banner');
    this.logo = this.root.getByRole('link', { name: 'Website for automation practice' });
    this.homeLink = this.root.getByRole('link', { name: 'Home' });
    this.productsLink = this.root.getByRole('link', { name: 'Products' });
    this.cartLink = this.root.getByRole('link', { name: 'Cart' });
    this.signupLoginLink = this.root.getByRole('link', { name: 'Signup / Login' });
    this.logoutLink = this.root.getByRole('link', { name: 'Logout' });
    this.deleteAccountLink = this.root.getByRole('link', { name: 'Delete Account' });
    this.testCasesLink = this.root.getByRole('link', { name: 'Test Cases' });
    this.apiTestingLink = this.root.getByRole('link', { name: 'API Testing' });
    this.contactUsLink = this.root.getByRole('link', { name: 'Contact us' });
    this.loggedInAs = this.root.getByRole('listitem').filter({ hasText: 'Logged in as' });
  }

  async goToProducts(): Promise<void> {
    await this.productsLink.click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async goToSignupLogin(): Promise<void> {
    await this.signupLoginLink.click();
  }

  async goToContactUs(): Promise<void> {
    await this.contactUsLink.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async deleteAccount(): Promise<void> {
    await this.deleteAccountLink.click();
  }
}
