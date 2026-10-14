## Exploration: Mobile-device shopping SPA implementation plan

### Current State

Explored on 2026-10-13 using the SDD exploration and PDF reading skills. Artifact backend: `openspec`, explicitly selected because the user requested project documents. This is planning only; no application implementation exists or was created.

The project directory initially contained only `Prueba frontend ITX (1).pdf`, a seven-page Spanish brief titled **Front-End Test**. There is no application code, package manifest, Git metadata, test suite, OpenSpec configuration, existing specs, or local AGENTS.md. The user-supplied AGENTS.md instructions govern the workflow. All seven pages were text-extracted and visually inspected; endpoint definitions and layouts are images and are absent from ordinary text extraction. The user confirmed that this is a prototype, there are no additional general constraints, and documentation should be in English. Keep architecture and delivery controls proportional to a prototype while meeting the PDF requirements.

#### Source requirements (binding)

| ID | PDF pages | Requirement |
|---|---|---|
| PDF-01 | 1 | Build a mini-application for purchasing mobile devices with only two application views: product list (PLP) and product detail (PDP). |
| PDF-02 | 1 | Use React or Preact. Other JavaScript libraries and a boilerplate are permitted. ES6 JavaScript is permitted; TypeScript is not explicitly mandated or forbidden. |
| PDF-03 | 1 | Deliver a client-routed SPA; no multi-page application and no server-side rendering. |
| PDF-04 | 1 | Provide development START, production BUILD, TEST, and LINT scripts. Proposed conventional package keys are `start`, `build`, `test`, and `lint`; documentation must map them explicitly. |
| PDF-05 | 1 | Submit in a publicly accessible code repository such as GitHub, GitLab, or Bitbucket; show incremental development milestones. Include a README explaining execution and relevant notes, preferably in the first commit. Public release is a later delivery action, not part of this planning request. |
| PDF-06 | 1-3 | Visual styling is open, but preserve the screenshot structure. PLP: common header, search above cards toward the right, responsive product grid with at most four cards per row. PDP: common header, product image in the left column, description above actions in the right column. |
| PDF-07 | 2 | Show all products returned by the API, allow search filtering, and navigate from a selected product to its detail. No pagination or hidden subset is specified. |
| PDF-08 | 3 | Provide a link back from PDP to PLP. |
| PDF-09 | 4 | Header title/icon links home; breadcrumb identifies current page and offers navigation; right side displays the number of items added to the cart. |
| PDF-10 | 4 | Search uses text input, matches brand and model, and filters in real time whenever the input changes. |
| PDF-11 | 4 | Product cards show image, brand, model, and price. |
| PDF-12 | 4 | PDP shows image and at least brand, model, price, CPU, RAM, operating system, screen resolution, battery, cameras, dimensions, and weight. |
| PDF-13 | 5 | PDP exposes storage and color selectors. A selector remains visible when only one option exists and that option is selected by default. |
| PDF-14 | 5 | After selecting options, Add submits product identifier, selected color code, and selected storage-capacity code to the API. |
| PDF-15 | 5,7 | Cart response provides the cart item count. Display that returned value in the header on every view and persist it. |
| PDF-16 | 6-7 | Integrate the three provided API endpoints described below. |
| PDF-17 | 7 | Cache received API data on the client to avoid repeated requests. Cached information expires after one hour and must be revalidated afterward. Browser storage or in-memory client storage is permitted. |

#### API evidence

The PDF specifies the base URL `https://itx-frontend-test.onrender.com/` (p. 6):

| Operation | Method and path | PDF contract |
|---|---|---|
| List products | `GET /api/product` | Array of product objects; illustrative IDs only, fields omitted with ellipses. |
| Product details | `GET /api/product/:id` | One product object; detailed field schema omitted. |
| Add to cart | `POST /api/cart` | Body `{ id, colorCode, storageCode }`; response `{ count }`. Illustrative numeric option codes and count. |

