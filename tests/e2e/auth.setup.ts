/* eslint-disable playwright/no-standalone-expect */
import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { AuthApi } from '@utils/AuthApi';
import { env, STORAGE_STATE_PATH } from '@utils/env';
import { LoginPage } from '@pages/LoginPage';

/**
 * Global authentication setup.
 *
 * Flow:
 *  1. Call `POST /api/verifyLogin` to check whether the configured
 *     test account already exists.
 *  2. If the account does NOT exist → provision it via
 *     `POST /api/createAccount` (signup via API).
 *  3. Drive a one-time UI login through `LoginPage` so the server
 *     issues a real session cookie.
 *  4. Persist the authenticated `storageState` to disk; all test
 *     projects reuse it via `use.storageState` → no re-login per test.
 *
 * This file runs as the `setup` project and is a dependency of the
 * browser projects (see `playwright.config.ts`).
 */
setup('authenticate', async ({ page, request }) => {
  // Gracefully skip when credentials are absent (CI without secrets set).
  // Write an empty storage state first so dependent browser projects can
  // still initialise without a missing-file error.
  const hasCredentials = !!(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);
  if (!hasCredentials) {
    const dir = path.dirname(STORAGE_STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify({ cookies: [], origins: [] }));
  }
  setup.skip(!hasCredentials, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set — running as anonymous guest');

  const { email, password, name } = env.user;
  const api = new AuthApi(request, env.apiBaseURL);

  await setup.step('verify account exists via API', async () => {
    const verify = await api.verifyLogin(email, password);
    console.log(`[setup] verifyLogin → ${verify.responseCode} ${verify.message}`);

    if (verify.responseCode === 200) return; // account exists + password matches

    if (verify.responseCode === 404) {
      // eslint-disable-next-line playwright/no-nested-step
      await setup.step('provision account via API', async () => {
        const created = await api.createAccount({ email, password, name });
        console.log(`[setup] createAccount → ${created.responseCode} ${created.message}`);
        expect(created.responseCode, `Signup failed: ${created.message}`).toBe(201);
      });
      return;
    }

    throw new Error(`Unexpected verifyLogin response: ${verify.responseCode} ${verify.message}`);
  });

  await setup.step('UI login to capture session cookie', async () => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    // Post-login the header shows "Logged in as <name>"
    await expect(page.getByText(/logged in as/i)).toBeVisible();
  });

  await setup.step('persist storage state', async () => {
    const dir = path.dirname(STORAGE_STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await page.context().storageState({ path: STORAGE_STATE_PATH });
  });
});
