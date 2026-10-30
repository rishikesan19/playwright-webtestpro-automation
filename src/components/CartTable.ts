import type { Locator, Page } from '@playwright/test';
import type { CartItem } from '@test-data/types';
import { parsePrice } from '@utils/price';

/** Line-item table rendered on both the cart and checkout ("Review Your Order") pages. */
export class CartTable {
  readonly root: Locator;
  /** Product rows only; the checkout variant appends a non-product "Total Amount" row. */
  readonly productRows: Locator;
  readonly totalAmount: Locator;

  constructor(page: Page) {
    // Both pages wrap the table in #cart_info; only the cart page gives the table itself an id.
    this.root = page.locator('#cart_info table');
    this.productRows = this.root.locator('tbody tr[id^="product-"]');
    this.totalAmount = this.root
      .getByRole('row')
      .filter({ hasText: 'Total Amount' })
      .locator('.cart_total_price');
  }

  row(productName: string): Locator {
    return this.productRows.filter({
      has: this.root.page().getByRole('link', { name: productName, exact: true }),
    });
  }

  priceOf(productName: string): Locator {
    return this.row(productName).locator('.cart_price');
  }

  quantityOf(productName: string): Locator {
    return this.row(productName).locator('.cart_quantity');
  }

  totalOf(productName: string): Locator {
    return this.row(productName).locator('.cart_total_price');
  }

  categoryOf(productName: string): Locator {
    return this.row(productName).locator('.cart_description p');
  }

  /** Snapshot of the table for whole-cart comparisons. Call after the expected rows are visible. */
  async readItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    for (const row of await this.productRows.all()) {
      const [name, price, quantity, total] = await Promise.all([
        row.locator('.cart_description h4').innerText(),
        row.locator('.cart_price').innerText(),
        row.locator('.cart_quantity').innerText(),
        row.locator('.cart_total_price').innerText(),
      ]);
      items.push({
        name: name.trim(),
        price: parsePrice(price),
        quantity: Number(quantity.trim()),
        total: parsePrice(total),
      });
    }
    return items;
  }
}
