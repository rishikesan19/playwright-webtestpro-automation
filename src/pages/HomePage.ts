import type { Locator, Page } from '@playwright/test';
import { CategorySidebar } from '@components/CategorySidebar';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  protected readonly path = '/';
  readonly sidebar: CategorySidebar;
  readonly carousel: Locator;
  readonly featuresItemsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = new CategorySidebar(page);
    this.carousel = page.locator('#slider-carousel');
    this.featuresItemsHeading = page.getByRole('heading', { name: 'Features Items' });
  }
}
