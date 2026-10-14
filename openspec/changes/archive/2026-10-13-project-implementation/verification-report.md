# Verification report: project-implementation

**Date:** 2026-10-13 · **Base commit:** `afb9dcb` plus the uncommitted review/test changes described in [tasks.md](tasks.md) · **Environment:** macOS (Darwin 25.5, arm64), Node.js 22.22.0, npm 10, Vitest 4.1.11, Playwright 1.64.0 (Chromium, Firefox, WebKit 27.2).

## Verdict

Implementation is **functionally complete and verified against fixtures** for 64 of 66 scenarios. One scenario is **partially verified**: QUAL-02b, because no manual screen-reader session was run. One is **blocked**: QUAL-05b, because public repository publication has not been authorized. No MUST is reported as passed without a test or recorded observation. Live-service limitations are listed separately and are not hidden by mocked success.

## Command evidence

| Command | Result |
|---|---|
| `npm ci` (clean copy without `node_modules`/`dist`) | Passed, 0 vulnerabilities |
| `npm run lint` | Passed, `--max-warnings 0` |
| `npm run typecheck` | Passed |
| `npm test` | Passed: 17 files, 49 tests, no live API (MSW fails unhandled requests) |
| `npm run build` | Passed: JS 203.12 kB (66.79 kB gzip), CSS 8.29 kB (2.56 kB gzip) |
| `npm run test:e2e` | Passed: 65 tests on Chromium/Firefox/WebKit against a fresh production build, 1 intentional skip (WebKit Tab-to-link keyboard test); repeated 3× without flakes |
| `npm run start` | Dev server served `/` and `/products/abc` with HTTP 200 |
| `npm audit` | 0 vulnerabilities |
| Deliberate failures (temporary, not committed) | Failing test exit 1, lint violation exit 1, type error exit 2 |

The clean check was repeated from a fresh `git clone` of commit `3779570`: `npm ci`, lint, typecheck, test, build and test:e2e all passed (65 browser tests, 1 intentional skip).

## Scenario results

U = Vitest file under `src/`; E = Playwright spec under `tests/e2e/`.

| Scenario | Result | Evidence |
|---|---|---|
| NAV-01a | Passed | U `App.test.tsx`; E `shopping.spec.ts` (catalog→PDP→back keeps list request count at 1, so there is no document reload) |
| NAV-01b | Passed | E history test (back/forward), PDP reload, direct entry |
| NAV-01c | Passed | U `AppShell.test.tsx` unknown route; E unknown route |
| NAV-02a | Passed | U `AppShell.test.tsx` home link/count; E count on both views |
| NAV-02b | Passed | U `AppShell.test.tsx` breadcrumb `aria-current`, product name only after its own detail loads |
| NAV-02c | Passed | U `AppShell.test.tsx` loading breadcrumb; U `ProductDetailPage.test.tsx` not-found keeps back link |
| NAV-03a | Passed | E "direct entry to a product offers a return link" |
| NAV-04a | Passed | E 1280 px: 4 catalog columns, PDP image left of details |
| NAV-04b | Passed | E 320/640/768 px: 1/2/3 columns, PDP stacked ≤760 px, no horizontal overflow; screenshots in `test-results/screenshots/` |
| CAT-01a | Passed | U `ProductListPage.test.tsx` 37 fixtures in order; live list rendered all 100 products |
| CAT-01b | Passed | U `ProductListPage.test.tsx` empty catalog distinct from failure |
| CAT-02a | Passed | U `filterProducts.test.ts`; U PLP brand search |
| CAT-02b | Passed | U `filterProducts.test.ts` cross-field phrase has no match |
| CAT-02c | Passed | U PLP no-match message and clear restores 37; one list request total |
| CAT-03a | Passed | U `ProductCard.test.tsx` |
| CAT-03b | Passed | U `ProductCard.test.tsx` fallbacks and failed image; U `normalizeProduct.test.ts` blank price |
| CAT-04a | Passed | U card href encodes `a/b?c`; E exact `/products/<id>` URL |
| CAT-05a | Passed | U PLP loading status; E list renders |
| CAT-05b | Passed | U PLP failure→retry; E 503→retry |
| PDP-01a | Passed | U `ProductAttributes.test.tsx` all 8 attributes, all camera values |
| PDP-01b | Passed | U `ProductAttributes.test.tsx` "Not available" fallbacks |
| PDP-02a | Passed | U `VariantForm.test.tsx` sole option preselected and still visible |
| PDP-02b | Passed | U `ProductDetailPage.test.tsx` sole color preselected, storage required |
| PDP-02c | Passed | U `VariantForm.test.tsx` multiple options require a choice |
| PDP-03a | Passed | U `VariantForm.test.tsx` incomplete selection disabled with associated hint |
| PDP-03b | Passed | U `normalizeProduct.test.ts`; U PDP malformed options disabled with described reason |
| PDP-03c | Passed | U `VariantForm.test.tsx` code `0` and string codes submitted with original types |
| PDP-04a | Passed | Form keyed by product id; E pending test shows product B with empty storage |
| PDP-04b | Passed | U `useProductResource.test.tsx`; U PDP late-A test; E late-A test |
| PDP-05a | Passed (fixture) | U PDP 404→"Product unavailable", no purchase/retry controls. **Limitation:** the live service returns HTTP 500 (not 404) for an unknown id, so live unknown ids show the retryable error state |
| PDP-05b | Passed | U PDP timeout→retry; E network failure→retry |
| CART-01a | Passed | U `App.test.tsx` exact body `{ id, colorCode: 1000, storageCode: 2001 }`; E same |
| CART-01b | Passed | U `CartProvider.test.tsx` count unchanged while pending |
| CART-02a | Passed | U provider lower count replaces 5→0; E 7→3 |
| CART-02b | Passed | U `cartApi.test.ts` zero accepted, −1 rejected; U provider `"many"` rejected |
| CART-03a | Passed | E clock moved past one hour: list refetched, count 6 restored |
| CART-03b | Passed | U `cartStorage.test.ts` corrupt/denied/version; U provider denied storage still updates in-session |
| CART-04a | Passed (fixture) | U provider 400 → "did not accept", count unchanged |
| CART-04b | Passed | U provider 503/malformed; E malformed and aborted POST: count kept, warning shown, no replay (2 clicks = 2 requests) |
| CART-05a | Passed | U provider second activation sends no POST |
| CART-05b | Passed | E navigating to product B while pending: controls disabled, one POST, late success updates badge only |
| DATA-01a | Passed | U `http.test.ts`, `productApi.test.ts` encoding; live GET list/detail in 3 browsers |
| DATA-01b | Passed | U `http.test.ts` never-resolving request times out. **Limitation:** observed cold start 52 s > 20 s timeout |
| DATA-02a | Passed | U `http.test.ts` non-JSON/non-2xx; U normalizer invalid list/identity mismatch |
| DATA-02b | Passed | U `normalizeProduct.test.ts` accepts unknown extra fields; blank values become unavailable |
| DATA-03a | Passed | U `productCache.test.ts` at TTL−1 fresh, at TTL refetch |
| DATA-03b | Passed | U `productApi.test.ts` list cannot satisfy detail |
| DATA-03c | Passed | U `productCache.test.ts` future timestamp revalidates |
| DATA-04a | Passed | U cache reload; E reload issues no new GET |
| DATA-04b | Passed | U cache incompatible version and malformed JSON discarded |
| DATA-04c | Passed | U cache works in memory when writes throw; U storage denied |
| DATA-05a | Passed | U cache does not serve expired data when revalidation fails |
| DATA-05b | Passed | U `productApi.test.ts` and cache coalescing |
| DATA-05c | Passed | U cache failure not cached; PLP/PDP retry |
| DATA-06a | Passed | E two deliberate additions = two POSTs; U provider |
| DATA-06b | Passed | U cache leaves cart and unrelated keys untouched; E CART-03a |
| QUAL-01a | Passed | Fresh `git clone` of `3779570` with the command matrix above |
| QUAL-01b | Passed | Deliberate failure exits above |
| QUAL-02a | Passed | E keyboard-only journey on Chromium/Firefox (WebKit skipped: it does not Tab to links by default); E search focus indicator |
| QUAL-02b | Partially verified | E axe-core WCAG 2.1 A/AA: 0 violations on catalog, PDP, 404; status/alert roles asserted; 640 px reflow (200% zoom) without overflow. **Not run:** manual screen-reader session |
| QUAL-03a | Passed | U card renders markup as text; U normalizer rejects off-origin, `http:` and `javascript:` image URLs; production CSP verified in 3 browsers |
| QUAL-03b | Passed | Lazy card images, eager PDP image, search makes no requests, bundle size recorded |
| QUAL-04a | Passed | Unit and browser suites intercept all API traffic |
| QUAL-04b | Passed | This report and `docs/verification-checklist.md` |
| QUAL-05a | Passed | README updated with setup, commands, architecture, limits |
| QUAL-05b | Blocked | Public repository publication not yet authorized; there is no remote |

