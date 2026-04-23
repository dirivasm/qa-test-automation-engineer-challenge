/* eslint-disable playwright/expect-expect */
import { test, expect } from '@fixtures/test';
import { request as requestFactory } from '@playwright/test';
import { ProductsApi } from '@utils/ProductsApi';
import { env } from '@utils/env';

/**
 * Cart state tests (UI-03, UI-05, UI-06, UI-07, UI-08).
 */

let productA = 1;
let productB = 2;

test.beforeAll(async () => {
  const ctx = await requestFactory.newContext();
  try {
    const res = await new ProductsApi(ctx, env.apiBaseURL).list();
    productA = res.products![0]!.id;
    productB = res.products![1]!.id;
  } finally {
    await ctx.dispose();
  }
});

test.describe('Shop — cart state', () => {
  test.beforeEach(async ({ cartPage }) => {
    await cartPage.clearAll();
  });

  test('UI-03 — same product added twice collapses into one row, qty 2', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.goto();
    await productsPage.addProductToCart(productA);
    await productsPage.goto();
    await productsPage.addProductToCart(productA);

    await cartPage.goto();
    await expect(cartPage.row(productA)).toHaveCount(1);
    const line = await cartPage.getLine(productA);
    expect(line.quantity).toBe(2);
    expect(line.total).toBe(line.unitPrice * 2);
  });

  test('UI-05 — removing the last item shows the empty-cart state', async ({
    productsPage,
    cartPage,
  }) => {
    await productsPage.goto();
    await productsPage.addProductToCart(productA);
    await cartPage.goto();
    await cartPage.expectHasItem(productA);
    await cartPage.removeItem(productA);
    await cartPage.expectEmpty();
  });

  test('UI-06 — product detail quantity input propagates to the cart', async ({
    productDetailPage,
    cartModal,
    cartPage,
    page,
  }) => {
    await page.goto(`/product_details/${productA}`);
    await productDetailPage.expectLoaded();
    await productDetailPage.setQuantity(3);
    await productDetailPage.addToCart();
    await cartModal.expectVisible();
    await cartModal.viewCart();

    const line = await cartPage.getLine(productA);
    expect(line.quantity).toBe(3);
    expect(line.total).toBe(line.unitPrice * 3);
  });

  test('UI-07 — cart survives client-side navigation', async ({
    productsPage,
    cartModal,
    cartPage,
    header,
  }) => {
    await productsPage.goto();
    await productsPage.addProductToCart(productB);
    await cartModal.continueShopping();
    await header.logoHome.click();
    await cartPage.goto();
    await cartPage.expectHasItem(productB);
  });

  test('UI-08 — cart survives a hard reload', async ({ productsPage, cartPage, page }) => {
    await productsPage.goto();
    await productsPage.addProductToCart(productB);
    await cartPage.goto();
    await cartPage.expectHasItem(productB);
    await page.reload();
    await cartPage.expectHasItem(productB);
  });
});
