# Client data specification

## Purpose

Define API boundary behavior and one-hour product caching without assuming undocumented server guarantees. **Mandate** means PDF obligation; **Decision** means selected client policy. See [source register](../../exploration.md).

## Requirements

### Requirement: DATA-01 — Supplied service integration

**Mandate:** PDF-16 (pp. 6–7). **Decision:** bounded requests, safe identities, validation before dependent implementation.

The application MUST integrate `https://itx-frontend-test.onrender.com` through `GET /api/product`, `GET /api/product/:id`, and `POST /api/cart`. Identifiers MUST remain opaque and be safely encoded when used in URL paths. Loading MUST settle into success or an actionable failure within a documented finite timeout. Detail schema, option-code types, browser CORS, and cart/session behavior MUST be recorded as verified evidence or explicit unresolved limitations before implementation relies on them. The client MUST NOT assume unsupported conditional requests, authentication, cookies, or idempotency semantics.

#### Scenario: DATA-01a — Read identities
- GIVEN a contract-valid product ID containing characters requiring path encoding
- WHEN its details are requested
- THEN the request targets one safely encoded ID path segment and preserves its identity.

#### Scenario: DATA-01b — Unresponsive service
- GIVEN a service request never resolves
- WHEN the documented timeout elapses
- THEN pending UI ends with the applicable recovery/uncertainty message.

### Requirement: DATA-02 — Validate external data

**Decision:** integrity safeguard supporting PDF-07/12/14–17.

The client MUST validate successful status, parseable response data, and minimum operation-specific structure before treating a response as successful or caching it. Missing optional display values MUST use defined fallbacks. Invalid identity/collection structure MUST fail explicitly rather than silently dropping products; invalid purchasing options MAY leave a readable product with purchasing unavailable. Unknown fields MUST NOT cause otherwise valid data to fail. Validation MUST reflect observed evidence without promoting observations into API guarantees.

#### Scenario: DATA-02a — Invalid response
- GIVEN a GET returns non-JSON, a wrong top-level shape, or product data without a usable identity
- WHEN it is processed
- THEN the request becomes a visible failure and its payload is not cached as valid data.

#### Scenario: DATA-02b — Optional and extra fields
- GIVEN a product with valid identity, absent optional display values, and additional unknown fields
- WHEN it is processed
- THEN the product remains usable with fallback labels; invalid options disable purchase without fabricated codes.

### Requirement: DATA-03 — Per-resource one-hour freshness

**Mandate:** PDF-17 (p. 7). **Decision:** strict boundary, success timestamp, separate list/detail entries, no timer-driven screen removal.

Successful validated list and individual-detail GET results MUST be cached independently for reuse. Freshness MUST require `0 <= currentTime - fetchedAt < 3,600,000 ms`, measured from successful retrieval. At each resource access a fresh entry MUST be used without a duplicate network GET; at exactly one hour and later, or with a future timestamp, the resource MUST be fetched before it is treated as current. Reading a cached entry MUST NOT extend its lifetime. Fetching a list MUST NOT imply that full detail is cached. Already-rendered information need not disappear or refetch on a timer; freshness is evaluated on resource access/navigation/retry.

#### Scenario: DATA-03a — Before and at expiry
- GIVEN a resource fetched successfully at time T
- WHEN accessed at T+3,599,999 ms, then at T+3,600,000 ms
- THEN the first access reuses it without a GET and the second initiates revalidation.

#### Scenario: DATA-03b — Independent resources
- GIVEN the list and detail A are fresh but detail B has never been fetched
- WHEN each is requested
- THEN list and A are reused, B is fetched, and none of those reads refreshes another entry's timestamp.

#### Scenario: DATA-03c — Clock anomaly
- GIVEN an entry timestamp later than the current clock
- WHEN that resource is requested
- THEN the entry is treated as invalid and the resource is fetched.

### Requirement: DATA-04 — Reload caching and storage failure

**Mandate:** PDF-17 permits browser or in-memory storage. **Decision:** browser persistence with safe in-session fallback and versioned validation.

When storage is available, fresh product entries MUST survive reload. Missing, malformed, incompatible-version, or invalid-timestamp entries MUST be treated as misses. Storage denial, parse failure, quota exhaustion, or a write error MUST NOT crash the app or discard successfully retrieved data from the current session. Recovery MUST affect only application-owned entries and MUST NOT clear unrelated browser data or the cart count. Unlimited archival storage, cross-tab coordination, and cache-prewarming are not required.

#### Scenario: DATA-04a — Fresh reload
- GIVEN fresh validated product data was persisted
- WHEN the app reloads before expiry
- THEN accessing that resource uses the stored data without a GET.

#### Scenario: DATA-04b — Corruption and version mismatch
- GIVEN malformed JSON or an incompatible cache entry
- WHEN the app accesses that resource
- THEN it fetches a replacement safely while unrelated keys and the cart count remain intact.

#### Scenario: DATA-04c — Storage unavailable
- GIVEN storage reads/writes fail
- WHEN a GET succeeds and the same resource is accessed again while fresh in the current session
- THEN the UI remains usable and in-session data is reused.

### Requirement: DATA-05 — Revalidation failure and request coordination

**Decision:** no expired data presented as current during a new access, no retry storms, duplicate-read coalescing.

On a new access to an expired resource the application MUST show loading, then current data on success or a recoverable error on failure; expired data MUST NOT silently become fresh after failure. Concurrent consumers of the same missing/expired resource MUST share one pending GET. Different resource keys MUST remain independent, and late responses MUST respect PDP-04. Failed reads MUST NOT be cached as successes and retries MUST be user initiated; a valid still-fresh cache entry need not be bypassed by retry logic.

#### Scenario: DATA-05a — Expired resource offline
- GIVEN a cached resource is expired and the network is unavailable
- WHEN the resource is accessed
- THEN loading becomes an actionable error without displaying the expired resource as current or refreshing its timestamp.

#### Scenario: DATA-05b — Concurrent access
- GIVEN no fresh entry for product A
- WHEN two consumers request A before the first request settles
- THEN only one GET for A is sent and both consumers receive the same resolved outcome.

#### Scenario: DATA-05c — Failed read recovery
- GIVEN a GET fails
- WHEN retry is explicitly activated
- THEN a new GET is possible and a later valid success establishes a new freshness timestamp.

### Requirement: DATA-06 — Mutation and cache separation

**Mandate:** PDF-14/15 require additions and returned-count persistence. **Decision:** interpret one-hour reuse as GET data caching, not mutation suppression/replay.

Cart POST requests MUST never be reused, suppressed, replayed, or retried by the product-cache mechanism. Deliberate additions after a previous request settles MUST issue new POSTs. Cart-count persistence MUST be independent of product-cache metadata and expiration. A cart addition MUST NOT invalidate fresh product data without evidence that the mutation changes those resources.

#### Scenario: DATA-06a — Deliberate repeated addition
- GIVEN the first addition succeeded and no request is pending
- WHEN the visitor explicitly adds the same selection again within one hour
- THEN a new POST is sent and its returned count replaces the old one.

#### Scenario: DATA-06b — Cache invalidation isolation
- GIVEN fresh product entries and a persisted cart count
- WHEN product entries expire or are discarded as incompatible
- THEN the cart count is retained; conversely, a successful cart addition does not force fresh product GETs.
