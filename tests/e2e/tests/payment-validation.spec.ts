import { test, expect } from '@fixtures/test';
import { request as requestFactory } from '@playwright/test';
import { ProductsApi } from '@utils/ProductsApi';
import { env } from '@utils/env';
import { EMPTY_CARD, INVALID_EXPIRY_MONTH, NON_NUMERIC_CARD } from '@data/cards';

/**
 * Payment-form validation (UI-11, UI-12, UI-13).
 *
 * Each test navigates fresh to the payment page (single item in cart
 * beforehand). The helper below factors out the "get me to /payment"
 * dance so the specs read like assertions.
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

test.describe('Shop — payment validation', () => {
  test.beforeEach(async ({ productsPage, cartPage, checkoutPage, paymentPage }) => {
    await cartPage.clearAll();
    await productsPage.goto();
    await productsPage.addProductToCart(productA);
    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.placeOrder();
    await paymentPage.expectLoaded();
  });

  test('UI-11 — empty payment submission is blocked by the form', async ({ paymentPage }) => {
    await paymentPage.fillCard(EMPTY_CARD);
    await paymentPage.pay();
    // All fields are required on the payment form; the submission never leaves /payment.
    await paymentPage.expectStillOnPayment();
    const invalid = await paymentPage.nameOnCard.evaluate(
      (el: HTMLInputElement) => !el.checkValidity(),
    );
    expect(invalid).toBeTruthy();
  });

  // NOTE: UI-12 / UI-13 are marked `test.fail()` because the site's payment
  // fields are `type="text"` with no `pattern` — boundary / type validation
  // is NOT enforced client-side. We keep the assertions the way the *site
  // should* behave so that if validation is ever tightened, Playwright
  // reports an "unexpected pass" and we revisit these tests.

  test('UI-12 — expiry month > 12 should be rejected by the field', async ({ paymentPage }) => {
    test.fail(true, 'Known defect: month field has no range validation');
    await paymentPage.fillCard(INVALID_EXPIRY_MONTH);
    const isValid = await paymentPage.expiryMonth.evaluate((el: HTMLInputElement) =>
      el.checkValidity(),
    );
    expect(isValid).toBeFalsy();
  });

  test('UI-13 — non-numeric card number should be rejected by the field', async ({
    paymentPage,
  }) => {
    test.fail(true, 'Known defect: card-number field has no numeric pattern');
    await paymentPage.fillCard(NON_NUMERIC_CARD);
    const isValid = await paymentPage.cardNumber.evaluate((el: HTMLInputElement) =>
      el.checkValidity(),
    );
    expect(isValid).toBeFalsy();
  });
});
