import type { Download, Locator, Page } from '@playwright/test';
import type { PaymentCard } from '@test-data/types';
import { BasePage } from './BasePage';

/**
 * /payment and the resulting /payment_done/{amount} confirmation.
 * The site's payment form is a dummy: it accepts any well-formed values and charges nothing.
 * Only published test card numbers (see test-data/checkout.json) are ever used.
 */
export class PaymentPage extends BasePage {
  protected readonly path = '/payment';

  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payAndConfirmButton: Locator;

  readonly orderPlacedHeading: Locator;
  readonly orderConfirmedMessage: Locator;
  readonly downloadInvoiceLink: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    // Payment labels are not associated with their inputs; the site's data-qa hooks are used.
    this.nameOnCardInput = page.getByTestId('name-on-card');
    this.cardNumberInput = page.getByTestId('card-number');
    this.cvcInput = page.getByTestId('cvc');
    this.expiryMonthInput = page.getByTestId('expiry-month');
    this.expiryYearInput = page.getByTestId('expiry-year');
    this.payAndConfirmButton = page.getByRole('button', { name: 'Pay and Confirm Order' });

    this.orderPlacedHeading = page.getByTestId('order-placed');
    this.orderConfirmedMessage = page.getByText('Congratulations! Your order has been confirmed!');
    this.downloadInvoiceLink = page.getByRole('link', { name: 'Download Invoice' });
    this.continueButton = page.getByTestId('continue-button');
  }

  async fillCard(card: PaymentCard): Promise<void> {
    await this.nameOnCardInput.fill(card.nameOnCard);
    await this.cardNumberInput.fill(card.cardNumber);
    await this.cvcInput.fill(card.cvc);
    await this.expiryMonthInput.fill(card.expiryMonth);
    await this.expiryYearInput.fill(card.expiryYear);
  }

  async payAndConfirm(card: PaymentCard): Promise<void> {
    await this.fillCard(card);
    await this.payAndConfirmButton.click();
  }

  async downloadInvoice(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadInvoiceLink.click();
    return downloadPromise;
  }
}
