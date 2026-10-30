import { test, expect } from '@fixtures/test';
import { products } from '@test-data/index';

test.describe('Product details', () => {
  test('opens the details page from the product listing @smoke', async ({
    page,
    productsPage,
    productDetailsPage,
  }) => {
    await productsPage.open();
    const firstProductName = (await productsPage.productNames.first().innerText()).trim();

    await productsPage.viewFirstProduct();

    await expect(page).toHaveURL(/\/product_details\/\d+$/);
    await expect(productDetailsPage.productName).toHaveText(firstProductName);
    await expect(productDetailsPage.category).toBeVisible();
    await expect(productDetailsPage.price).toBeVisible();
    await expect(productDetailsPage.availability).toBeVisible();
    await expect(productDetailsPage.condition).toBeVisible();
    await expect(productDetailsPage.brand).toBeVisible();
  });

  for (const product of Object.values(products)) {
    test(`shows correct information for "${product.name}"`, async ({ productDetailsPage }) => {
      await productDetailsPage.openProduct(product.id);

      await expect(productDetailsPage.productName).toHaveText(product.name);
      await expect(productDetailsPage.category).toHaveText(`Category: ${product.category}`);
      await expect(productDetailsPage.price).toHaveText(product.price);
      await expect(productDetailsPage.brand).toHaveText(`Brand: ${product.brand}`);
      await expect(productDetailsPage.availability).toHaveText('Availability: In Stock');
      await expect(productDetailsPage.condition).toHaveText('Condition: New');
      await expect(productDetailsPage.quantityInput).toHaveValue('1');
    });
  }
});
