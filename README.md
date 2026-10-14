# Nunegal mobile device shop prototype

A small React application for browsing mobile devices, viewing specifications, selecting storage and color, and adding a selection through the supplied test API.

## Status

Scaffolded. The source brief is [`Prueba frontend ITX (1).pdf`](./Prueba%20frontend%20ITX%20(1).pdf). The app will have two views: a product list at `/` and product details at `/products/:productId`.

The [implementation plan](./docs/plans/2026-10-13-project-implementation.md) links the SDD proposal, requirements, design, task checklist, and traceability matrix.

## Development

Requires Node.js 22.22.0 (or a compatible Node 22 release at least 22.13.0) and npm 10. Install dependencies with `npm ci`, then run `npm run start`. The development server URL is printed in the terminal.

Available checks: `npm run build`, `npm test`, `npm run lint`, and `npm run typecheck`.
