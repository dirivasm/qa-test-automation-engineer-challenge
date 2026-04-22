import { test, expect } from '@playwright/test';

/**
 * Smoke test to verify the framework and target site are reachable.
 * Real user-flow specs will be added in subsequent iterations.
 */
test.describe('Smoke', () => {
  test('home page loads and shows the main nav', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Automation Exercise/i);
    await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible();
  });
});
