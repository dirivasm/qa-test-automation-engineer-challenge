# 🤖 AI Collaboration Guide

This document explains how **human contributors and AI coding agents** (GitHub Copilot, Claude, Cursor, etc.) should collaborate on this repository. Following these conventions keeps the test suite **deterministic, maintainable, and safe to run in CI**.

---

## 🎯 Project At A Glance

- **Stack:** Playwright Test + TypeScript.
- **Target site:** `https://automationexercise.com` (public, no secrets).
- **Pattern:** Page Object Model + custom fixtures.
- **Entry points:** `tests/e2e/**/*.spec.ts`, configured by `playwright.config.ts`.
- **CI:** `.github/workflows/e2e.yml` — matrix across chromium / firefox / webkit / mobile-chrome.

---

## 📚 Required Reading Before Editing

1. [README_CHALLENGE.md](../README_CHALLENGE.md) — scope, tooling rationale.
2. [docs/TESTING_PLAN.md](./TESTING_PLAN.md) — what’s planned vs. in-flight.
3. [playwright.config.ts](../playwright.config.ts) — projects, timeouts, reporters.

---

## ✅ Conventions (do these)

### Authoring tests

- **One flow per spec file.** File name mirrors the flow: `login.spec.ts`, `place-order.spec.ts`.
- Use `test.describe` for the flow and `test.step` for meaningful sub-steps — they surface nicely in the HTML report.
- Prefer **user-facing locators** in this order:
  1. `getByRole` with an accessible name.
  2. `getByLabel`, `getByPlaceholder`, `getByText`.
  3. `getByTestId` (the config maps this to `data-qa`, which the target site actually uses — e.g. `data-qa="login-email"`).
  4. CSS selector — **last resort**, scoped and commented.
- Use **web-first assertions** (`await expect(locator).toBeVisible()`), never manual polling.
- **Never** use `page.waitForTimeout` to “wait for things to settle.” Wait on state instead.
- Derive URLs from `baseURL` — `await page.goto('/login')`, not the full URL.

### Page Objects

- Live in [tests/e2e/pages/](../tests/e2e/pages/). One class per page/region.
- Expose **intent-revealing methods** (`login(email, password)`), not low-level click chains, in specs.
- Locators are defined **once** as class fields; no inline selectors in specs.

### Test data

- **Never** commit real credentials. Use the factory helpers in [tests/e2e/utils/](../tests/e2e/utils/) to generate unique emails/names per run.
- Clean up created data (accounts, orders) using the API when feasible — don’t leave garbage on the shared site.

### API tests

- Use Playwright’s `request` fixture / `APIRequestContext`. Do not pull in `axios`/`node-fetch`.
- Assert both **status code** and **payload shape**. Prefer schema validation over ad-hoc `expect(body.x).toBe(...)`.

### Cross-browser / responsive

- Tag a test `@responsive` in its title when it must run on mobile + desktop.
- Don’t hard-code pixel sizes in specs — rely on the project’s `devices[...]` config.

---

## 🚫 Don’ts

- ❌ Don’t add production secrets, real user data, or payment info.
- ❌ Don’t introduce new runtime dependencies without justification in the PR.
- ❌ Don’t disable a test with `.skip` / `.fixme` without a linked issue and an explanatory comment.
- ❌ Don’t rename or delete existing page objects / fixtures without updating all call sites.
- ❌ Don’t commit `playwright-report/`, `test-results/`, `node_modules/`, or `.env` — they are gitignored.
- ❌ Don’t push directly to `main`. Use a feature branch + PR.

---

## 🧭 Suggested Workflow for an AI Agent

When asked to **add a new flow** (e.g., “automate the checkout happy path”):

1. **Discover selectors safely.** Use the Playwright MCP (configured in [.vscode/mcp.json](../.vscode/mcp.json)) or `npx playwright codegen https://automationexercise.com` to inspect the real DOM. Prefer `data-qa` attributes.
2. **Draft the Page Object first** in `tests/e2e/pages/<flow>.page.ts` with typed methods and locator fields.
3. **Write the spec** in `tests/e2e/<flow>.spec.ts`, using `test.step` for each business step.
4. **Run locally** on a single project: `npx playwright test <flow>.spec.ts --project=chromium`.
5. **Verify on a second project** (e.g. `--project=webkit` or `mobile-chrome`) before opening a PR.
6. **Update docs** — add the flow to the checklist in [docs/TESTING_PLAN.md](./TESTING_PLAN.md) and to the “What the Suite Will Cover” section in [README_CHALLENGE.md](../README_CHALLENGE.md).

---

## 🔐 Safety Rules for Automated Actions

AI agents running commands in this repo **must**:

- ✅ Freely run: linters, formatters, type-checks, `npx playwright test`, `npx playwright show-report`.
- ⚠️ Ask before: `git push`, force-pushes, deleting branches, installing new top-level dependencies, modifying `.github/workflows/*`.
- ❌ Never run: `rm -rf` outside `node_modules/` / `test-results/` / `playwright-report/`, destructive git operations, anything that uses real credentials.
- ❌ Never create accounts / place orders on **non-test** sites. `automationexercise.com` is explicitly a test sandbox.

---

## 🆕 Adding a New Dependency

1. Justify it in the PR description (why not use what’s already here?).
2. Prefer `devDependencies` — nothing in this repo ships to production.
3. Pin to a minor range (`^x.y.z`) and confirm it doesn’t break the CI matrix.

---

## 📎 Useful Commands

```bash
npm test                     # all projects
npm run test:chromium        # single project
npm run test:ui              # Playwright UI mode
npm run test:debug           # inspector
npm run codegen              # record selectors against the site
npm run typecheck            # strict TS check
npm run lint                 # ESLint (incl. playwright rules)
```

---

## 🧠 When In Doubt

- Optimise for **readability of the spec** first, performance second.
- If a test is flaky, fix the **wait strategy** — don’t add retries to hide it.
- Ask in the PR rather than guessing about business intent.
