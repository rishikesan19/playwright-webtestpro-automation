import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Confirmation shown after "Delete Account" (/delete_account). */
export class AccountDeletedPage extends BasePage {
  protected readonly path = '/delete_account';
  readonly heading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Account Deleted!' });
    this.continueButton = page.getByTestId('continue-button');
  }
}
