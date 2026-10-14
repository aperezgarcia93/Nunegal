# Implementation verification checklist

**Environment:** macOS, Node.js 22.22.0, npm, local workspace; 2026-10-13. No commit exists yet. No production deployment or live cart mutation was performed.

## Automated checks

- [x] `npm test` — passed: 11 test files, 18 tests (Vitest 4.1.11). Vitest is capped at two workers to avoid excessive memory use on the current host.
- [x] `npm run lint` — passed with `--max-warnings 0`.
- [x] `npm run build` — passed; TypeScript check and Vite production build completed. Output: 66 modules; JS 202.93 kB (66.72 kB gzip), CSS 8.17 kB (2.53 kB gzip).
- [ ] `npm run test:e2e` — blocked in the sandbox: Playwright's configured preview server could not bind `127.0.0.1:4173` (`listen EPERM`). Browser-level flows remain unverified.
- [ ] `npm audit --audit-level=low` — unavailable: npm registry audit endpoint could not resolve (`ENOTFOUND registry.npmjs.org`). An earlier dependency installation reported zero vulnerabilities, but this is not a substitute for a completed audit query.
- [ ] Clean-checkout `npm ci`, typecheck script, and preview/direct-route refresh were not run as separate acceptance checks.

## Service contract evidence

- [x] Read-only list and one detail GET were observed; sanitized field/option mappings and uncertainties are in [api-contract.md](./api-contract.md).
- [x] Read-only preflight headers were observed. No cart POST was sent. Browser-engine CORS and live cart response semantics remain unknown.

## Manual/browser acceptance (not run)

- [ ] 320, 768, and 1280 CSS-pixel viewport review.
- [ ] 200% zoom, keyboard-only journey, and screen-reader status/name review.
- [ ] Firefox/WebKit checks and browser-console inspection.

The fixture-backed unit/component suite covers the tested API, normalization, cache, navigation, selector, and cart behaviors. Passing those checks does not imply the unchecked browser or service acceptance items above passed.
