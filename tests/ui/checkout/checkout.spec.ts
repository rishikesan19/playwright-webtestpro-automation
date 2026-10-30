import fs from 'node:fs/promises';
import { test, expect } from '@fixtures/test';
import { checkoutData, products } from '@test-data/index';
import { expectedAddressLines } from '@utils/address';
import { expectedCartItem, orderTotal } from '@utils/cart';
import { getValidity } from '@utils/formValidation';

const { blueTop, menTshirt } = products;

test.describe('Checkout as an authenticated user', () => {
  test.beforeEach(async ({ authenticatedUser: _user, productsPage, cartPage }) => {
    await productsPage.open();
    await productsPage.addToCartAndContinue(blueTop.name);
    await productsPage.addToCartAndContinue(menTshirt.name);
    await cartPage.open();
    await cartPage.proceedToCheckout();
  });

  test('shows delivery and billing addresses from the registered account', async ({
    page,
    checkoutPage,
    authenticatedUser,
  }) => {
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(checkoutPage.addressDetailsHeading).toBeVisible();

    const expectedLines = expectedAddressLines(authenticatedUser);
    await expect(checkoutPage.addressHeading('delivery')).toHaveText('Your delivery address');
    await expect(checkoutPage.addressLines('delivery')).toHaveText(expectedLines);
    await expect(checkoutPage.addressHeading('billing')).toHaveText('Your billing address');
    await expect(checkoutPage.addressLines('billing')).toHaveText(expectedLines);
  });

  test('reviews the order lines and total before payment', async ({ checkoutPage }) => {
    const expectedItems = [expectedCartItem(blueTop), expectedCartItem(menTshirt)];

    await expect(checkoutPage.reviewOrderHeading).toBeVisible();
    await expect(checkoutPage.orderTable.productRows).toHaveCount(expectedItems.length);
    expect(await checkoutPage.orderTable.readItems()).toEqual(expectedItems);
    await expect(checkoutPage.orderTable.totalAmount).toHaveText(`Rs. ${orderTotal(expectedItems)}`);
  });

  test('places an order with the test payment form @smoke', async ({
    page,
    checkoutPage,
    paymentPage,
    cartPage,
  }) => {
    const total = orderTotal([expectedCartItem(blueTop), expectedCartItem(menTshirt)]);

    await checkoutPage.placeOrder(checkoutData.orderComment);
    await expect(page).toHaveURL(/\/payment$/);

    await paymentPage.payAndConfirm(checkoutData.testCard);

    await expect(page).toHaveURL(new RegExp(`/payment_done/${total}$`));
    await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!');
    await expect(paymentPage.orderConfirmedMessage).toBeVisible();

    // A completed order empties the cart.
    await cartPage.open();
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });

  test('downloads an invoice for the placed order', async ({
    checkoutPage,
    paymentPage,
    authenticatedUser,
  }) => {
    const total = orderTotal([expectedCartItem(blueTop), expectedCartItem(menTshirt)]);
    await checkoutPage.placeOrder();
    await paymentPage.payAndConfirm(checkoutData.testCard);
    await expect(paymentPage.orderPlacedHeading).toBeVisible();

    const invoice = await paymentPage.downloadInvoice();

    expect(invoice.suggestedFilename()).toBe('invoice.txt');
    const content = await fs.readFile(await invoice.path(), 'utf8');
    expect(content).toContain(`Hi ${authenticatedUser.firstName} ${authenticatedUser.lastName}`);
    expect(content).toContain(`Your total purchase amount is ${total}`);
  });

  test('blocks payment until the card details are provided', async ({ page, checkoutPage, paymentPage }) => {
    await checkoutPage.placeOrder();

    await paymentPage.payAndConfirmButton.click();

    await expect(page).toHaveURL(/\/payment$/);
    expect((await getValidity(paymentPage.nameOnCardInput)).valueMissing).toBe(true);
    await expect(paymentPage.orderPlacedHeading).toBeHidden();
  });
});

test.describe('Checkout for a new customer', () => {
  test('registers during checkout and keeps the cart', async ({
    page,
    productsPage,
    cartPage,
    loginPage,
    signupPage,
    checkoutPage,
    paymentPage,
    newUser,
  }) => {
    await productsPage.open();
    await productsPage.addToCart(blueTop.name);
    await productsPage.cartModal.viewCart();
    await cartPage.proceedToCheckout();
    await cartPage.checkoutModalLoginLink.click();

    await loginPage.startSignup(newUser.name, newUser.email);
    await signupPage.createAccount(newUser);
    await expect(signupPage.accountCreatedHeading).toBeVisible();
    await signupPage.continueAfterAccountCreated();
    await expect(signupPage.header.loggedInAs).toHaveText(`Logged in as ${newUser.name}`);

    await signupPage.header.goToCart();
    await expect(cartPage.table.row(blueTop.name)).toBeVisible();
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.addressLines('delivery')).toHaveText(expectedAddressLines(newUser));
    await checkoutPage.placeOrder(checkoutData.orderComment);
    await paymentPage.payAndConfirm(checkoutData.testCard);

    await expect(page).toHaveURL(/\/payment_done\/500$/);
    await expect(paymentPage.orderPlacedHeading).toBeVisible();
  });
});
