import { test, expect } from '@fixtures/test';
import { products } from '@test-data/index';
import { expectedCartItem } from '@utils/cart';

const { blueTop, menTshirt, sleevelessDress } = products;

test.describe('Shopping cart', () => {
  test('adds a single product from the listing @smoke', async ({ page, productsPage, cartPage }) => {
    await productsPage.open();
    await productsPage.addToCart(blueTop.name);

    await expect(productsPage.cartModal.title).toBeVisible();
    await productsPage.cartModal.viewCart();

    await expect(page).toHaveURL(/\/view_cart$/);
    await expect(cartPage.table.productRows).toHaveCount(1);
    await expect(cartPage.table.priceOf(blueTop.name)).toHaveText(blueTop.price);
    await expect(cartPage.table.quantityOf(blueTop.name)).toHaveText('1');
    await expect(cartPage.table.totalOf(blueTop.name)).toHaveText(blueTop.price);
    await expect(cartPage.table.categoryOf(blueTop.name)).toHaveText(blueTop.category);
  });

  test('adds multiple different products', async ({ productsPage, cartPage }) => {
    await productsPage.open();
    await productsPage.addToCartAndContinue(blueTop.name);
    await productsPage.addToCartAndContinue(menTshirt.name);
    await productsPage.addToCartAndContinue(sleevelessDress.name);

    await cartPage.open();

    await expect(cartPage.table.productRows).toHaveCount(3);
    expect(await cartPage.table.readItems()).toEqual([
      expectedCartItem(blueTop),
      expectedCartItem(menTshirt),
      expectedCartItem(sleevelessDress),
    ]);
  });

  test('applies the quantity chosen on the product page to price and total', async ({
    productDetailsPage,
    cartPage,
  }) => {
    const quantity = 4;

    await productDetailsPage.openProduct(sleevelessDress.id);
    await productDetailsPage.addToCart(quantity);
    await productDetailsPage.cartModal.viewCart();

    const expected = expectedCartItem(sleevelessDress, quantity);
    await expect(cartPage.table.priceOf(sleevelessDress.name)).toHaveText(sleevelessDress.price);
    await expect(cartPage.table.quantityOf(sleevelessDress.name)).toHaveText(String(quantity));
    await expect(cartPage.table.totalOf(sleevelessDress.name)).toHaveText(`Rs. ${expected.total}`);
  });

  // The cart has no quantity editor; the supported way to change quantity is to add the product again.
  test('updates quantity when a product already in the cart is added again', async ({
    productsPage,
    productDetailsPage,
    cartPage,
  }) => {
    await productsPage.open();
    await productsPage.addToCartAndContinue(blueTop.name);
    await productDetailsPage.openProduct(blueTop.id);
    await productDetailsPage.addToCart(2);
    await productDetailsPage.cartModal.continueShopping();

    await cartPage.open();

    await expect(cartPage.table.productRows).toHaveCount(1);
    expect(await cartPage.table.readItems()).toEqual([expectedCartItem(blueTop, 3)]);
  });

  test('removes a product and keeps the rest of the cart', async ({ productsPage, cartPage }) => {
    await productsPage.open();
    await productsPage.addToCartAndContinue(blueTop.name);
    await productsPage.addToCartAndContinue(menTshirt.name);
    await cartPage.open();
    await expect(cartPage.table.productRows).toHaveCount(2);

    await cartPage.removeProduct(blueTop.name);

    await expect(cartPage.table.row(blueTop.name)).toHaveCount(0);
    await expect(cartPage.table.productRows).toHaveCount(1);
    expect(await cartPage.table.readItems()).toEqual([expectedCartItem(menTshirt)]);
  });

  test('shows the empty-cart message after the last product is removed', async ({
    page,
    productsPage,
    cartPage,
  }) => {
    await productsPage.open();
    await productsPage.addToCart(blueTop.name);
    await productsPage.cartModal.viewCart();

    await cartPage.removeProduct(blueTop.name);

    await expect(cartPage.emptyCartMessage).toBeVisible();
    await cartPage.emptyCartProductsLink.click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test('keeps cart contents across navigation and after logging in', async ({
    productsPage,
    loginPage,
    cartPage,
    registeredUser,
  }) => {
    await productsPage.open();
    await productsPage.search('jean');
    await productsPage.addToCartAndContinue('Soft Stretch Jeans');
    await productsPage.addToCartAndContinue('Grunt Blue Slim Fit Jeans');

    await cartPage.open();
    await expect(cartPage.table.productRows).toHaveCount(2);

    await loginPage.open();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await expect(loginPage.header.loggedInAs).toBeVisible();

    await loginPage.header.goToCart();
    await expect(cartPage.table.row('Soft Stretch Jeans')).toBeVisible();
    await expect(cartPage.table.row('Grunt Blue Slim Fit Jeans')).toBeVisible();
    await expect(cartPage.table.productRows).toHaveCount(2);
  });
});
