import type { Locator, Page } from '@playwright/test';
import { CartTable } from '@components/CartTable';
import { BasePage } from './BasePage';

/**
 * /view_cart. The site offers no in-cart quantity editing (the quantity cell is a read-only
 * button); quantities are set on the product details page before adding.
 */
export class CartPage extends BasePage {
  protected readonly path = '/view_cart';

  readonly table: CartTable;
  readonly emptyCartMessage: Locator;
  readonly emptyCartProductsLink: Locator;
  readonly proceedToCheckoutButton: Locator;

  // Shown to anonymous users who try to check out.
  readonly checkoutModal: Locator;
  readonly checkoutModalLoginLink: Locator;
  readonly continueOnCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new CartTable(page);
    this.emptyCartMessage = page.getByText('Cart is empty!');
    this.emptyCartProductsLink = page.getByRole('link', { name: 'here', exact: true });
    // An <a> without href (no link role), wired up via JavaScript.
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');

    this.checkoutModal = page.locator('#checkoutModal');
    this.checkoutModalLoginLink = this.checkoutModal.getByRole('link', { name: 'Register / Login' });
    this.continueOnCartButton = this.checkoutModal.getByRole('button', { name: 'Continue On Cart' });
  }

  async removeProduct(productName: string): Promise<void> {
    const row = this.table.row(productName);
    await this.waitForPageScripts();
    await row.locator('.cart_quantity_delete').click();
    // Removal is an async XHR followed by a DOM update; wait for it so callers see a settled cart.
    await row.waitFor({ state: 'detached' });
  }

  async proceedToCheckout(): Promise<void> {
    await this.waitForPageScripts();
    await this.proceedToCheckoutButton.click();
  }
}
