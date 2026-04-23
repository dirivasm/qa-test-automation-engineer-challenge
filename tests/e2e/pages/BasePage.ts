import { expect, type Locator, type Page } from '@playwright/test';

/**
 * BasePage — shared primitives for every Page Object.
 *
 * Concrete pages should:
 *  - Define their own locators in the constructor.
 *  - Expose intent-revealing methods (e.g. `login(...)`) — not raw click chains.
 *  - Call `goto()` to navigate using a path relative to `baseURL`.
 */
export abstract class BasePage {
  /** Path (relative to `baseURL`) the page lives at. Subclasses must override. */
  protected abstract readonly path: string;

  /** Locator used by `expectLoaded()` to assert the page is ready. Subclasses must override. */
  protected abstract readonly pageReadyLocator: Locator;

  constructor(protected readonly page: Page) {}

  /** Navigate to the page using a path relative to `baseURL`. */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.expectLoaded();
  }

  /** Web-first assertion that the page is loaded. */
  async expectLoaded(): Promise<void> {
    await expect(this.pageReadyLocator).toBeVisible();
  }

  /** Handy accessors for subclasses / specs. */
  get url(): string {
    return this.page.url();
  }
}
