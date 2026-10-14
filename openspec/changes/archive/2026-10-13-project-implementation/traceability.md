# Traceability and planned verification

**Status:** verified 2026-10-13. Per-scenario results and evidence are in [verification-report.md](verification-report.md) (64 passed, 1 partially verified, 1 blocked on publication); the "planned" methods below remain the mapping, not the results. Task IDs refer to [tasks.md](tasks.md). Scenario definitions are the acceptance source; validation methods below state how evidence will be obtained. The source register in [exploration.md](exploration.md) records PDF page numbers and separates mandates from engineering decisions.

## PDF → specification → task → evidence

| PDF ID | Specification requirements | Tasks | Planned acceptance evidence |
|---|---|---|---|
| PDF-01 | NAV-01 | 3.1, 6.1 | Exactly two commerce views; unknown state stays in shell |
| PDF-02 | NAV-01, QUAL-01 | 1.3, 7.2 | React build and reproducible toolchain |
| PDF-03 | NAV-01 | 3.1, 6.1, 7.2 | Client navigation and production direct reload; no SSR |
| PDF-04 | QUAL-01 | 1.3, 6.5, 7.2 | start/build/test/lint purposes and exit behavior |
| PDF-05 | QUAL-05 | 1.1, 7.1, 7.2, 7.4 | README, incremental commits, later public unauthenticated access |
| PDF-06 | NAV-04 | 3.3, 3.6, 4.3, 6.3 | Max four cards; image-left PDP; narrow layout evidence |
| PDF-07 | CAT-01, CAT-02, CAT-04 | 3.4, 3.5, 3.6, 6.1 | All 37 fixture products, immediate filter, exact detail identity |
| PDF-08 | NAV-03 | 3.1, 4.3, 6.1 | Direct-entry back-to-list link |
| PDF-09 | NAV-02, CART-03 | 3.2, 5.2, 5.4, 6.1 | Home link, breadcrumb, shared persisted badge |
| PDF-10 | CAT-02 | 3.5, 3.6 | Brand OR model immediate local search |
| PDF-11 | CAT-03 | 2.2, 3.4 | Image/brand/model/price and explicit fallbacks |
| PDF-12 | PDP-01 | 1.2, 2.2, 4.1, 4.3 | Every specified detail attribute and camera value |
| PDF-13 | PDP-02 | 4.2, 6.1 | Visible selectors with sole-option defaults |
| PDF-14 | PDP-03, CART-01, DATA-06 | 4.4, 5.1, 5.4, 5.5 | Exact selected id/colorCode/storageCode payload; no invalid submission |
| PDF-15 | CART-02, CART-03, DATA-06 | 5.1, 5.2, 5.3, 5.5, 6.1 | Replace returned count including lower/zero; persist independently |
| PDF-16 | DATA-01, DATA-02, CAT-01, PDP-01, CART-01 | 1.2, 1.4, 2.1, 2.2, 2.5, 5.1, 6.6 | Three supplied paths; documented contract and bounded transport |
| PDF-17 | DATA-03, DATA-04, DATA-05 | 2.3, 2.4, 2.5, 2.6, 6.2 | Strict one-hour expiry, independent resources, reload/failure/coalescing |

## Complete requirement and scenario coverage

Every named scenario is listed explicitly below. Results for every row are recorded in [verification-report.md](verification-report.md). The final verification report must give each scenario a result and evidence reference; do not mark a row passed merely because a nearby scenario passed.

