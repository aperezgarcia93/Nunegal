# Proposal: Mobile-device shopping prototype

## Intent

Implement the seven-page **Front-End Test** brief in `Prueba frontend ITX (1).pdf` as a maintainable, testable client-side application. A visitor can browse and search mobile devices, inspect a device, select its storage and color, and add that selection through the supplied API while seeing the persisted cart count.

The user requested complete English project documentation, confirmed prototype scope with no additional general constraints, and later authorized implementation. Implementation is now **in progress**. Repository publication and deployment remain outside the authorized work. The PDF is the authoritative source; the numbered `PDF-01`–`PDF-17` requirements in [exploration.md](exploration.md) provide page-level traceability. Engineering defaults below are recommendations, not additional PDF requirements.

## Scope

### In scope

1. **A two-view React or Preact SPA** with client routing: product listing (PLP) and product details (PDP), with no server-side rendering (`PDF-01`–`PDF-03`). Preserve the supplied layout structure while using responsive styling: no more than four product cards per row, and a desktop PDP with image left and description/actions right (`PDF-06`).
2. **Shared navigation and cart indicator:** home-linked title/icon, navigable breadcrumb identifying the current page, PDP back-to-list link, and persisted cart item count in the header on both views (`PDF-08`, `PDF-09`, `PDF-15`).
3. **Complete catalog and live search:** show all returned products, filter locally on brand and model whenever the input changes, and show image, brand, model, and price on cards linking to details (`PDF-07`, `PDF-10`, `PDF-11`).
4. **Product details and valid option selection:** image, brand, model, price, CPU, RAM, operating system, screen resolution, battery, cameras, dimensions, and weight. Show storage and color selectors even for sole options, which are selected automatically (`PDF-12`, `PDF-13`).
5. **API integration:** `GET /api/product`, `GET /api/product/:id`, and `POST /api/cart` against `https://itx-frontend-test.onrender.com`. Submit `{ id, colorCode, storageCode }` with the actual selected codes; update the badge from the response's authoritative `{ count }` (`PDF-14`–`PDF-16`).
6. **One-hour client read caching:** reuse received product data while fresh and revalidate after expiry; keep cart-count persistence separate from product cache lifetime (`PDF-17`, with mutation handling and persistence boundaries explicitly specified in the design).
7. **Proportionate quality and delivery:** meaningful behavior tests, accessible interactions, validated API/storage boundaries, loading/empty/error states, linting, a production build, and documented setup. Required script purposes map explicitly to `start`, `build`, `test`, and `lint`. Plan incremental public-repository delivery with README preferably in the first commit (`PDF-04`, `PDF-05`).
8. **Complete SDD planning artifacts:** capability specifications, technical design, implementation tasks, source-to-acceptance traceability, and verification/handoff criteria. Distinguish binding requirements, selected assumptions, observations, and unresolved API evidence.

### Out of scope

- Cart contents screen, checkout, payments, accounts, administration, or any third application view.
- A custom backend, database, proxy service, authentication system, SSR, or a multi-page application.
- Invented cart APIs, local cart arithmetic replacing the API response, network-backed search, pagination that hides products, or unrequested product filters.
- Enterprise architecture, microservices, speculative abstractions, and exhaustive tests of trivial implementation details.
- Publishing code, choosing the user's repository account, spending on hosting, deploying, or performing cart mutations during planning.

## Approach

Recommend a small feature-oriented **React + TypeScript + Vite** SPA, a lightweight client router, native `fetch`, and a narrowly scoped cache/storage adapter. React satisfies the PDF; TypeScript and Vite are recommended tooling choices. Keep search and variant selections local to their views, shared cart count in a small application context, and remote data handling behind explicit API/cache boundaries. Choose compatible supported versions during implementation preparation and commit a lockfile.

The alternatives considered in exploration were a server-state library with persistence and Preact with plain JavaScript. A server-state library adds useful lifecycle features but requires careful control of defaults to avoid redundant requests during the specified freshness window; plain JavaScript loses useful compile-time checks at the incomplete API boundary. The explicit adapter is the recommended baseline because the application has only two read resources and a single mutation. Revisit only if implementation evidence shows the adapter becoming disproportionate.

Start with bounded contract validation before locking down detail field mappings, option-code types, or cart semantics. Only the list payload was observed during exploration; the PDF does not supply full schemas. Validate inputs at external boundaries, normalize display data, preserve opaque identifiers and option codes, and expose missing data without fabricating values. Most tests use deterministic representative fixtures; live service checks remain a separately documented step.

Implement incrementally: foundation/README; API contract and cache; shell/catalog; details/options; cart integration; integration/accessibility/resilience verification; build and submission readiness. Every milestone has testable acceptance outcomes and a reviewable commit. Later specs and design define precise states, cache rules, route handling, and failure behavior; tasks tie those decisions to files and verification evidence.

## Recommended assumptions requiring explicit documentation

