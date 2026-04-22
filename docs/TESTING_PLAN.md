# 🗺️ Testing Plan – automationexercise.com

Living document. Updated as flows are added / refined.

---

## 1. Scope

**In scope**

- End-to-end UI flows for anonymous and logged-in users.
- REST API tests against `https://automationexercise.com/api/*` that complement UI flows.
- Cross-browser execution (Chromium, Firefox, WebKit) and mobile emulation (Pixel 7).

**Out of scope**

- Load / performance testing.
- Real payment processing (the site is a sandbox; no real gateway).
- Third-party ad / analytics network reliability.

---

## 2. Risk-Based Prioritisation

| # | Flow | Risk if broken | Priority |
| - | ---- | -------------- | -------- |
| 1 | Signup → Login → Logout → Delete account | Blocks every authenticated flow | P0 |
| 2 | Add-to-cart → Checkout → Place order | Core revenue path | P0 |
| 3 | Product search + filtering | Discoverability | P1 |
| 4 | Contact Us (with file upload) | Support channel | P2 |
| 5 | Newsletter subscription | Marketing | P3 |

P0 flows are gated on PRs; P2/P3 can run on schedule.

---

## 3. Planned Test Matrix

### UI specs

- [ ] `auth/signup-login-delete.spec.ts` — full account lifecycle; negative login cases.
- [ ] `auth/session-reuse.spec.ts` — uses `storageState` fixture; verifies logged-in UI is shown without re-login.
- [ ] `shop/search-and-filter.spec.ts` — search by keyword, filter by category/brand.
- [ ] `shop/add-to-cart.spec.ts` — add multiple products, verify cart totals.
- [ ] `shop/place-order.spec.ts` — happy-path checkout with dummy card.
- [ ] `support/contact-us.spec.ts` — required-field validation + file upload + success banner.
- [ ] `home/newsletter.spec.ts` — subscribe with valid / invalid email.

### API specs

- [ ] `api/products.spec.ts` — `GET /productsList`, `POST /searchProduct`.
- [ ] `api/brands.spec.ts` — `GET /brandsList`.
- [ ] `api/auth.spec.ts` — `POST /verifyLogin` (valid / invalid / missing fields).
- [ ] `api/account-lifecycle.spec.ts` — `POST /createAccount` + `DELETE /deleteAccount`.

### Cross-cutting

- [ ] `@responsive` tag applied to P0/P1 UI specs → runs on `mobile-chrome` and `tablet` in addition to desktop.
- [ ] Accessibility smoke: every P0/P1 page has a proper `<title>` and a unique `<h1>`.

---

## 4. Non-Functional Checks

- Capture `trace`, `video`, and `screenshot` on failure (already configured).
- Upload HTML report + JUnit as CI artifacts (already configured).
- Test suite runtime budget: **< 10 min per project on CI**.

---

## 5. Exploratory / Manual Checklist

Use this when extending coverage or doing pre-release sanity passes.

### Account

- [ ] Sign up with an already-registered email → correct error message.
- [ ] Password field masks input and supports paste.
- [ ] “Logout” link only visible when logged in.
- [ ] Deleting account invalidates existing session immediately.

### Catalog / Search

- [ ] Search with special characters (`%`, `<>`, emoji) does not break the page.
- [ ] Empty search term → graceful handling (no 500 / no blank page).
- [ ] Category filters are reflected in the URL and survive refresh.
- [ ] Product card images have `alt` text.

### Cart / Checkout

- [ ] Adding the same product twice increments quantity instead of duplicating row.
- [ ] Removing the last item leaves the cart in an empty-but-valid state.
- [ ] Proceeding to checkout while logged out prompts login / signup.
- [ ] Order confirmation page is reachable only after placing an order (no direct URL bypass).

### Forms

- [ ] All required fields show inline validation.
- [ ] Contact Us file upload rejects obviously oversized files gracefully.
- [ ] Newsletter accepts `+aliases` in emails.

### Responsive / Accessibility

- [ ] Main navigation collapses into a usable menu at ≤ 768px width.
- [ ] Keyboard-only navigation can reach login, search and cart.
- [ ] Focus is visible on all interactive elements.
- [ ] Color contrast passes AA on primary CTAs.

### Reliability

- [ ] Refreshing mid-checkout does not lose the cart.
- [ ] Back button after placing an order does not re-submit it.
- [ ] Network throttling (Slow 3G) still allows the home page to become interactive.

---

## 6. Coverage Reporting

- Playwright HTML report is generated per run and uploaded as a CI artifact.
- JUnit XML is emitted to `test-results/junit.xml` for integration with dashboards.
- Future: add a coverage badge via a simple script that parses JUnit into pass/fail counts.

---

## 7. Open Questions

- Should we maintain a dedicated long-lived test account, or always sign up a fresh one per run? _Current answer: fresh account per run, deleted in teardown._
- How do we handle the site going down? _Retry 2x on CI; flaky smoke → open an issue, do not disable._
