import path from 'node:path';
import catalogueJson from './catalogue.json';
import checkoutJson from './checkout.json';
import contactJson from './contact.json';
import productsJson from './products.json';
import type { Category, ContactMessage, PaymentCard, Product } from './types';

/**
 * Typed, read-only access to static JSON test data.
 * Static data is immutable reference data; anything a test mutates (users, carts) is generated per test.
 */
function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === 'object') {
    Object.values(value).forEach((child) => deepFreeze(child));
    Object.freeze(value);
  }
  return value;
}

type ProductKey = keyof typeof productsJson;
type CategoryKey = keyof typeof catalogueJson.categories;

export const products: Readonly<Record<ProductKey, Product>> = deepFreeze(productsJson);

export const catalogue = deepFreeze({
  search: catalogueJson.search,
  categories: catalogueJson.categories as Record<CategoryKey, Category>,
  brands: catalogueJson.brands,
});

export const checkoutData = deepFreeze({
  testCard: checkoutJson.testCard satisfies PaymentCard,
  orderComment: checkoutJson.orderComment,
});

export const contactData = deepFreeze({
  message: contactJson.message satisfies ContactMessage,
  attachmentPath: path.join(__dirname, contactJson.attachment),
});

export type * from './types';
