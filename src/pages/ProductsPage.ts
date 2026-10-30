import type { Locator, Page } from '@playwright/test';
import { CartModal } from '@components/CartModal';
import { CategorySidebar } from '@components/CategorySidebar';
import { BasePage } from './BasePage';

/**
 * Product listing used by /products, search results, /category_products/{id} and /brand_products/{name}.
 * Each card renders its name, price and "Add to cart" twice (static + hover overlay); interactions
 * target the static `.productinfo` copy, which is always present.
 */
export class ProductsPage extends BasePage {
  protected readonly path = '/products';

  readonly sidebar: CategorySidebar;
  readonly cartModal: CartModal;
  readonly listingTitle: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = new CategorySidebar(page);
    this.cartModal = new CartModal(page);
    const listing = page.locator('.features_items');
    this.listingTitle = listing.locator('h2.title');
    this.productCards = listing.locator('.product-image-wrapper');
    this.productNames = this.productCards.locator('.productinfo p');
    this.searchInput = page.getByPlaceholder('Search Product');
    // Icon-only button with no accessible name.
    this.searchButton = page.locator('#submit_search');
  }

  async openCategory(categoryId: number): Promise<void> {
    await this.navigate(`/category_products/${categoryId}`);
  }

  async openBrand(brand: string): Promise<void> {
    await this.navigate(`/brand_products/${encodeURIComponent(brand)}`);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  productCard(productName: string): Locator {
    return this.productCards.filter({
      has: this.page.locator('.productinfo p').getByText(productName, { exact: true }),
    });
  }

  priceOf(productName: string): Locator {
    return this.productCard(productName).locator('.productinfo h2');
  }

  /** Adds a product and waits for the confirmation modal; the caller decides what to do next. */
  async addToCart(productName: string): Promise<void> {
    await this.waitForPageScripts();
    // The control is an <a> without href, so it has no link role; match its visible text instead.
    await this.productCard(productName).locator('.productinfo').getByText('Add to cart').click();
    await this.cartModal.root.waitFor({ state: 'visible' });
  }

  async addToCartAndContinue(productName: string): Promise<void> {
    await this.addToCart(productName);
    await this.cartModal.continueShopping();
  }

  async viewProduct(productName: string): Promise<void> {
    await this.productCard(productName).getByRole('link', { name: 'View Product' }).click();
  }

  async viewFirstProduct(): Promise<void> {
    await this.productCards.first().getByRole('link', { name: 'View Product' }).click();
  }
}
