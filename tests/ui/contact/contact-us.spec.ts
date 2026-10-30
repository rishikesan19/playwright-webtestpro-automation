import { test, expect } from '@fixtures/test';
import { contactData } from '@test-data/index';
import { uniqueEmail } from '@utils/dataFactory';
import { getValidity } from '@utils/formValidation';

test.describe('Contact Us form', () => {
  test.beforeEach(async ({ homePage, contactUsPage }) => {
    await homePage.open();
    await homePage.header.goToContactUs();
    await expect(contactUsPage.getInTouchHeading).toBeVisible();
  });

  test('submits an enquiry with an attachment @smoke', async ({ contactUsPage }) => {
    await contactUsPage.submitForm({
      name: 'WebTestPro Tester',
      email: uniqueEmail('wtp.contact'),
      ...contactData.message,
      attachmentPath: contactData.attachmentPath,
    });

    await expect(contactUsPage.successMessage).toBeVisible();
  });

  test('returns to the home page after a successful submission', async ({
    page,
    contactUsPage,
    homePage,
  }) => {
    await contactUsPage.submitForm({
      name: 'WebTestPro Tester',
      email: uniqueEmail('wtp.contact'),
      ...contactData.message,
    });
    await expect(contactUsPage.successMessage).toBeVisible();

    await contactUsPage.homeButton.click();

    await expect(page).toHaveURL(/\/$/);
    await expect(homePage.featuresItemsHeading).toBeVisible();
  });

  test('requires an email address', async ({ page, contactUsPage }) => {
    await contactUsPage.fillForm({ name: 'WebTestPro Tester', ...contactData.message });

    await contactUsPage.submitButton.click();

    expect((await getValidity(contactUsPage.emailInput)).valueMissing).toBe(true);
    await expect(contactUsPage.successMessage).toBeHidden();
    await expect(page).toHaveURL(/\/contact_us$/);
  });

  test('rejects a malformed email address', async ({ contactUsPage }) => {
    await contactUsPage.fillForm({
      name: 'WebTestPro Tester',
      email: 'not-an-email',
      ...contactData.message,
    });

    await contactUsPage.submitButton.click();

    const validity = await getValidity(contactUsPage.emailInput);
    expect(validity.typeMismatch).toBe(true);
    expect(validity.valid).toBe(false);
    await expect(contactUsPage.successMessage).toBeHidden();
  });

  // Documents actual site behaviour: only the email field carries `required`.
  test('marks only the email field as required', async ({ contactUsPage }) => {
    await expect(contactUsPage.emailInput).toHaveAttribute('required', /.*/);
    await expect(contactUsPage.nameInput).not.toHaveAttribute('required');
    await expect(contactUsPage.subjectInput).not.toHaveAttribute('required');
    await expect(contactUsPage.messageInput).not.toHaveAttribute('required');
  });
});
