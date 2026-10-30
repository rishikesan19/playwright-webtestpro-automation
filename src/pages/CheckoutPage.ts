import type { Locator, Page } from '@playwright/test';
import { CartTable } from '@components/CartTable';
import { BasePage } from './BasePage';

export type AddressType = 'delivery' | 'billing';

/** /checkout: address review, order review and comment, then "Place Order" to the payment step. */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';

  readonly addressDetailsHeading: Locator;
  readonly reviewOrderHeading: Locator;
  readonly orderTable: CartTable;
  readonly orderCommentInput: Locator;
  readonly placeOrderButton: Locator;
  private readonly addressBlocks: Record<AddressType, Locator>;

  constructor(page: Page) {
    super(page);
    this.addressDetailsHeading = page.getByRole('heading', { name: 'Address Details' });
    this.reviewOrderHeading = page.getByRole('heading', { name: 'Review Your Order' });
    this.orderTable = new CartTable(page);
    // The comment textarea has no label or placeholder.
    this.orderCommentInput = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
    this.addressBlocks = {
      delivery: page.locator('#address_delivery'),
      billing: page.locator('#address_invoice'),
    };
  }

  addressHeading(type: AddressType): Locator {
    return this.addressBlocks[type].getByRole('heading');
  }

  /** Address lines in display order, excluding the block heading. */
  addressLines(type: AddressType): Locator {
    return this.addressBlocks[type].getByRole('listitem').filter({ hasNot: this.page.getByRole('heading') });
  }

  async placeOrder(comment?: string): Promise<void> {
    if (comment) await this.orderCommentInput.fill(comment);
    await this.placeOrderButton.click();
  }
}
