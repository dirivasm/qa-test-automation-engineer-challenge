import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * OrderConfirmationPage — https://automationexercise.com/payment_done/<orderId>
 */
export class OrderConfirmationPage extends BasePage {
  // Path unused for navigation (order id is unknown ahead of time) but
  // required by BasePage; use regex match for URL assertions.
  protected readonly path = '/payment_done/0';
  protected readonly pageReadyLocator: Locator;

  readonly heading: Locator;
  readonly continueButton: Locator;
  readonly downloadInvoiceLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /order placed!/i });
    this.continueButton = page.getByTestId('continue-button');
    this.downloadInvoiceLink = page.locator('a[href^="/download_invoice/"]');
    this.pageReadyLocator = this.heading;
  }

  async expectPlaced(): Promise<void> {
    await expect(this.page).toHaveURL(/\/payment_done\/\d+/);
    await expect(this.heading).toBeVisible();
  }

  /** Parse the order id from the current URL. */
  getOrderId(): number {
    const match = this.page.url().match(/\/payment_done\/(\d+)/);
    if (!match) throw new Error(`Cannot parse order id from URL: ${this.page.url()}`);
    return Number(match[1]);
  }

  async continueToHome(): Promise<void> {
    await this.continueButton.click();
  }
}
