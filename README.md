# Nunegal mobile device shop prototype

Repository: <https://github.com/aperezgarcia93/Nunegal>

A small React application for browsing mobile devices, viewing specifications, selecting storage and color, and adding a selection through the supplied test API.

## Scope and project documents

The source brief is [`Prueba frontend ITX (1).pdf`](./Prueba%20frontend%20ITX%20%281%29.pdf). The app has two commerce views: the catalog at `/` and product details at `/products/:productId`. The [implementation plan](./docs/plans/2026-10-13-project-implementation.md) links the SDD proposal, requirements, design, task checklist, traceability matrix and [verification report](./openspec/changes/archive/2026-10-13-project-implementation/verification-report.md). Accepted specifications live in [`openspec/specs/`](./openspec/specs/).

## Development

Requires Node.js 22.22.0 (`.nvmrc`; any Node 22 ≥ 22.13.0 works) and npm 10.

```sh
nvm use                 # or otherwise select Node 22
npm ci                  # lockfile install
npm run start           # Vite dev server; the URL is printed in the terminal
```

Copy `.env.example` to `.env` only to point at a different public API base URL.

| Command | Purpose |
|---|---|
| `npm run start` | Development server |
| `npm run build` | Type-check and production build into `dist/` |
| `npm test` | Unit, component and integration tests (Vitest, runs once) |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | TypeScript without emitting |
| `npm run test:e2e` | Playwright on Chromium, Firefox and WebKit against a fresh production build |
| `npm run preview` | Serve the built `dist/` locally |

Before the first browser test run, install the browsers once with `npx playwright install chromium firefox webkit`. Use `npx playwright test --project=chromium` for a faster single-browser run. CI (`.github/workflows/ci.yml`) runs every check above on push and pull request.

## Testing

All automated tests use fixtures; none of them reach the live service. Vitest uses MSW and fails any unhandled request. Playwright intercepts every request to the API origin (`tests/e2e/support.ts`). The browser suites cover these areas:

- **Shopping journeys:** search, detail, exact cart payload, returned-count replacement, reload persistence, history, direct entry, unknown routes, and a keyboard-only journey.
- **Recovery:** list and detail retry, a single pending addition across navigation, malformed or lost cart responses without replay, out-of-order product responses, and one-hour cache expiry using a controlled clock.
- **Quality:** axe-core WCAG 2.1 A/AA scans, 320/640/768/1280 px layouts, focus visibility, reduced motion, and absence of console or CSP errors.

## Visual design

The look and feel follows [`DESIGN.md`](./DESIGN.md), the Flip7 retro teal, coral and gold system, adapted for a shop. All colours, radii, spacing, glows and motion are tokens in `src/styles/tokens.css`. Shared classes (buttons, ribbon eyebrow, state cards) live in `src/styles/global.css`. The rest of the styling is in each component's CSS module.

- **Not used:** the game-only components (BOOM, rankings, confetti, the FLIP7 logo).
- **Contrast:** DESIGN.md teal and coral fail WCAG AA as text, so they are used only for fills, borders and glows; text uses darker inks.
- **Motion:** stays at 500 ms or less and turns off when the visitor prefers reduced motion.

See requirement QUAL-06 in [`openspec/specs/quality-delivery/spec.md`](./openspec/specs/quality-delivery/spec.md).

## Architecture and behavior

React, TypeScript, Vite and React Router provide a client-routed SPA:

- `src/shared/api/http.ts` is the only network boundary. It enforces a 20 s timeout, uses typed errors, and rejects non-HTTPS remote bases.
- `src/features/catalog/model/normalizeProduct.ts` validates and normalizes service data. Images are accepted only over HTTPS from the API origin.
- `src/shared/cache/productCache.ts` caches the list and each detail independently for exactly one hour, keeps the cache in `localStorage` with an in-memory fallback, and coalesces concurrent reads.
- `src/features/cart/` sends the exact `{ id, colorCode, storageCode }` and stores the count the service returns under its own key, so the count does not expire with the product cache.

Search is local and never requests data. Colour and storage options are rows of pill buttons, as in the brief's wireframe; they use native radio groups for keyboard and screen readers. Both rows are always visible, and an option is preselected only when it is the only one. A cart addition is never retried automatically. If the outcome is uncertain, the visitor is told that another attempt may add another item. Only one addition can be pending in the whole app.

The production build adds a Content-Security-Policy that allows only same-origin scripts and styles, and the API origin for data and images. Internal links use `/` and `/products/:productId`. A static host must serve `index.html` for those routes (SPA fallback) while still returning 404 for missing assets. It should also send the CSP as a header with `frame-ancestors`.

## Configuration and known limitations

- **API base:** `VITE_API_BASE_URL` is public configuration and defaults to `https://itx-frontend-test.onrender.com`. It must never contain credentials.
- **Cold starts:** the free-tier service can take about 50 s to wake up. The first request then times out after 20 s, and "Try again" succeeds once the service is warm.
- **Unknown products:** the service answers unknown ids with HTTP 500, so the app shows a retryable error rather than "not found".
- **Prices and weights:** the service sends bare numbers with no currency or unit.
  - A plain numeric price is shown in euros (`€170`). EUR is an assumption based on the brief's Spanish origin.
  - A plain numeric weight is shown in grams (`260 g`).
  - Other values are shown as supplied, and blank prices read "Price unavailable".
- **Cart persistence:** when browser storage is unavailable, the cart count still works for the current session but does not survive a reload.
- **Cart semantics:** no cart read, identity, cross-tab synchronization or idempotency is assumed. No live cart request was sent during development.

Contract observations are recorded in [`docs/api-contract.md`](./docs/api-contract.md), and acceptance evidence in [`docs/verification-checklist.md`](./docs/verification-checklist.md).

This is a prototype. It has no checkout, authentication, custom backend or deployment configuration.

## License

[MIT](./LICENSE).
