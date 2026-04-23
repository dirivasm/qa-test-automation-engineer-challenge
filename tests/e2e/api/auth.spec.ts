import { test, expect } from '@fixtures/test';
import { env } from '@utils/env';

/**
 * Account and authentication API tests (API-04, API-05, API-06, API-07).
 *
 * These tests confirm that the account record driving the checkout
 * address is accurate, and that the login endpoint accepts valid
 * credentials while rejecting invalid or incomplete ones.
 */

test.describe('Account and authentication API', () => {
  test('API-04 — the account profile contains a complete delivery address that the checkout page can use @p0', async ({
    authApi,
  }) => {
    const res = await authApi.getUserDetailByEmail(env.user.email);
    expect(res.responseCode).toBe(200);
    expect(res.user).toBeTruthy();
    // These are the address fields the /checkout page renders. Asserting
    // they are non-empty at the API layer lets us pin the UI rendering
    // back to a known source.
    expect(res.user!.first_name).toBeTruthy();
    expect(res.user!.address1).toBeTruthy();
    expect(res.user!.city).toBeTruthy();
    expect(res.user!.country).toBeTruthy();
    expect(res.user!.zipcode).toBeTruthy();
  });

  test('API-05 — a customer can log in with their registered email and password @p0', async ({
    authApi,
  }) => {
    const res = await authApi.verifyLogin(env.user.email, env.user.password);
    expect(res.responseCode).toBe(200);
    expect(res.message).toMatch(/user exists!/i);
  });

  test('API-06 — a login attempt with the wrong password is rejected @p0', async ({ authApi }) => {
    const res = await authApi.verifyLogin(env.user.email, 'totally-wrong-password');
    expect(res.responseCode).toBe(404);
    expect(res.message).toMatch(/user not found/i);
  });

  test('API-07 — a login request submitted without an email address is rejected with a clear error', async ({
    request,
  }) => {
    // Use the raw request fixture here to send an incomplete form body;
    // the AuthApi client always sends both fields.
    const res = await request.post(`${env.apiBaseURL}/verifyLogin`, {
      form: { password: 'whatever' },
    });
    const body = await res.json();
    expect(body.responseCode).toBe(400);
    expect(String(body.message ?? '')).toMatch(/email|parameter/i);
  });
});
