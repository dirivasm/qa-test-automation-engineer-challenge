# 🧪 README_CHALLENGE – NaNLABS QA / Test Automation Challenge

This document captures **my approach** to the [NaNLABS QA / Test Automation Engineer Challenge](./README.md). The original challenge statement is preserved in [README.md](./README.md); this file describes **what, why and how** I built the solution.

---

## 🎯 Target Under Test

**Site:** [https://automationexercise.com](https://automationexercise.com)

**Why this site:**

- It mirrors a real e-commerce experience: browsing a catalog, account lifecycle (signup / login / logout / delete account), cart, checkout and order placement.
- It exposes a **public REST API** on the same domain (`/api/...`), which lets me pair **UI tests with API tests** for the same domain — matching the “bonus” criteria in the brief.
- Flows are **non-trivial but deterministic** (no auth walls, no captchas), so they can be automated reliably in CI.
- It supports **session reuse** (cookies-based), enabling realistic state-sharing scenarios like “logged-in user buys an item”.

---

## 🧰 Tooling Choices

| Area | Choice | Rationale |
| --- | --- | --- |
| Test runner | **Playwright Test** | First-class TypeScript support, built-in parallelism, rich tracing/HTML reports, multi-browser + mobile emulation, auto-waiting, API testing via `request` fixture — all in one tool. |
| Language | **TypeScript** | Type-safe page objects / fixtures, refactor-friendly, industry standard for modern JS testing. |
| Pattern | **Page Object Model + fixtures** | Keeps specs readable and business-focused; fixtures provide authenticated contexts and test data factories. |
| API tests | **Playwright `APIRequestContext`** | Same tool, same reporter, shared auth state with UI tests. |
| CI | **GitHub Actions** | Matrix across Chromium / Firefox / WebKit / mobile-chrome; uploads HTML report + JUnit as artifacts. |
| Lint / Format | **ESLint + `eslint-plugin-playwright` + Prettier** | Enforces Playwright best practices (e.g. no `page.waitForTimeout`, proper assertions). |

> The original brief suggested **Cypress** as preferred. I went with **Playwright** because:
>
> - Native cross-browser support (WebKit and mobile emulation out of the box).
> - API + UI in the same spec without plugins.
> - Better parallelism on CI for free.
> - This is explicitly allowed: _“using Cypress **or another modern test automation framework**.”_

---

## 📂 Project Structure

```txt
qa-test-automation-engineer-challenge/
├── .github/
│   └── workflows/
│       └── e2e.yml                  # CI: matrix across browsers + mobile
├── .vscode/
│   └── mcp.json                     # Playwright MCP for AI-assisted authoring
├── docs/
│   ├── TESTING_PLAN.md              # Scope, risk areas, manual checklist
│   └── AI_COLLABORATION.md          # How humans + AI agents should work in this repo
├── tests/
│   └── e2e/
│       ├── pages/                   # Page Objects (added per flow)
│       ├── fixtures/                # Custom Playwright fixtures
│       ├── utils/                   # Helpers (data factories, API clients)
│       ├── data/                    # Static / seeded test data
│       └── smoke.spec.ts            # Sanity check
├── .env.example
├── .eslintrc.cjs
├── .prettierrc.json
├── .gitignore
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── README.md                        # Original challenge brief
└── README_CHALLENGE.md              # ← you are here
```

---

## ▶️ Running the Tests Locally

**Prerequisites:** Node.js ≥ 20 and npm.

```bash
# 1. Install dependencies
npm ci

# 2. Install Playwright browsers (first time only)
npx playwright install --with-deps

# 3. (Optional) Copy env defaults
cp .env.example .env

# 4. Run the full suite (all projects)
npm test

# Or run a specific browser / device
npm run test:chromium

# Interactive UI mode (great for debugging)
npm run test:ui

# Open the last HTML report
npm run report
```

**Environment variables** (see `.env.example`):

| Variable | Default | Required |
| --- | --- | --- |
| `BASE_URL` | `https://automationexercise.com` | No |
| `API_BASE_URL` | `https://automationexercise.com/api` | No |
| `TEST_USER_EMAIL` | — | Yes (authenticated flows) |
| `TEST_USER_PASSWORD` | — | Yes (authenticated flows) |
| `TEST_USER_NAME` | `NanLabs QA` | No |

Copy `.env.example` to `.env` and fill in `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` with a valid [automationexercise.com](https://automationexercise.com) account before running login-dependent tests.

> **Ideal world — CI secrets:** In a production CI setup these credentials would be stored as **GitHub Actions repository secrets** (`Settings → Secrets and variables → Actions`) and injected at runtime — never committed to the repo. The workflow already references them as `${{ secrets.TEST_USER_EMAIL }}` and `${{ secrets.TEST_USER_PASSWORD }}` for exactly that reason. For this challenge submission they are kept in a local `.env` file (gitignored) to keep setup simple.

---

## 📐 Assumptions & Tradeoffs

- The public API is **shared and stateful** — tests create uniquely-named accounts/products to avoid collisions, and are written to be idempotent where possible.
- No secrets are required to run the suite; CI does not need protected credentials.
- I did **not** fork-and-PR against the upstream repo inside this commit — forking is a GitHub-side operation. The branch `feat/playwright-automationexercise` is ready to be pushed and opened as a PR against the fork.

---

## 🤖 AI-Assisted Development

This repo is set up so humans and AI agents can collaborate safely:

- Playwright **MCP server** is pre-configured in [.vscode/mcp.json](./.vscode/mcp.json) so agents can drive a real browser to explore selectors and flows.
- Repo conventions, do/don’t lists, and safe-action policy live in [docs/AI_COLLABORATION.md](./docs/AI_COLLABORATION.md).


