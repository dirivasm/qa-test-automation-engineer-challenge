import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ProductDetailPage — https://automationexercise.com/product_details/<id>
 * The only place where the user can choose a quantity > 1.
 */
export class ProductDetailPage extends BasePage {
  protected readonly path: string;
  protected readonly pageReadyLocator: Locator;

  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly productName: Locator;

  constructor(page: Page, productId?: number) {
    super(page);
    this.path = productId ? `/product_details/${productId}` : '/product_details/1';
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('.product-information button.cart');
    this.productName = page.locator('.product-information h2');
    this.pageReadyLocator = this.addToCartButton;
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    // The modal is the confirmation signal; tests assert it explicitly.
    await this.page.locator('#cartModal').waitFor({ state: 'visible' });
  }

  async getProductName(): Promise<string> {
    return (await this.productName.textContent())?.trim() ?? '';
  }

  async expectQuantity(qty: number): Promise<void> {
    await expect(this.quantityInput).toHaveValue(String(qty));
  }
}
