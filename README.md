# Nunegal mobile device shop prototype

A small React application for browsing mobile devices, viewing specifications, selecting storage and color, and adding a selection through the supplied test API.

## Scope and project documents

The source brief is [`Prueba frontend ITX (1).pdf`](./Prueba%20frontend%20ITX%20(1).pdf). The app has two commerce views: the catalog at `/` and product details at `/products/:productId`. The [implementation plan](./docs/plans/2026-10-13-project-implementation.md) links the SDD proposal, requirements, design, task checklist, and traceability matrix.

## Development

Requires Node.js 22.22.0 (or a compatible Node 22 release at least 22.13.0) and npm 10. Install dependencies with `npm ci`, copy `.env.example` to `.env` only when changing the public API base URL, then run `npm run start`. The development server URL is printed in the terminal.

Available checks: `npm run build`, `npm test`, `npm run lint`, and `npm run typecheck`. `npm run test:e2e` exercises the built SPA in Chromium; install its browser once with `npx playwright install chromium`.

## Architecture and behavior

React, TypeScript, Vite, and React Router provide a client-routed SPA. Product requests are validated at the API boundary and cached independently for one hour. Cart count persistence uses a separate browser-storage key. Search is local. Internal links use `/` and `/products/:productId`; a static host must serve `index.html` for those routes (SPA fallback) to support direct entry and refresh.

The API base is public configuration (`VITE_API_BASE_URL`) and defaults to `https://itx-frontend-test.onrender.com`; it must never contain credentials. The supplied service may be unavailable or block browser CORS. We do not invent currency for raw price strings. When browser storage is unavailable, cart count remains available for the current session but cannot survive a reload. No cart read, identity, cross-tab synchronization, or idempotency guarantee is assumed. Product schema observations and outstanding limitations are recorded in [`docs/api-contract.md`](./docs/api-contract.md).

This is a prototype. It has no checkout, authentication, custom backend, or deployment configuration.
