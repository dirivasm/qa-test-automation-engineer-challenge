import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { HeaderNav } from '@pages/HeaderNav';
import { ProductsPage } from '@pages/ProductsPage';
import { ProductDetailPage } from '@pages/ProductDetailPage';
import { CartModal } from '@pages/CartModal';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { PaymentPage } from '@pages/PaymentPage';
import { OrderConfirmationPage } from '@pages/OrderConfirmationPage';
import { AuthApi } from '@utils/AuthApi';
import { ProductsApi } from '@utils/ProductsApi';
import { env } from '@utils/env';

/**
 * Shared fixtures — every page object is wired to the test's `page`,
 * and both API clients use the same `request` context.
 *
 * Specs import from here instead of `@playwright/test` directly.
 */
type Fixtures = {
  loginPage: LoginPage;
  header: HeaderNav;
  productsPage: ProductsPage;
  productDetailPage: ProductDetailPage;
  cartModal: CartModal;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  orderConfirmationPage: OrderConfirmationPage;
  authApi: AuthApi;
  productsApi: ProductsApi;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  header: async ({ page }, use) => use(new HeaderNav(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailPage: async ({ page }, use) => use(new ProductDetailPage(page)),
  cartModal: async ({ page }, use) => use(new CartModal(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
  orderConfirmationPage: async ({ page }, use) => use(new OrderConfirmationPage(page)),
  authApi: async ({ request }, use) => use(new AuthApi(request, env.apiBaseURL)),
  productsApi: async ({ request }, use) => use(new ProductsApi(request, env.apiBaseURL)),
});

export { expect } from '@playwright/test';