## Review findings fixed during verification

1. The error boundary never reset, so its "Go to catalog" recovery link kept showing the error. It is now keyed by route, and a regression test fails without the fix.
2. The MSW list mock returned already-normalized objects instead of the raw API shape (`price`, `imgUrl`), so unit tests never exercised real price/image mapping. Fixed with `rawProductList`.
3. The search input removed its focus outline. A `:focus-within` indicator was added.
4. Focus fell back to `<body>` when the PDP loading heading was replaced. It now returns to the route heading.
5. The variant form could submit while an addition was pending (only the provider guarded it). The form now guards too.
6. A production-only Content-Security-Policy was added: `script-src`/`style-src 'self'`, and images/requests limited to the API origin.
7. Testing Library cleanup and `localStorage` were not reset between tests, because Vitest globals are off. Both are now reset in `tests/setup.ts`.
8. The e2e suite served a stale `dist/`. Playwright now builds before previewing.
9. Build tools moved to `devDependencies`. The cart context value is memoized. The selection hint names only the missing choice.

## Known limitations

- **Cold start:** the service took 52 s to answer the first list request after idling. The 20 s timeout fails that first attempt, and a manual retry succeeds once the service is warm. The design decision is kept; a longer timeout would leave visitors in an indefinite loading state.
- **Unknown product ids** return HTTP 500 `{"message":"An Unexpected Error Occurred"}`, so the UI cannot honestly say "not found" for live data.
- **WebKit** logs a CSP style-src report for every native `<select>`, including in an isolated page with no app code. The tests ignore that one message on WebKit only.
- **`vite preview`** answers missing asset paths with `index.html`. A real static host must keep asset 404s while falling back for routes.
- **Cart semantics:** no live POST was sent, so cart identity, the `session_id` cookie, and idempotency remain unverified.
- **Manual checks not run:** a screen-reader session, real 200% browser zoom (the 640 px reflow was the proxy), and checks on physical devices.

## Remaining SDD steps

- **7.4:** publish to a public repository after authorization, then run CI once.
- **7.5:** done. Specs are synced into `openspec/specs/` and this change is archived.
