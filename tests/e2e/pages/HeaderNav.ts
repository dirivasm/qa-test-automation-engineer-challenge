import { expect, type Locator, type Page } from '@playwright/test';

/**
 * HeaderNav — site-wide header used on every page.
 *
 * Not a BasePage subclass because it has no own URL: it's a component
 * embedded in every rendered page.
 */
export class HeaderNav {
  readonly logoHome: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly loggedInLabel: Locator;

  constructor(private readonly page: Page) {
    const header = page.locator('#header');
    this.logoHome = header.locator('a[href="/"]').first();
    this.cartLink = header.locator('a[href="/view_cart"]').first();
    this.signupLoginLink = header.locator('a[href="/login"]');
    this.logoutLink = header.locator('a[href="/logout"]');
    this.loggedInLabel = header.getByText(/logged in as /i);
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async expectLoggedIn(name?: string): Promise<void> {
    const re = name ? new RegExp(`logged in as ${name}`, 'i') : /logged in as /i;
    await expect(this.page.getByText(re)).toBeVisible();
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.signupLoginLink).toBeVisible();
    await expect(this.logoutLink).toHaveCount(0);
  }
}
