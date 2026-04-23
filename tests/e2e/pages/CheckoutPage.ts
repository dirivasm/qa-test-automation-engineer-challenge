import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface AddressBlock {
  name: string;
  company: string;
  address1: string;
  address2: string;
  cityStateZip: string;
  country: string;
  phone: string;
}

/**
 * CheckoutPage — https://automationexercise.com/checkout
 *
 * Shows the saved delivery/invoice addresses sourced from the account
 * profile, a line-item review, and a free-text order comment.
 */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';
  protected readonly pageReadyLocator: Locator;

  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  private readonly commentBox: Locator;
  private readonly placeOrderLink: Locator;

  constructor(page: Page) {
    super(page);
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.commentBox = page.locator('textarea[name="message"]');
    this.placeOrderLink = page.locator('a.check_out', { hasText: /place order/i });
    this.pageReadyLocator = page.getByRole('heading', { name: /address details/i });
  }

  async getDeliveryAddress(): Promise<AddressBlock> {
    return this.readAddress(this.deliveryAddress);
  }

  async getBillingAddress(): Promise<AddressBlock> {
    return this.readAddress(this.billingAddress);
  }

  async setComment(text: string): Promise<void> {
    await this.commentBox.fill(text);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderLink.click();
  }

  async expectLineItem(productName: string): Promise<void> {
    await expect(
      this.page.locator('.cart_description').filter({ hasText: productName }),
    ).toBeVisible();
  }

  private async readAddress(root: Locator): Promise<AddressBlock> {
    const lis = await root.locator('li').allTextContents();
    const clean = lis.map((l) => l.trim()).filter(Boolean);
    // The site renders the block as:
    //   [0] Your delivery address (heading)
    //   [1] "Mr. First Last"
    //   [2] company
    //   [3] address1
    //   [4] address2
    //   [5] "city state zipcode"
    //   [6] country
    //   [7] phone
    return {
      name: clean[1] ?? '',
      company: clean[2] ?? '',
      address1: clean[3] ?? '',
      address2: clean[4] ?? '',
      cityStateZip: clean[5] ?? '',
      country: clean[6] ?? '',
      phone: clean[7] ?? '',
    };
  }
}
