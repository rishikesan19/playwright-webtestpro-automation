import type { Locator, Page } from '@playwright/test';
import type { ContactMessage } from '@test-data/types';
import { BasePage } from './BasePage';

export interface ContactForm extends ContactMessage {
  name: string;
  email: string;
  attachmentPath?: string;
}

/**
 * /contact_us. Submitting opens a native confirm() ("Press OK to proceed!") before posting.
 * Only the email field is marked `required`; name, subject and message are optional on the site.
 */
export class ContactUsPage extends BasePage {
  protected readonly path = '/contact_us';

  readonly getInTouchHeading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly attachmentInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    super(page);
    const form = page.locator('#contact-us-form');
    this.getInTouchHeading = page.getByRole('heading', { name: 'Get In Touch' });
    // exact: the footer subscription placeholder ("Your email address") would match "Email".
    this.nameInput = form.getByPlaceholder('Name', { exact: true });
    this.emailInput = form.getByPlaceholder('Email', { exact: true });
    this.subjectInput = form.getByPlaceholder('Subject', { exact: true });
    this.messageInput = form.getByPlaceholder('Your Message Here');
    this.attachmentInput = form.locator('input[type="file"]');
    this.submitButton = form.getByRole('button', { name: 'Submit' });
    this.successMessage = page
      .locator('#contact-page')
      .getByText('Success! Your details have been submitted successfully.');
    this.homeButton = page.locator('#form-section').getByRole('link', { name: 'Home' });
  }

  async fillForm(details: Partial<ContactForm>): Promise<void> {
    if (details.name !== undefined) await this.nameInput.fill(details.name);
    if (details.email !== undefined) await this.emailInput.fill(details.email);
    if (details.subject !== undefined) await this.subjectInput.fill(details.subject);
    if (details.message !== undefined) await this.messageInput.fill(details.message);
    if (details.attachmentPath) await this.attachmentInput.setInputFiles(details.attachmentPath);
  }

  /** Clicks Submit and accepts the browser confirm dialog the site raises. */
  async submit(): Promise<void> {
    await this.waitForPageScripts();
    this.page.once('dialog', (dialog) => void dialog.accept());
    await this.submitButton.click();
  }

  async submitForm(details: ContactForm): Promise<void> {
    await this.fillForm(details);
    await this.submit();
  }
}
