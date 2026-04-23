import { test, expect } from '@fixtures/test';
import { request as requestFactory } from '@playwright/test';
import { ProductsApi } from '@utils/ProductsApi';
import { env } from '@utils/env';
import { FAKE_CARD } from '@data/cards';

const hasCredentials = !!(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

/**
 * Order confirmation tests (UI-14, UI-15, UI-16).
 *
 * Each test places a real order (the site is a public sandbox; this is
 * intentional) and then asserts confirmation-page invariants.
 */

let productA = 1;

test.beforeAll(async () => {
  const ctx = await requestFactory.newContext();
  try {
    const res = await new ProductsApi(ctx, env.apiBaseURL).list();
    productA = res.products?.[0]?.id ?? productA;
  } catch (e) {
    console.warn('[beforeAll] ProductsApi.list() failed, using fallback id:', e);
  } finally {
    await ctx.dispose();
  }
});

test.describe('Shop — order confirmation', () => {
  test.beforeEach(
    async ({ productsPage, cartPage, checkoutPage, paymentPage, orderConfirmationPage }) => {
      test.skip(!hasCredentials, 'Checkout requires an authenticated session — TEST_USER_EMAIL / TEST_USER_PASSWORD not set');
      await cartPage.clearAll();
      await productsPage.goto();
      await productsPage.addProductToCart(productA);
      await cartPage.goto();
      await cartPage.proceedToCheckout();
      await checkoutPage.placeOrder();
      await paymentPage.expectLoaded();
      await paymentPage.payWith(FAKE_CARD);
      await orderConfirmationPage.expectPlaced();
    },
  );

  test('UI-14 — download-invoice link references the same order', async ({
    orderConfirmationPage,
  }) => {
    const orderId = orderConfirmationPage.getOrderId();
    await expect(orderConfirmationPage.downloadInvoiceLink).toBeVisible();
    await expect(orderConfirmationPage.downloadInvoiceLink).toHaveAttribute(
      'href',
      new RegExp(`/download_invoice/${orderId}$`),
    );
  });

  test('UI-15 — Continue returns to the home page', async ({ orderConfirmationPage, page }) => {
    await orderConfirmationPage.continueToHome();
    await expect(page).toHaveURL(/\/$|\/home$/);
  });

  test('UI-16 — reload of confirmation page is idempotent (same order)', async ({
    orderConfirmationPage,
    page,
  }) => {
    const before = orderConfirmationPage.getOrderId();
    await page.reload();
    await orderConfirmationPage.expectPlaced();
    expect(orderConfirmationPage.getOrderId()).toBe(before);
  });
});
