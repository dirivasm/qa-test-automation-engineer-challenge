import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

// Load .env from this config's own directory (robust against cwd mismatches,
// e.g. when the VS Code Playwright extension launches from a parent workspace).
dotenv.config({ path: path.join(__dirname, '.env') });

const STORAGE_STATE = 'tests/e2e/.auth/user.json';

/**
 * Playwright configuration for the NaNLABS QA automation challenge.
 * Target site: https://automationexercise.com
 *
 * Concurrency note: every browser project shares the same live test
 * account / cart state, so the suite runs serially (`workers: 1`,
 * `fullyParallel: false`). Parallelism across browsers is achieved in
 * CI by invoking separate jobs per `--project`.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://automationexercise.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    testIdAttribute: 'data-qa',
  },

  projects: [
    // Auth setup — runs once, produces the shared storageState.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Pure-API project — no browser UI, no storageState required.
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
    },

    // Desktop browser projects — skip the /api folder, run everything else.
    {
      name: 'chromium',
      testIgnore: /api\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testIgnore: /api\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testIgnore: /api\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
  ],
});
