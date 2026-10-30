import type { CartItem, Product } from '@test-data/types';
import { parsePrice } from './price';

/** Builds the cart line the site should render for a catalogue product at a given quantity. */
export function expectedCartItem(product: Product, quantity = 1): CartItem {
  const price = parsePrice(product.price);
  return { name: product.name, price, quantity, total: price * quantity };
}

export function orderTotal(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}
