import { expect, type Locator, type Page } from '@playwright/test';
import type { Card } from '@data/cards';
import { BasePage } from './BasePage';

/**
 * PaymentPage — https://automationexercise.com/payment
 *
 * All fields are identified by `data-qa` attributes (set globally as
 * `testIdAttribute` in playwright.config.ts).
 */
export class PaymentPage extends BasePage {
  protected readonly path = '/payment';
  protected readonly pageReadyLocator: Locator;

  readonly nameOnCard: Locator;
  readonly cardNumber: Locator;
  readonly cvc: Locator;
  readonly expiryMonth: Locator;
  readonly expiryYear: Locator;
  readonly payButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCard = page.getByTestId('name-on-card');
    this.cardNumber = page.getByTestId('card-number');
    this.cvc = page.getByTestId('cvc');
    this.expiryMonth = page.getByTestId('expiry-month');
    this.expiryYear = page.getByTestId('expiry-year');
    this.payButton = page.getByTestId('pay-button');
    this.pageReadyLocator = this.payButton;
  }

  async fillCard(card: Card): Promise<void> {
    await this.nameOnCard.fill(card.nameOnCard);
    await this.cardNumber.fill(card.cardNumber);
    await this.cvc.fill(card.cvc);
    await this.expiryMonth.fill(card.expiryMonth);
    await this.expiryYear.fill(card.expiryYear);
  }

  async pay(): Promise<void> {
    await this.payButton.click();
  }

  async payWith(card: Card): Promise<void> {
    await this.fillCard(card);
    await this.pay();
  }

  async expectStillOnPayment(): Promise<void> {
    await expect(this.page).toHaveURL(/\/payment$/);
  }

  /** Assert that a given input is flagged by the browser's own constraint validation. */
  async expectFieldInvalid(field: Locator): Promise<void> {
    const isInvalid = await field.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBeTruthy();
  }
}