- Case-insensitive, trimmed, real-time substring search against brand or model; specs decide cross-field phrase behavior.
- Multiple-option selectors begin unselected; sole valid options are automatically selected. Missing valid options prevent submission with an explanatory state.
- English UI as the planning default; documentation is English by user request. Currency remains unspecified: do not invent a currency symbol, and show an unavailable-price label for a blank value.
- Fresh product cache means age strictly less than 3,600,000 ms. At the boundary, fetch before treating data as current. Do not cache or automatically replay POST requests.
- Persist the API-returned count independently, start at zero if no valid count exists, and replace rather than increment it after success. Storage failure must not crash the application. A failed or uncertain POST preserves the previous known count; pending submission blocks duplicates.
- Responsive mobile layouts, accessible controls, safe error messages, deterministic tests, and CI are engineering recommendations. No deadline, team size, hosting vendor, or delivery budget is assumed.

## Affected areas

All application paths are proposed; the repository initially contained only the source PDF.

| Area | Impact | Description |
|---|---|---|
| `openspec/changes/project-implementation/` | New | Proposal, specs, design, tasks, traceability, and verification plan. |
| `README.md` | Planned new | Setup, commands, architecture, assumptions, API limits, and submission instructions. |
| `package.json`, lockfile, TypeScript/Vite/lint configs | Planned new | Repeatable development, build, test, and lint toolchain. |
| `src/app/` | Planned new | SPA shell, routes, providers, shared header and breadcrumb. |
| `src/features/catalog/` | Planned new | Catalog, search, cards, detail presentation, and option selection. |
| `src/features/cart/` | Planned new | Add request lifecycle and shared persisted count. |
| `src/shared/` | Planned new | API validation/normalization, cache/storage adapters, narrowly shared utilities. |
| Colocated tests and `tests/` | Planned new | Unit/component scenarios, contract fixtures, and critical end-to-end flows. |
| `.github/workflows/` or equivalent CI | Planned new | Reproducible checks; platform follows eventual repository selection. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Detail schema, option-code types, and cart identity/count semantics differ from assumptions. | High | Early bounded contract-validation task; record findings; preserve server authority; update fixtures/spec decisions explicitly. |
| Public API is slow, unavailable, or inaccessible through browser CORS. | Medium | Timeouts/cancellation, useful retry states, mocked automated tests, browser connectivity smoke check; document service blockers. |
| Cache behavior repeats requests before expiry or serves expired data as current. | Medium | Explicit per-resource timestamp rules and tests at the exact one-hour boundary; concurrent-request deduplication. |
| Corrupt/denied storage or request races break navigation or state. | Medium | Validated versioned entries, safe fallback, race protection, targeted failure tests. |
| An uncertain POST outcome causes accidental duplicate addition. | Medium | Disable pending submissions, no automatic POST retry, preserve last confirmed count and explain uncertainty. |
| Empty prices or missing fields produce misleading information. | Medium | Neutral fallbacks and no invented currency, values, or option codes. |
| Exhaustive planning grows into excessive implementation scope. | Medium | Trace tasks to PDF requirements or clearly justified quality goals; retain exactly two product views. |

## Rollback plan

Planning artifacts can be revised independently without affecting a running application. During implementation, use small milestone commits and revert a failing change to the last verified commit; retain the PDF and planning history. Before deployment, verify the production build and direct-route reloads. If a later static release fails, restore the previous verified build using the chosen host's rollback mechanism. Cache schema changes must use versioned keys and discard incompatible entries safely; never clear unrelated browser storage or reset the cart count as a side effect of product-cache invalidation. Reverting UI code cannot reverse cart mutations already accepted by the remote service, so avoid uncontrolled live mutation checks.

## Dependencies

- The local source PDF and its visually inspected endpoint/layout diagrams.
- Supplied API availability and permission to access it from the chosen browser origin; complete schema/CORS/session behavior must be checked before dependent implementation.
- Supported Node.js/package-manager versions and mutually compatible frontend/test dependencies, selected and pinned during setup.
- A user-owned public repository for eventual submission and a static host with SPA route fallback only if deployment is desired. Neither is a prerequisite for completing this plan.
- No backend development, paid service, or production infrastructure is required by the brief.

## Success criteria

- [ ] Every `PDF-01`–`PDF-17` requirement maps to a specification, implementation task, and verification scenario.
- [ ] Exactly two client-routed product views satisfy the PDF structure and support direct URL loading under the intended serving configuration.
- [ ] All returned products display; brand/model search updates immediately; cards and details expose all required information.
- [ ] Sole options remain visible and selected; invalid/incomplete selections cannot submit; valid selections send exact API identifiers/codes.
- [ ] Successful additions replace the badge with the returned count, and that value survives navigation and reload; failed/uncertain requests do not fabricate updates.
- [ ] Fresh list/detail results avoid repeated requests for one hour; expiry at exactly one hour causes revalidation; cache and storage failures have verified safe behavior.
- [ ] Required scripts execute successfully; behavior, failure-state, responsive, and accessibility checks provide documented evidence.
- [ ] README and incremental milestone history make the project reproducible and reviewable; eventual public repository access satisfies the handoff requirement.
- [ ] The English planning package is complete, internally consistent, and ready for a separately authorized implementation phase.
