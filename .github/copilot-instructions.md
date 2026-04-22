# Copilot / AI Agent Instructions

This repository is an **end-to-end test suite** for `https://automationexercise.com` built with **Playwright + TypeScript**.

## Non-negotiable rules

- Use **Playwright Test** APIs only. Do not introduce Cypress, WebdriverIO, Jest, Mocha, etc.
- Use **TypeScript** (`.ts`) — no `.js` spec files.
- Specs live under `tests/e2e/**/*.spec.ts`. Page Objects under `tests/e2e/pages/`. Fixtures under `tests/e2e/fixtures/`.
- Prefer locators in this order: `getByRole` → `getByLabel`/`getByText` → `getByTestId` (maps to `data-qa`) → CSS (last resort).
- Use **web-first assertions** (`await expect(locator).toBeVisible()`). **Never** use `page.waitForTimeout` to paper over flakiness.
- Derive URLs from `baseURL`. Use relative paths in `page.goto(...)`.
- No real credentials, no real PII. Generate unique test data per run.
- Do not commit `playwright-report/`, `test-results/`, `node_modules/`, or `.env`.

## Before editing

Read [docs/AI_COLLABORATION.md](../docs/AI_COLLABORATION.md) and [docs/TESTING_PLAN.md](../docs/TESTING_PLAN.md).

## Preferred commands

- Install: `npm ci && npx playwright install --with-deps`
- Run: `npm test` (all) or `npx playwright test <file> --project=chromium` (focused)
- Debug: `npm run test:ui` or `npm run test:debug`
- Type-check / lint: `npm run typecheck && npm run lint`

## Style

- Page Objects expose intent-revealing methods (`login(email, password)`), not click chains.
- Each spec: one business flow, `test.describe` + `test.step` for readability.
- Tag responsive-required specs with `@responsive` in the title.
