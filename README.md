# automationexercise.com — E2E Test Suite

End-to-end + API test suite for [automationexercise.com](https://automationexercise.com), built with
**Playwright Test + TypeScript** using the Page Object Model.

The original challenge brief lives in [README_CHALLENGE.md](README_CHALLENGE.md).
The test strategy (scope, risks, matrix) lives in [docs/TESTING_PLAN.md](docs/TESTING_PLAN.md).
Notes on how AI was used during this work are in [docs/AI_COLLABORATION.md](docs/AI_COLLABORATION.md).

## What is covered

| Layer | Cases |
|-------|-------|
| UI    | UI-01…UI-16 — happy path, cart state, auth boundaries, payment validation, order confirmation |
| API   | API-01…API-07 — products list, search, user detail, login negative / positive, account create/delete |

`@p0` marks the critical path. `@responsive` marks cases replayed on mobile + tablet viewports.

## Project layout

```
tests/e2e/
  api/           # API-only specs (run as its own project)
  tests/         # UI specs, grouped by concern
  pages/         # Page Objects (BasePage + one class per screen)
  fixtures/      # Playwright `test` fixture extended with POMs + API clients
  utils/         # Env loader, AuthApi, ProductsApi
  data/          # Static test data (cards, …)
  .auth/         # Storage state written by the `setup` project (git-ignored)
```

## Setup

```bash
npm install
npx playwright install
cp .env.example .env   # then fill in TEST_USER_EMAIL / TEST_USER_PASSWORD
```

The `.env` file must define a pre-existing account on automationexercise.com:

```dotenv
BASE_URL=https://automationexercise.com
API_BASE_URL=https://automationexercise.com
TEST_USER_EMAIL=...
TEST_USER_PASSWORD=...
```

The `setup` project logs in once and stores the authenticated state in
`tests/e2e/.auth/user.json`, which every UI project reuses.

## Running the tests

| Command | What it runs |
|---------|--------------|
| `npm test` | Everything: `setup` + `api` + all browser projects |
| `npm run test:api` | API suite only (no browser) |
| `npm run test:chromium` | UI suite on Chromium (depends on `setup`) |
| `npm run test:firefox` | UI suite on Firefox |
| `npm run test:webkit` | UI suite on WebKit |
| `npm run test:mobile` | `@responsive` cases on Pixel 7 |
| `npm run test:tablet` | `@responsive` cases on iPad Pro 11 |
| `npm run test:responsive` | Mobile + tablet `@responsive` cases |
| `npm run test:p0` | Critical-path (`@p0`) cases only |
| `npm run test:headed` | Any selection, headed browser |
| `npm run test:ui` | Playwright UI Mode |
| `npm run test:debug` | Playwright Inspector |
| `npm run report` | Open the last HTML report |
| `npm run codegen` | Launch Playwright Codegen against the site |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

You can always fall back to the Playwright CLI directly, e.g.:

```bash
npx playwright test --project=chromium -g "UI-01"
npx playwright test --project=api      -g "API-04"
npx playwright test --grep @p0
```

## Design notes

- **POM everywhere.** Every screen is a class in `tests/e2e/pages/` extending
  `BasePage`. Specs never touch raw selectors.
- **Robust locators.** Role-based (`getByRole`), `data-qa` test ids
  (`testIdAttribute: 'data-qa'`), and href-scoped anchors inside
  `#header` to avoid duplicates with the breadcrumb bar.
- **Deterministic cart actions.** Add-to-cart is fired via `evaluate(el =>
  el.click())` because the site's overlay only appears on `:hover`; we then
  wait explicitly for `#cartModal` to become visible.
- **Serial by design.** `workers: 1`, `fullyParallel: false` — the suite
  shares a single live account on a real site, so tests run in order and
  each cart test starts with `cartPage.clearAll()`.
- **Isolated logout.** UI-10 uses its own empty storage state so logging
  out never invalidates the session reused by the rest of the suite.
- **Anonymous check.** UI-09 also uses empty storage state to exercise the
  guest-checkout prompt.
- **API idiom.** automationexercise.com always returns HTTP 200; our API
  client parses the JSON body and asserts on `responseCode` / `message`.

## CI / CD

Two GitHub Actions workflows live in [.github/workflows/](.github/workflows/):

| Workflow | File | Trigger | What it does |
|----------|------|---------|--------------|
| **API Tests** | `api.yml` | push / PR to `main` touching `api/**` or config files | Runs `--project=api` in a single job and publishes the HTML report to GitHub Pages |
| **UI Tests** | `ui.yml` | push / PR to `main` touching `tests/**` or config files | Runs setup + all browser/responsive projects in parallel (matrix), merges the per-browser blob reports into one HTML report, and publishes it to GitHub Pages |

Both workflows can also be triggered manually from the Actions tab (`workflow_dispatch`).

### Required repository secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `TEST_USER_EMAIL` | Email of the test account on automationexercise.com |
| `TEST_USER_PASSWORD` | Password for that account |

`BASE_URL` and `API_BASE_URL` default to `https://automationexercise.com` and can be overridden as repository variables if needed.

### Enabling GitHub Pages

Go to **Settings → Pages**, set *Source* to **GitHub Actions**. After the first successful run the report URL will appear as the environment link on the workflow summary page.
