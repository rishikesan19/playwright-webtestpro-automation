import type { Locator, Page } from '@playwright/test';
import { CartModal } from '@components/CartModal';
import { BasePage } from './BasePage';

export interface ProductReview {
  name: string;
  email: string;
  review: string;
}

export class ProductDetailsPage extends BasePage {
  protected path = '/product_details/1';

  readonly cartModal: CartModal;
  readonly productName: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly availability: Locator;
  readonly condition: Locator;
  readonly brand: Locator;

  readonly writeReviewTab: Locator;
  readonly reviewNameInput: Locator;
  readonly reviewEmailInput: Locator;
  readonly reviewTextInput: Locator;
  readonly submitReviewButton: Locator;
  readonly reviewSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.cartModal = new CartModal(page);
    const info = page.locator('.product-information');
    this.productName = info.getByRole('heading', { level: 2 });
    this.category = info.getByText(/^Category:/);
    this.price = info.locator('span > span').first();
    // The "Quantity:" label is not associated with the input, so the spinbutton role is used.
    this.quantityInput = info.getByRole('spinbutton');
    this.addToCartButton = info.getByRole('button', { name: 'Add to cart' });
    this.availability = info.locator('p').filter({ hasText: 'Availability:' });
    this.condition = info.locator('p').filter({ hasText: 'Condition:' });
    this.brand = info.locator('p').filter({ hasText: 'Brand:' });

    const reviewForm = page.locator('#review-form');
    this.writeReviewTab = page.getByRole('link', { name: 'Write Your Review' });
    this.reviewNameInput = reviewForm.getByPlaceholder('Your Name', { exact: true });
    // exact: the footer subscription field's placeholder ("Your email address") would also match.
    this.reviewEmailInput = reviewForm.getByPlaceholder('Email Address', { exact: true });
    this.reviewTextInput = reviewForm.getByPlaceholder('Add Review Here!');
    this.submitReviewButton = reviewForm.getByRole('button', { name: 'Submit' });
    this.reviewSuccessMessage = page.getByText('Thank you for your review.');
  }

  async openProduct(productId: number): Promise<void> {
    this.path = `/product_details/${productId}`;
    await this.open();
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(quantity?: number): Promise<void> {
    if (quantity !== undefined) await this.setQuantity(quantity);
    await this.waitForPageScripts();
    await this.addToCartButton.click();
    await this.cartModal.root.waitFor({ state: 'visible' });
  }

  async submitReview(review: ProductReview): Promise<void> {
    await this.reviewNameInput.fill(review.name);
    await this.reviewEmailInput.fill(review.email);
    await this.reviewTextInput.fill(review.review);
    await this.waitForPageScripts();
    await this.submitReviewButton.click();
  }
}
