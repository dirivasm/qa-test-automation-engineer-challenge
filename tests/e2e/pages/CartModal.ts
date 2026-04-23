import { expect, type Locator, type Page } from '@playwright/test';

/**
 * CartModal — the "Added!" modal that appears after adding a product.
 * Component, not a page.
 */
export class CartModal {
  readonly root: Locator;
  readonly title: Locator;
  readonly viewCartLink: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('#cartModal');
    this.title = this.root.locator('.modal-title');
    this.viewCartLink = this.root.getByRole('link', { name: /view cart/i });
    this.continueButton = this.root.getByRole('button', { name: /continue shopping/i });
  }

  async expectVisible(): Promise<void> {
    await expect(this.title).toHaveText(/added!/i);
  }

  async viewCart(): Promise<void> {
    await this.viewCartLink.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueButton.click();
  }
}