A read-only request to [the product endpoint](https://itx-frontend-test.onrender.com/api/product) succeeded during exploration. Observed list fields: `id`, `brand`, `model`, `price`, `imgUrl`. IDs are opaque strings; prices are strings and sometimes empty. Product image URLs are HTTPS URLs on the API host. These are observations at this date, not a guarantee of the complete API schema. Do not copy the PDF's illustrative `0001` into a numeric identifier model or convert empty prices into zero. Currency is unspecified. No cart mutation was performed. Detail payload, error responses, CORS, option-code types, cart identity/session behavior, and repeated-add behavior remain unverified and need a bounded contract-validation task before implementation decisions depend on them.

#### Ambiguities and proposed assumptions (not PDF requirements)

1. Prefer React + TypeScript + Vite for a small statically hosted SPA, with a lightweight client router. Confirm evaluator restrictions only if they require plain JavaScript. Select compatible supported versions during design and record the lockfile/toolchain rather than guessing versions here.
2. Keep exactly the two product views. Loading, empty, error, and unknown-product outcomes are states of these views; do not introduce cart, checkout, account, admin, or payment screens.
3. Use case-insensitive trimmed substring matching against brand or model on the already fetched list, updated on every input change. Define cross-field phrase matching explicitly in specs. No network search endpoint is provided.
4. Use one column on narrow screens for PDP and a responsive 1-4 column PLP. Breakpoints and styling are design decisions; the desktop screenshot structure remains binding.
5. If multiple selector options exist, start unselected and require a valid choice; auto-select only sole options. If options are absent or invalid, show a useful unavailable state rather than inventing codes.
6. Treat the API count as authoritative: replace the stored count with the successful response value. Never infer `previousCount + 1`, invent a cart-list API, or automatically retry POST after an uncertain outcome. Disable duplicate submission while a request is pending and retain prior count on failure.
7. Persist cart count separately from product-cache entries so one-hour product expiration does not silently reset the badge. Suggested initial count is zero when absent; validate persisted values and tolerate storage failure. The brief does not specify cross-tab synchronization or count expiry, so document the chosen policy.
8. Interpret one-hour caching as read-result reuse for list and detail GETs, not suppression or replay of cart mutations. Cache successful validated data per resource with a schema version and fetch timestamp; fresh means age less than 3,600,000 ms. At exactly the boundary and afterward, refetch before treating data as current. Expired-data/offline behavior, storage failures, future timestamps, and overlapping requests must be specified and tested. No conditional revalidation protocol is promised by the API.
9. Show a neutral unavailable-price label for blank prices and avoid assuming EUR or any other currency without a stated product decision. Preserve required detail labels even when values are missing.
10. Accessibility, resilient error states, strict typing, input/data validation, maintainability, security basics, deterministic tests, CI, and performance budgets are proposed engineering quality goals rather than extra features from the PDF. Keep each proportional to a two-view assessment.

### Affected Areas

All application paths below are proposed, not existing:

- `openspec/changes/project-implementation/` - proposal, capability specs, design, and implementation task plan with traceability to PDF IDs.
- `README.md` - eventual setup, commands, architecture notes, assumptions, API limits, and submission instructions; establish before implementation commits.
- `src/app/` - SPA shell, router, providers, and shared header.
- `src/features/catalog/` - list, search, product cards, detail data, and views.
- `src/features/cart/` - selection submission and shared persisted count.
- `src/shared/` - narrowly scoped API/cache/storage boundaries and truly shared UI utilities.
- `tests/` and colocated tests - contract fixtures, unit/component tests, and end-to-end flows.
- Project tooling and CI - supported runtime, pinned dependency resolution, start/build/test/lint scripts, repeatable checks, and static-host fallback configuration.

### Approaches

1. **Small feature-oriented SPA with an explicit cache adapter** - React, TypeScript, Vite, router, native fetch, component state for search/selections, shared cart context, and a small tested TTL storage adapter.
   - Pros: transparent one-hour contract, low dependency count, easy explanation during review, clear transport/storage/UI boundaries.
   - Cons: cancellation, concurrent-request deduplication, storage errors, and cache invalidation must be implemented deliberately.
   - Effort: Medium.

2. **SPA with a server-state library and persistence support** - same UI stack plus a query library configured for exactly the required freshness and storage rules.
   - Pros: established async-state and request coordination patterns; useful if scope expands.
   - Cons: default stale/refetch/garbage-collection behavior can violate the one-hour no-repeat requirement; adds configuration and persistence complexity for two views.
   - Effort: Medium.

3. **Preact SPA with plain JavaScript** - minimal bundle and explicit runtime validation using the same feature boundaries.
   - Pros: explicitly allowed, small runtime, limited tooling overhead.
   - Cons: weaker compile-time data-contract guarantees unless supplemented; less advantageous if maintainers primarily use React.
   - Effort: Medium.

### Recommendation

Use approach 1 as the planning baseline unless user constraints favor another. Apply separation of concerns at API, cache/storage, domain-data, and presentation boundaries; keep functions small and testable, and avoid a backend, generic repository framework, global store for local UI state, or speculative commerce features. Decide final libraries in the design phase after checking current primary documentation.

Create a complete SDD planning package in dependency order: proposal; capability specs covering shell/navigation, catalog/search, detail/selection, cart, and cache; technical design and decision records; dependency-ordered implementation tasks; PDF-to-spec-to-test traceability and verification/submission criteria. Include concrete acceptance scenarios and failure cases, a route/data/state model, cache algorithm and lifecycle, API normalization, accessibility and responsive states, security and performance expectations, test boundaries, CI gates, static deployment concerns, milestone commits, estimated effort ranges with assumptions, and open decisions. Estimates must not imply a committed deadline or team capacity.

Recommended milestone order: foundation and README; API/schema and cache; shell and PLP; PDP and variant selection; cart persistence; integration/error/accessibility checks; production build and handoff. Contract validation should precede assumptions about detail options or cart behavior. Each milestone should leave a reviewable result and include the relevant tests.

Potential tests should cover behavior, especially expiry boundary at one hour, cache corruption/storage unavailability, search by both fields, all required attributes, single-option defaults, blocked invalid submission, exact option-code payload, returned-count replacement/persistence across navigation and reload, failed and uncertain cart outcomes, request races when changing products, deep-link reloads, keyboard operation, and the maximum four-column layout. Most automated tests should use deterministic API fixtures; any live API smoke test must be explicit and avoid uncontrolled mutations.

### Risks

- The brief provides incomplete schemas and no currency, cart session, or error contract. Contract observation must be separated from source requirements and validated before implementation.
- A public demo API may be slow, unavailable, or behave differently from the intended cart semantics. Record discrepancies rather than hiding them with locally invented counts.
- Applying caching indiscriminately to POST or expiring cart state with product data would contradict the purchasing behavior and persisted badge requirement.
- Request races, invalid persisted JSON, storage denial/quota limits, missing fields/images/prices, and invalid IDs can break otherwise successful happy paths.
- Broad architecture or extra commerce features would increase effort while violating the two-view scope. Keep exhaustive documentation focused on this actual assignment.
- No delivery deadline, preferred UI language, repository owner, hosting target, team capacity, or visual brand is established yet. The user reports no extra general constraints and confirms prototype scope; remaining presentation and delivery choices do not block the plan.

### Ready for Proposal

Yes. The source is sufficiently concrete to prepare the proposal using the labeled assumptions. Before proceeding, the lead should summarize the two-view scope and request the required inter-phase checkpoint under the user's orchestration instructions. The user has confirmed prototype scope, no additional general constraints, and English documentation. UI language/currency expectations can remain documented assumptions if unanswered. No implementation, repository publishing, deployment, or cart mutation is authorized by this exploration phase.
