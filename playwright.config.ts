import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for the NaNLABS QA automation challenge.
 * Target site: https://automationexercise.com
 *
 * See https://playwright.dev/docs/test-configuration for all options.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Limit workers on CI for stability */
  workers: process.env.CI ? 2 : undefined,
  /* Reporters */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  /* Shared settings for all the projects below. */
  use: {
    baseURL: process.env.BASE_URL ?? 'https://automationexercise.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    testIdAttribute: 'data-qa',
  },

  /* Configure projects for major browsers and viewports */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
});
