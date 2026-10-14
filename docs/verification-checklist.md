# Implementation verification checklist

**Environment:** macOS (Darwin 25.5, arm64), Node.js 22.22.0, npm 10.

**Final state:** verified on 2026-10-14 on a clean clone of commit `29a9147`. This covers the visual redesign, the option buttons and the units. The first full verification was at `3779570` on 2026-10-13.

No deployment or live cart mutation was performed. Per-scenario results are in the [verification report](../openspec/changes/archive/2026-10-13-project-implementation/verification-report.md). Later changes record their own checks in [apply-visual-design](../openspec/changes/archive/2026-10-13-apply-visual-design/tasks.md) and [close-brief-gaps](../openspec/changes/archive/2026-10-14-close-brief-gaps/tasks.md).

## Automated checks

- [x] `npm ci` in a clean copy: passed, 0 vulnerabilities.
- [x] `npm run lint`: passed with `--max-warnings 0`.
- [x] `npm run typecheck`: passed.
- [x] `npm test`: passed, 18 files and 51 tests (Vitest 4.1.11, capped at two workers). Unhandled requests fail the suite.
- [x] `npm run build`: passed. JS 203.89 kB (67.13 kB gzip), CSS 15.62 kB (3.90 kB gzip), HTML with a production CSP.
- [x] `npm run test:e2e`: passed, 68 tests on Chromium, Firefox and WebKit against a fresh production build. One intentional skip: the WebKit keyboard test, because WebKit does not Tab to links by default. A 3× repeat at `3779570` showed no flakes.
- [x] `npm audit`: 0 vulnerabilities.
- [x] Gate failures: a temporary failing test exited 1, a lint violation 1, a type error 2.
- [x] `npm run start`: served `/` and `/products/abc` with HTTP 200. `vite preview` also serves direct product routes (SPA fallback).
- [x] GitHub Actions: [run 38616638924](https://github.com/aperezgarcia93/Nunegal/actions/runs/38616638924) passed every gate for `c0ddbd5`, which has the same code as `29a9147`.
- [x] Clean `git clone` of commit `29a9147`: `npm ci`, lint, typecheck, unit tests, build and the e2e suite passed.
- [x] Incremental history: every commit from the scaffold onwards passes lint, typecheck, unit tests and build on its own.

## Browser and accessibility acceptance

- [x] Layout at 320, 640 (equivalent to 200% zoom of 1280), 768 and 1280 CSS px: 1/2/3/4 catalog columns, no horizontal overflow, PDP image left at ≥ 761 px and stacked below. Screenshots are written to `test-results/screenshots/` on each run.
- [x] axe-core WCAG 2.1 A/AA scan of the catalog, PDP and unknown route: 0 violations in all three engines.
- [x] Keyboard-only journey (search → card → choose storage with the arrow keys → add) in Chromium and Firefox; the route heading receives focus after navigation.
- [x] Visible focus on the search field (`:focus-within` outline) and on option pills (`:has(:focus-visible)`). The global `:focus-visible` outline covers the other controls.
- [x] Reduced motion: transitions are 500 ms or less and are disabled under `prefers-reduced-motion: reduce` (e2e).
- [x] Status semantics: loading `status`, failure `alert`, and a polite live region for cart results (unit-tested).
- [x] No uncaught page errors and no CSP violations in any engine, with no exclusions. The earlier WebKit native `<select>` report went away when the options became radio buttons.
- [ ] Manual screen-reader session (VoiceOver/NVDA): not run.
- [ ] Real browser zoom at 200% and physical mobile devices: not run; the 640 px reflow is the automated proxy.

## Safety and production review

- [x] Remote strings render as React text; there is no `dangerouslySetInnerHTML`. Markup-like fixture content renders inertly.
- [x] Images are accepted only over HTTPS from the API origin; others use the local fallback. Catalog images are lazy and the PDP image is eager.
- [x] There are no secrets: `VITE_API_BASE_URL` is public, and the HTTP client rejects non-HTTPS remote bases.
- [x] Search is local: typing produces no requests (unit test).
- [x] Prices and weights: plain numbers are shown as euros and grams; other values are shown as supplied (unit and e2e tests). EUR is a documented assumption.
- [x] The cart POST is never retried automatically; uncertain outcomes warn the visitor before another attempt.

## Service contract evidence

- [x] Read-only list, detail and unknown-id GETs, plus a live three-browser smoke check. See [api-contract.md](./api-contract.md): 100 products, HTTP 500 for unknown ids, 52 s cold start.
- [ ] Live cart POST: not authorized, so cart semantics remain fixture-only.
