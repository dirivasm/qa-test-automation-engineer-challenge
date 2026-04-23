# Testing Plan — Add-to-Cart → Checkout → Place Order

**Site:** https://automationexercise.com  
**Flow:** Authenticated user browses products → adds to cart → completes checkout → places order

---

## 1. High-Level Strategy

### Why this flow

This is the **core revenue path**. A regression here means the product cannot function as an e-commerce platform. It also exercises the widest cross-section of the app in a single flow:

| Step | Area exercised |
| ---- | -------------- |
| Browse `/products` | Catalog rendering, session persistence |
| Add to cart | Cart state management, modal feedback |
| `/view_cart` | Price/quantity calculation, cart persistence |
| `/checkout` | Address resolution from account profile |
| `/payment` | Form validation, sandboxed payment submission |
| `/payment_done` | Order confirmation, invoice generation |

### Risk priority

| Priority | Flows gated on it |
| -------- | ----------------- |
| **P0 — blocks PR** | This flow + account lifecycle (signup/login) |
| P1 — runs nightly | Product search & filtering |
| P2/P3 — scheduled | Contact Us, newsletter |

### Key constraint discovered

The site **exposes no cart or checkout API** — cart state is UI-only. This shapes the entire test strategy: API tests cannot substitute for UI cart tests; they can only act as preconditions and oracles.

---

## 2. UI Tests

**Precondition for all:** authenticated `storageState` loaded via `auth.setup.ts` (account auto-provisioned if missing).

### Happy path

| ID | What | Why we test it |
| -- | ---- | -------------- |
| UI-01 `@p0` | Single product → full checkout → "Order Placed!" | Core end-to-end confidence signal; everything must work together |
| UI-02 `@p0` | Multiple distinct products → verify grand total = sum of line totals | Price calculation logic across multiple items |
| UI-03 | Same product added twice → single row, qty 2 | Duplicate-add handling — common user mistake |
| UI-04 | "View Cart" shortcut in the "Added!" modal | Short path to cart; frequently used by real users |

### Cart state

| ID | What | Why we test it |
| -- | ---- | -------------- |
| UI-05 | Remove last item → empty-state shown, checkout button gone | Edge state — broken empty-cart UX blocks all further buying |
| UI-06 | Set quantity > 1 on product detail page → cart reflects it | Quantity input is the only way to buy more than 1 item at once |
| UI-07 | Add item → navigate away → return to cart | Cart must persist across navigation (session cookie) |
| UI-08 | Add item → reload page → cart still present | Cart must survive a hard refresh |

### Auth boundaries

| ID | What | Why we test it |
| -- | ---- | -------------- |
| UI-09 `@p0` | Anonymous user hits "Proceed To Checkout" → redirected to login | Unauthenticated access to payment must be blocked |
| UI-10 | Log out mid-flow → cart inaccessible | Session invalidation must not leave orphaned cart state |

### Payment form validation

| ID | What | Why we test it |
| -- | ---- | -------------- |
| UI-11 | Submit with all fields empty | Required-field validation prevents blank orders |
| UI-12 | Invalid expiry month (e.g. 13) | Boundary check on a structured field |
| UI-13 | Non-numeric card number | Type validation on a numeric field |

### Confirmation page

| ID | What | Why we test it |
| -- | ---- | -------------- |
| UI-14 | "Download Invoice" link present, href matches order ID in URL | Confirmation page must reference the correct order |
| UI-15 | "Continue" → lands on `/` | Exit path from the flow must work |
| UI-16 | Reload confirmation page → no duplicate order | Idempotency — refresh must not resubmit payment |

### Responsive `@responsive`

UI-01 is additionally run on `mobile-chrome` (Pixel 7) and `tablet` (iPad) to confirm the flow is completable on smaller viewports. These reuse the same test logic via the `@responsive` tag.

---

## 3. API Tests

### Why API tests are complementary, not replacements

Because no cart or checkout API exists, API tests fill three specific roles in this flow:

| Role | What it means |
| ---- | ------------- |
| **Catalog reliability** | Confirm the product data the API exposes is complete and well-formed — so when the UI looks wrong, there is an authoritative source to check against |
| **Runtime product discovery** | Resolve real product IDs from the live catalog at test-run time instead of hard-coding values that can change |
| **Login contract** | Confirm that the authentication endpoint accepts the right credentials and rejects the wrong ones — this gates the entire authenticated UI flow |

### Test cases

| ID | Endpoint | What | Why |
| -- | -------- | ---- | --- |
| API-01 | `GET /api/productsList` | Response shape: `responseCode 200`, non-empty `products` array, each item has `id / name / price / brand / category` | Contract check — if this breaks, UI product data is untrustworthy |
| API-02 | `POST /api/searchProduct` with `search_product=top` | Returns results including "Blue Top" | Seeds product ID for UI-01 at runtime |
| API-03 | `POST /api/searchProduct` with no body | `responseCode 400`, documented error message | Negative contract — bad requests must be rejected cleanly |
| API-04 | `GET /api/getUserDetailByEmail` | Address fields match what `/checkout` renders in the UI | Cross-layer oracle: pins checkout address rendering to account data |
| API-05 | `POST /api/verifyLogin` — valid credentials | `responseCode 200`, "User exists!" | Confirms the test account used by setup is valid |
| API-06 | `POST /api/verifyLogin` — wrong password | `responseCode 404`, "User not found!" | Auth rejects bad credentials at the API level |
| API-07 | `POST /api/verifyLogin` — missing email field | `responseCode 400` | Input validation enforced at the API boundary |

> **API-04 is the critical link between layers:** it lets us assert that the address shown on the checkout page actually comes from the account record — if the site ever decouples those two, this test will catch it before UI-01 fails in a confusing way.

---

## 4. Out of Scope

| Area | Reason excluded |
| ---- | --------------- |
| Cart/checkout via API | No such endpoints exist on this site |
| Payment gateway validation (Luhn, 3DS, issuer) | Sandbox accepts any card — the real gateway is outside the SUT |
| Load / performance testing | Not in scope for this challenge |
| Wishlist, product reviews | Low-risk flows; not part of the revenue path |
| Third-party ad/analytics network calls | Outside our control; would cause false positives |
| Real PII or real card numbers | Not needed; fake fixture data covers all cases |

---

## 5. Test Data & Preconditions

| Data | Strategy |
| ---- | -------- |
| User account | Provisioned once by `auth.setup.ts` via `POST /api/createAccount`; reused across all tests via `storageState` |
| Products | Resolved at runtime from `GET /api/productsList` — never hard-coded |
| Payment card | Fixture: `4242 4242 4242 4242 / 12 / 2030 / 311` — labelled fake, never a real PAN |
| Order ID | Non-deterministic; matched with regex `/payment_done/\d+` |
