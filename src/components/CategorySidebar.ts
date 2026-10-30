import type { Locator, Page } from '@playwright/test';
import type { CategoryGroup } from '@test-data/types';

/** Left-hand "Category" accordion and "Brands" list shared by the home and product listing pages. */
export class CategorySidebar {
  readonly categoryHeading: Locator;
  readonly brandsHeading: Locator;
  private readonly categoryPanel: Locator;
  private readonly brandsPanel: Locator;

  constructor(private readonly page: Page) {
    this.categoryHeading = page.getByRole('heading', { name: 'Category', exact: true });
    this.brandsHeading = page.getByRole('heading', { name: 'Brands', exact: true });
    this.categoryPanel = page.locator('.category-products');
    this.brandsPanel = page.locator('.brands_products');
  }

  groupToggle(group: CategoryGroup): Locator {
    // Names carry a leading icon glyph; anchor on a word boundary so "Men" never matches "Women".
    return this.categoryPanel.getByRole('link', { name: new RegExp(`\\b${group}$`) });
  }

  /** Expands a top-level group (e.g. "Women") and opens one of its sub-categories (e.g. "Dress"). */
  async openCategory(group: CategoryGroup, subCategory: string): Promise<void> {
    await this.groupToggle(group).click();
    // Sub-category links live in a collapsible panel whose id matches the group name.
    const subCategoryLink = this.page
      .locator(`#${group}`)
      .getByRole('link', { name: subCategory, exact: true });
    await subCategoryLink.click();
  }

  brandLink(brand: string): Locator {
    // Accessible names look like "(6) Polo"; anchor on the end so "H&M" can't match a longer name.
    return this.brandsPanel.getByRole('link', { name: new RegExp(`\\)\\s*${escapeRegExp(brand)}$`) });
  }

  async openBrand(brand: string): Promise<void> {
    await this.brandLink(brand).click();
  }

  /** The product count the sidebar advertises for a brand, e.g. 6 for "(6) Polo". */
  async advertisedBrandCount(brand: string): Promise<number> {
    const label = await this.brandLink(brand).innerText();
    const match = /\((\d+)\)/.exec(label);
    if (!match?.[1]) throw new Error(`No product count found in brand link "${label}"`);
    return Number(match[1]);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