| Requirement / specification | Scenarios | Tasks | Planned verification method |
|---|---|---|---|
| [CART-01](specs/cart/spec.md) | CART-01a, CART-01b | 4.4, 5.1, 5.3, 5.4, 6.1 | Exact HTTP body/types and pending unchanged-count assertions |
| [CART-02](specs/cart/spec.md) | CART-02a, CART-02b | 5.1, 5.3, 5.4, 6.1 | Zero/lower/invalid response unit/provider + browser header |
| [CART-03](specs/cart/spec.md) | CART-03a, CART-03b | 5.2, 5.5, 6.1, 7.1 | Storage fault unit + clock/reload browser; README limitation |
| [CART-04](specs/cart/spec.md) | CART-04a, CART-04b | 2.1, 5.1, 5.4, 6.2 | Rejection/timeout/malformed response fixtures; count/no-retry assertions |
| [CART-05](specs/cart/spec.md) | CART-05a, CART-05b | 5.3, 5.4, 6.2 | Global provider and cross-route browser pending/request-count checks |
| [CAT-01](specs/catalog/spec.md) | CAT-01a, CAT-01b | 3.6 | PLP component: 37 items in order and valid empty result |
| [CAT-02](specs/catalog/spec.md) | CAT-02a, CAT-02b, CAT-02c | 3.5, 3.6 | Filter unit + PLP input/network assertions |
| [CAT-03](specs/catalog/spec.md) | CAT-03a, CAT-03b | 2.2, 3.4 | Normalizer/card components: supplied fields, price/image fallback |
| [CAT-04](specs/catalog/spec.md) | CAT-04a | 3.4, 6.1 | Card semantic-link component + browser exact opaque identity |
| [CAT-05](specs/catalog/spec.md) | CAT-05a, CAT-05b | 2.6, 3.6, 6.2 | PLP components and browser failure/retry |
| [DATA-01](specs/client-data/spec.md) | DATA-01a, DATA-01b | 1.2, 1.4, 2.1, 6.6 | Bounded contract/CORS evidence + encoded identity/timeout tests |
| [DATA-02](specs/client-data/spec.md) | DATA-02a, DATA-02b | 1.2, 2.1, 2.2, 2.5 | Boundary fixture table: non-JSON/shape/identity/options/extras |
| [DATA-03](specs/client-data/spec.md) | DATA-03a, DATA-03b, DATA-03c | 2.4, 2.5 | Fake-clock unit cases before/at/after TTL, per-key isolation, future time |
| [DATA-04](specs/client-data/spec.md) | DATA-04a, DATA-04b, DATA-04c | 2.3, 2.4, 6.2 | Persisted fresh browser reload + corruption/version/denial/quota unit cases |
| [DATA-05](specs/client-data/spec.md) | DATA-05a, DATA-05b, DATA-05c | 2.5, 2.6, 6.2 | Deferred-response coalescing + expired-offline/retry unit/browser cases |
| [DATA-06](specs/client-data/spec.md) | DATA-06a, DATA-06b | 2.4, 5.1, 5.2, 5.5 | Mutation-repeat and storage/cache-isolation integration assertions |
| [PDP-01](specs/product-detail/spec.md) | PDP-01a, PDP-01b | 1.2, 2.2, 4.1, 4.3 | Recorded contract mapping + complete/partial attribute components |
| [PDP-02](specs/product-detail/spec.md) | PDP-02a, PDP-02b, PDP-02c | 4.2, 6.1 | Variant component cardinality matrix + browser sole/multiple selection |
| [PDP-03](specs/product-detail/spec.md) | PDP-03a, PDP-03b, PDP-03c | 2.2, 4.2, 4.4 | Normalizer/form invalid membership, malformed options, zero-code cases |
| [PDP-04](specs/product-detail/spec.md) | PDP-04a, PDP-04b | 2.6, 4.3, 6.2 | Controlled out-of-order promise + product-transition component/browser |
| [PDP-05](specs/product-detail/spec.md) | PDP-05a, PDP-05b | 2.6, 4.3, 6.2 | Detail error/not-found/explicit retry fixtures; not-found contract evidence |
| [QUAL-01](specs/quality-delivery/spec.md) | QUAL-01a, QUAL-01b | 1.3, 6.5, 7.2 | Clean install, script success and deliberate temporary failure exit checks |
| [QUAL-02](specs/quality-delivery/spec.md) | QUAL-02a, QUAL-02b | 3.2, 3.3, 4.2, 4.4, 5.4, 6.3 | Semantic component checks + keyboard/screen-reader/zoom/contrast record |
| [QUAL-03](specs/quality-delivery/spec.md) | QUAL-03a, QUAL-03b | 2.2, 3.4, 3.6, 6.4 | Untrusted-content fixtures, no-search-fetch assertions, bundle/image review |
| [QUAL-04](specs/quality-delivery/spec.md) | QUAL-04a, QUAL-04b | 1.5, 6.1, 6.2, 6.3, 6.5, 7.2, 7.3 | Offline fixture suites + complete dated verification report |
| [QUAL-05](specs/quality-delivery/spec.md) | QUAL-05a, QUAL-05b | 1.1, 7.1, 7.2, 7.4 | README clean-checkout reproduction + authorized public history inspection |
| [NAV-01](specs/shell-navigation/spec.md) | NAV-01a, NAV-01b, NAV-01c | 3.1, 6.1, 7.2 | Shell component + production browser route/history checks |
| [NAV-02](specs/shell-navigation/spec.md) | NAV-02a, NAV-02b, NAV-02c | 3.2, 4.3, 5.4, 6.1 | Header component + browser breadcrumb/count checks |
| [NAV-03](specs/shell-navigation/spec.md) | NAV-03a | 3.1, 4.3, 6.1 | Direct-entry browser back-to-list check |
| [NAV-04](specs/shell-navigation/spec.md) | NAV-04a, NAV-04b | 3.3, 3.6, 4.3, 6.3 | Recorded 320/768/1280 viewport and zoom inspection |

Coverage inventory: **17 PDF source requirements, 30 specification requirements, 66 named scenarios**. This inventory is a static planning consistency check, not functional verification.

## Evidence record required during implementation

For each scenario, record the implementation commit, test name/file or manual steps, command/environment, observed result, and any residual limitation in `verification-report.md`; link detailed browser/manual evidence in `docs/verification-checklist.md`. Classify results as passed, failed, blocked, or not run. Re-run affected checks after fixes and retain enough detail for another developer to reproduce them.

Deterministic fixture tests provide most application acceptance evidence. Live GET smoke observations are separately dated; they cannot establish cart-session or idempotency guarantees. A live cart check, if later explicitly authorized, is bounded and never automatically repeated. If a contract or CORS blocker remains, the report must say so rather than equating mocked success with verified service integration.

## Completion boundaries

- Planning complete: proposal, six specs, technical design, tasks, index, and this coverage matrix exist and agree.
- Implementation complete: task acceptance checks and all required scenario behavior have actual evidence.
- Delivery complete: reproducible source, README, and incremental history are publicly accessible after publication authorization.
- Archived: accepted implementation specs are synchronized and the completed change/evidence moved by the SDD archive workflow.
