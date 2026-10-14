# Cart specification

## Purpose

Add the selected variant and display the persisted server-returned count. No cart contents or checkout view is introduced. **Mandate** denotes the PDF; **Decision** denotes safeguards. See [source register](../../changes/archive/2026-10-13-project-implementation/exploration.md).

## Requirements

### Requirement: CART-01 — Exact variant submission

For a valid selection, Add MUST send `POST /api/cart` with JSON `{ id, colorCode, storageCode }`, preserving the exact product identifier and contract-valid selected code values/types. Labels and indices MUST NOT replace codes. A successful addition MUST show confirmation and apply CART-02. Product price availability MUST NOT be invented as an additional purchase restriction when valid options exist.

**Mandate:** PDF-14/16 (pp. 5–7). **Decision:** no optimistic badge arithmetic.

#### Scenario: CART-01a — Exact payload
- GIVEN a loaded product and valid color/storage selections
- WHEN Add is activated
- THEN one POST contains the product ID and selected codes, and a valid successful response confirms addition.

#### Scenario: CART-01b — No premature update
- GIVEN the current confirmed count is 2
- WHEN a valid addition is pending
- THEN the header remains 2 until a valid response supplies a replacement.

### Requirement: CART-02 — Authoritative returned count

After a successful response with a valid `count`, the shared badge MUST replace its value with that returned count on both views. It MUST NOT infer an increment, assume monotonic growth, or invent a cart-read API. Invalid response counts MUST be handled as unconfirmed outcomes under CART-04.

**Mandate:** PDF-15 (pp. 5, 7). **Decision:** valid count is a finite nonnegative safe integer; zero is valid.

#### Scenario: CART-02a — Replacement rather than increment
- GIVEN the existing count is 7
- WHEN a successful addition returns count 3
- THEN the badge becomes 3 on PDP and remains 3 after navigation to PLP.

#### Scenario: CART-02b — Zero and invalid values
- GIVEN an existing confirmed count
- WHEN a response supplies zero
- THEN zero is accepted; if a later response supplies a negative, fractional, nonfinite, missing, or wrong-type count, the last confirmed count remains unchanged.

### Requirement: CART-03 — Reload persistence independent of product TTL

The application MUST persist valid confirmed counts and restore them on reload when browser storage is available. Without a valid stored count it MUST start at zero. Product-cache expiration/invalidation MUST NOT reset the badge. Denied or failed storage MUST leave navigation and additions usable with the count held for the current app session; the README MUST explain that persistence cannot survive reload when browser storage is unavailable. No cart identity, cross-tab behavior, or authoritative synchronization beyond POST responses is promised by the brief.

**Mandate:** PDF-09/15 (pp. 4, 5, 7). **Decision:** initial count zero, no automatic count expiry, no guaranteed cross-tab synchronization.

#### Scenario: CART-03a — Reload after expiry
- GIVEN a confirmed count is persisted
- WHEN the visitor reloads more than one hour later
- THEN that count is restored while expired product data is revalidated separately.

#### Scenario: CART-03b — Corrupt or denied storage
- GIVEN stored count data is corrupt or storage reads are denied
- WHEN the application starts
- THEN it starts safely at zero; subsequent valid additions update the in-session badge even if persistence fails.

### Requirement: CART-04 — Failed or uncertain addition

A failed, timed-out, disconnected, or malformed-response addition MUST preserve the last confirmed count, display a useful error, and MUST NOT automatically retry the POST. If acceptance is uncertain, messaging MUST explain that the addition could have reached the service and another attempt may add again. A visitor MAY explicitly attempt another addition after the pending state ends. The client MUST NOT claim that a local timeout undid a remote change.

**Decision:** safe mutation behavior; API error/idempotency guarantees remain unverified.

#### Scenario: CART-04a — Server rejection
- GIVEN count 4 and an explicit failed addition response
- WHEN the request ends
- THEN count remains 4 and an error is shown with no automatic second POST.

#### Scenario: CART-04b — Unknown outcome
- GIVEN an addition was sent
- WHEN the connection fails before a valid response is received
- THEN the previous count remains, uncertainty is explained, and no automatic retry occurs.

### Requirement: CART-05 — Pending submission coordination

At most one cart request MUST be pending in the application at a time. Repeated activation while pending MUST NOT duplicate it. The pending state MUST be communicated accessibly. Navigation MUST remain possible, and a late successful response MUST still update the shared count without attributing its confirmation to a different product. Selections SHOULD remain after a completed addition so a deliberate repeat is possible.

**Decision:** global single pending mutation for a prototype without an idempotency contract.

#### Scenario: CART-05a — Repeated activation
- GIVEN an addition is pending
- WHEN Add is activated repeatedly, including after navigating to another PDP
- THEN no second cart request is sent until the first settles.

#### Scenario: CART-05b — Navigate during addition
- GIVEN product A has a pending addition
- WHEN the visitor navigates to B and A's response succeeds
- THEN the shared count updates, B's selection state remains intact, and any confirmation identifies A or is product-neutral.
