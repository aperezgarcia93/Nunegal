# Implementation verification checklist

**Environment:** macOS (Darwin 25.5, arm64), Node.js 22.22.0, npm 10; 2026-10-13. Base commit `afb9dcb` plus the uncommitted verification changes. No deployment or live cart mutation was performed. Per-scenario results are in the [verification report](../openspec/changes/project-implementation/verification-report.md).

## Automated checks

- [x] `npm ci` in a clean copy: passed, 0 vulnerabilities.
- [x] `npm run lint`: passed with `--max-warnings 0`.
- [x] `npm run typecheck`: passed.
- [x] `npm test`: passed, 17 files and 49 tests (Vitest 4.1.11, capped at two workers). Unhandled requests fail the suite.
- [x] `npm run build`: passed. JS 203.12 kB (66.79 kB gzip), CSS 8.29 kB (2.56 kB gzip), HTML with a production CSP.
- [x] `npm run test:e2e`: passed, 65 tests on Chromium, Firefox and WebKit against a fresh production build. One intentional skip: the WebKit keyboard test, because WebKit does not Tab to links by default. A 3× repeat showed no flakes.
- [x] `npm audit`: 0 vulnerabilities.
- [x] Gate failures: a temporary failing test exited 1, a lint violation 1, a type error 2.
- [x] `npm run start`: served `/` and `/products/abc` with HTTP 200. `vite preview` also serves direct product routes (SPA fallback).
- [ ] GitHub Actions run of `.github/workflows/ci.yml`: not run, because there is no remote yet.
- [ ] Clean `git clone` rerun: pending until the current changes are committed.

## Browser and accessibility acceptance

- [x] Layout at 320, 640 (equivalent to 200% zoom of 1280), 768 and 1280 CSS px: 1/2/3/4 catalog columns, no horizontal overflow, PDP image left at ≥ 761 px and stacked below. Screenshots are written to `test-results/screenshots/` on each run.
- [x] axe-core WCAG 2.1 A/AA scan of the catalog, PDP and unknown route: 0 violations in all three engines.
- [x] Keyboard-only journey (search → card → select → add) in Chromium and Firefox; the route heading receives focus after navigation.
- [x] Visible focus on the search field (`:focus-within` outline). The global `:focus-visible` outline covers the other controls.
- [x] Status semantics: loading `status`, failure `alert`, and a polite live region for cart results (unit-tested).
- [x] No uncaught page errors and no CSP violations from application code. WebKit's native `<select>` CSP report was reproduced in isolation and is excluded.
- [ ] Manual screen-reader session (VoiceOver/NVDA): not run.
- [ ] Real browser zoom at 200% and physical mobile devices: not run; the 640 px reflow is the automated proxy.

## Safety and production review

- [x] Remote strings render as React text; there is no `dangerouslySetInnerHTML`. Markup-like fixture content renders inertly.
- [x] Images are accepted only over HTTPS from the API origin; others use the local fallback. Catalog images are lazy and the PDP image is eager.
- [x] There are no secrets: `VITE_API_BASE_URL` is public, and the HTTP client rejects non-HTTPS remote bases.
- [x] Search is local: typing produces no requests (unit test).
- [x] The cart POST is never retried automatically; uncertain outcomes warn the visitor before another attempt.

## Service contract evidence

- [x] Read-only list, detail and unknown-id GETs, plus a live three-browser smoke check. See [api-contract.md](./api-contract.md): 100 products, HTTP 500 for unknown ids, 52 s cold start.
- [ ] Live cart POST: not authorized, so cart semantics remain fixture-only.
