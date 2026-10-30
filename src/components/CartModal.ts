import type { Locator, Page } from '@playwright/test';

/** "Added!" confirmation shown after adding a product to the cart from any listing or detail page. */
export class CartModal {
  readonly root: Locator;
  readonly title: Locator;
  readonly viewCartLink: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    // Bootstrap modal without an ARIA dialog role, so the id is the only stable hook.
    this.root = page.locator('#cartModal');
    this.title = this.root.getByRole('heading', { name: 'Added!' });
    this.viewCartLink = this.root.getByRole('link', { name: 'View Cart' });
    this.continueShoppingButton = this.root.getByRole('button', { name: 'Continue Shopping' });
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await this.root.waitFor({ state: 'hidden' });
  }

  async viewCart(): Promise<void> {
    await this.viewCartLink.click();
  }
}
