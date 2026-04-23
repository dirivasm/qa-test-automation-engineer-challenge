import { test, expect } from '@fixtures/test';
import { request as requestFactory } from '@playwright/test';
import { ProductsApi } from '@utils/ProductsApi';
import { env } from '@utils/env';

/**
 * Authentication boundary tests (UI-09, UI-10).
 *
 * UI-09 runs as an unauthenticated context (empty storageState).
 * UI-10 runs authenticated (default) and logs out mid-flow.
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

test.describe('Shop — auth boundaries', () => {
  test.describe('anonymous user @p0', () => {
    // Fresh context: no session cookie — simulates a brand-new visitor.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('UI-09 — anonymous checkout prompts for register / login @p0', async ({
      page,
      productsPage,
      cartPage,
    }) => {
      await productsPage.goto();
      await productsPage.addProductToCart(productA);
      await cartPage.goto();
      await cartPage.expectHasItem(productA);
      await cartPage.proceedToCheckout();
      await cartPage.expectAnonymousCheckoutPrompt();
      await cartPage.goToLoginFromAnonymousPrompt();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('authenticated user', () => {
    // Use a brand-new (unauthenticated) context so this test's logout
    // does not invalidate the shared session cookie that the rest of
    // the suite depends on.
    test.use({ storageState: { cookies: [], origins: [] } });

    test('UI-10 — logout ends the authenticated session', async ({
      page,
      loginPage,
      productsPage,
      cartModal,
      cartPage,
      header,
    }) => {
      // Log in freshly inside this isolated context.
      await loginPage.goto();
      await loginPage.login(env.user.email, env.user.password);
      await header.expectLoggedIn();

      await productsPage.goto();
      await productsPage.addProductToCart(productA);
      await cartModal.continueShopping();
      await cartPage.goto();
      await cartPage.expectHasItem(productA);

      await header.logout();
      await header.expectLoggedOut();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
