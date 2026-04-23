import { test, expect } from '@fixtures/test';
import { request as requestFactory } from '@playwright/test';
import { ProductsApi } from '@utils/ProductsApi';
import { env } from '@utils/env';
import { FAKE_CARD } from '@data/cards';

const hasCredentials = !!(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

/**
 * Purchase flow — browse, add to cart, checkout, place order (UI-01, UI-02, UI-04).
 *
 * Product IDs are resolved from the public API at suite init so the
 * tests stay decoupled from the live catalog's IDs.
 */

let productA = 1;
let productB = 2;

test.beforeAll(async () => {
  const ctx = await requestFactory.newContext();
  try {
    const res = await new ProductsApi(ctx, env.apiBaseURL).list();
    if (res.responseCode !== 200 || !res.products?.length) {
      console.warn(
        `[beforeAll] ProductsApi.list() returned ${res.responseCode} — using fallback ids`,
      );
    } else {
      productA = res.products[0]!.id;
      productB = res.products[1]?.id ?? productB;
    }
  } catch (e) {
    console.warn('[beforeAll] ProductsApi.list() threw — using fallback ids:', e);
  } finally {
    await ctx.dispose();
  }
});

test.describe('Shop — happy path @p0', () => {
  test.beforeEach(async ({ cartPage }) => {
    test.skip(!hasCredentials, 'Checkout requires an authenticated session — TEST_USER_EMAIL / TEST_USER_PASSWORD not set');
    await cartPage.clearAll();
  });

  test('UI-01 — single product placed end-to-end @p0 @responsive', async ({
    productsPage,
    cartPage,
    checkoutPage,
    paymentPage,
    orderConfirmationPage,
  }) => {
    await test.step('add one product from the grid', async () => {
      await productsPage.goto();
      await productsPage.addProductToCart(productA);
    });

    await test.step('open cart and proceed to checkout', async () => {
      await cartPage.goto();
      await cartPage.expectHasItem(productA);
      await cartPage.proceedToCheckout();
    });

    await test.step('place the order with a fake card', async () => {
      await checkoutPage.expectLoaded();
      await checkoutPage.setComment('placed by automated UI-01');
      await checkoutPage.placeOrder();
      await paymentPage.expectLoaded();
      await paymentPage.payWith(FAKE_CARD);
    });

    await test.step('confirmation page shows the order', async () => {
      await orderConfirmationPage.expectPlaced();
      expect(orderConfirmationPage.getOrderId()).toBeGreaterThan(0);
    });
  });

  test('UI-02 — multiple products: grand total equals sum of line totals @p0', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.goto();
    await productsPage.addProductToCart(productA);
    await productsPage.goto(); // back to clean grid, dismissing the modal
    await productsPage.addProductToCart(productB);

    await cartPage.goto();
    const a = await cartPage.getLine(productA);
    const b = await cartPage.getLine(productB);
    const grand = await cartPage.getGrandTotal();

    expect(a.total).toBe(a.unitPrice * a.quantity);
    expect(b.total).toBe(b.unitPrice * b.quantity);
    expect(grand).toBe(a.total + b.total);
  });

  test('UI-04 — "View Cart" shortcut in the add-to-cart modal', async ({
    page,
    productsPage,
    cartModal,
    cartPage,
  }) => {
    await productsPage.goto();
    await productsPage.addProductToCart(productA);
    await cartModal.expectVisible();
    await cartModal.viewCart();

    await expect(page).toHaveURL(/\/view_cart/);
    await cartPage.expectHasItem(productA);
  });
});
