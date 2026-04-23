import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ProductsPage — https://automationexercise.com/products
 *
 * The catalog grid. Each card has a hover overlay with an "Add to cart"
 * link; the overlay and the default card share the same anchor attributes.
 * We use `.first()` on the product-scoped locator to dodge that duplicate.
 */
export class ProductsPage extends BasePage {
  protected readonly path = '/products';
  protected readonly pageReadyLocator: Locator;

  private readonly grid: Locator;

  constructor(page: Page) {
    super(page);
    this.pageReadyLocator = page.getByRole('heading', { name: /all products/i });
    this.grid = page.locator('.features_items');
  }

  /** Add the given product to the cart via the grid overlay. */
  async addProductToCart(productId: number): Promise<void> {
    const addBtn = this.grid.locator(`a.add-to-cart[data-product-id="${productId}"]`).first();
    // The add-to-cart anchor lives in a hover-only overlay; Playwright's
    // auto-hover is unreliable here because the overlay's visibility
    // depends on `:hover` of the parent card, not of the anchor itself.
    // We fire the click through the DOM — the exact path the site's own JS takes.
    await addBtn.evaluate((el: HTMLElement) => el.click());
    // Wait for the confirmation modal to appear so subsequent actions have
    // a deterministic signal that the server-side add has completed.
    await this.page.locator('#cartModal').waitFor({ state: 'visible' });
  }

  /** Open the detail page for a product. */
  async openDetails(productId: number): Promise<void> {
    await this.page.locator(`a[href="/product_details/${productId}"]`).first().click();
  }
}
