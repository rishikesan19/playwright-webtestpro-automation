import { test, expect } from '@fixtures/test';
import { products } from '@test-data/index';
import { uniqueEmail } from '@utils/dataFactory';
import { isValueMissing } from '@utils/formValidation';

test.describe('Product reviews', () => {
  test('submits a review for a product @smoke', async ({ productDetailsPage }) => {
    await productDetailsPage.openProduct(products.blueTop.id);
    await expect(productDetailsPage.writeReviewTab).toBeVisible();

    await productDetailsPage.submitReview({
      name: 'WebTestPro Reviewer',
      email: uniqueEmail('wtp.review'),
      review: 'Automated review submitted by WebTestPro. Great fit and fabric.',
    });

    await expect(productDetailsPage.reviewSuccessMessage).toBeVisible();
  });

  test('does not submit a review with empty required fields', async ({ productDetailsPage }) => {
    await productDetailsPage.openProduct(products.blueTop.id);

    await productDetailsPage.submitReviewButton.click();

    expect(await isValueMissing(productDetailsPage.reviewNameInput)).toBe(true);
    await expect(productDetailsPage.reviewSuccessMessage).toBeHidden();
  });
});
