import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CartLine {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

/**
 * CartPage — https://automationexercise.com/view_cart
 *
 * Table rows have id `product-<id>`. We model each row as a scoped locator
 * via `row(id)` rather than exposing raw CSS to the specs.
 */
export class CartPage extends BasePage {
  protected readonly path = '/view_cart';
  protected readonly pageReadyLocator: Locator;

  private readonly rows: Locator;
  private readonly emptyMessage: Locator;
  private readonly proceedToCheckoutLink: Locator;
  private readonly anonymousCheckoutPromptLink: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#cart_info_table tbody tr');
    this.emptyMessage = page.locator('#empty_cart');
    this.proceedToCheckoutLink = page.locator('a.check_out', {
      hasText: /proceed to checkout/i,
    });
    this.anonymousCheckoutPromptLink = page
      .locator('#checkoutModal')
      .getByRole('link', { name: /register \/ login/i });
    // The cart section is rendered whether the cart is empty or populated.
    this.pageReadyLocator = page.locator('#cart_items');
  }

  /** Row scoped by product id. The row element itself is `<tr id="product-<id>">`. */
  row(productId: number): Locator {
    return this.page.locator(`#cart_info_table tbody tr#product-${productId}`);
  }

  async count(): Promise<number> {
    return this.rows.count();
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible();
    await expect(this.emptyMessage).toHaveText(/cart is empty/i);
    await expect(this.rows).toHaveCount(0);
  }

  async expectHasItem(productId: number): Promise<void> {
    await expect(this.row(productId)).toBeVisible();
  }

  async getLine(productId: number): Promise<CartLine> {
    const row = this.row(productId);
    const name = (await row.locator('.cart_description a').textContent())?.trim() ?? '';
    const qty = Number((await row.locator('.cart_quantity button').textContent())?.trim() ?? '0');
    const unit = parsePrice(await row.locator('.cart_price p').textContent());
    const total = parsePrice(await row.locator('.cart_total_price').textContent());
    return { productId, name, unitPrice: unit, quantity: qty, total };
  }

  async getGrandTotal(): Promise<number> {
    const lines = this.page.locator('#cart_info_table tbody tr .cart_total_price');
    const totals = await lines.allTextContents();
    return totals.map(parsePrice).reduce((a, b) => a + b, 0);
  }

  async removeItem(productId: number): Promise<void> {
    const row = this.row(productId);
    await row.locator('.cart_quantity_delete').click();
    // Removal is AJAX — wait for the row to disappear.
    await expect(row).toHaveCount(0);
  }

  /** Remove every item currently in the cart (used in `beforeEach`). */
  async clearAll(): Promise<void> {
    await this.goto();
    let count = await this.rows.count();
    let guard = 20;
    while (count > 0 && guard-- > 0) {
      await this.rows.first().locator('.cart_quantity_delete').click();
      // Wait for the total row count to drop before clicking the next delete.
      await expect(this.rows).toHaveCount(count - 1, { timeout: 10_000 });
      count--;
    }
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutLink.click();
  }

  async expectAnonymousCheckoutPrompt(): Promise<void> {
    await expect(this.anonymousCheckoutPromptLink).toBeVisible();
  }

  async goToLoginFromAnonymousPrompt(): Promise<void> {
    await this.anonymousCheckoutPromptLink.click();
  }
}

function parsePrice(text: string | null | undefined): number {
  if (!text) return 0;
  // Store prices are shown as "Rs. 500" — currency uses whole numbers,
  // so strip everything that is not a digit.
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}
