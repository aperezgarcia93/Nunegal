# Tasks: close-brief-gaps

## 1. Option buttons
- [x] 1.1 Update the unit and e2e tests to use radio groups; they fail against the dropdowns.
- [x] 1.2 Replace the dropdowns with fieldset and radio pill groups (`OptionGroup` in `VariantForm.tsx`).
- [x] 1.3 Pill styling: cream, gold when checked with a ✓, focus ring, reduced motion.
- [x] 1.4 Remove the WebKit `<select>` CSP-report filter from the e2e suite, since no `<select>` remains.

## 2. Units
- [x] 2.1 Add `formatPrice` and `formatWeight` with unit tests.
- [x] 2.2 Use them in the card, the detail page and the attributes; update the assertions, including an e2e check.

## 3. Verification (2026-10-14)
- [x] Lint and typecheck are clean.
- [x] Vitest: 51 of 51 pass.
- [x] Playwright: 68 passed and 1 skipped on Chromium, Firefox and WebKit (the existing WebKit keyboard-tab case). This includes axe scans, no horizontal overflow at 320–1280 px, and the CSP check without the WebKit filter.
- [x] Screenshots of the detail page at 375 and 1280 px reviewed.
