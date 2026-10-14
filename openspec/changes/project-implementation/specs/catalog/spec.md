# Catalog specification

## Purpose

Describe browsing and real-time local filtering. New capability; **Mandate** denotes PDF obligations and **Decision** denotes prototype choices. Source IDs are defined in [exploration.md](../../exploration.md).

## Requirements

### Requirement: CAT-01 — Complete catalog

**Mandate:** PDF-07, PDF-16 (pp. 2, 6). **Decision:** preserve API order; distinguish empty response from no filter matches.

The PLP MUST retrieve the supplied product collection and show every valid returned product without pagination, arbitrary truncation, or hidden subsets. A valid empty collection MUST produce a catalog-empty state. A malformed collection MUST follow DATA-02 rather than silently hiding products.

#### Scenario: CAT-01a — All products
- GIVEN a successful collection containing 37 valid products
- WHEN the PLP finishes loading with an empty search
- THEN all 37 products are represented in response order.

#### Scenario: CAT-01b — Empty catalog
- GIVEN a successful empty array response
- WHEN loading completes
- THEN a catalog-empty message is displayed without a request-failure message.

### Requirement: CAT-02 — Real-time brand or model search

**Mandate:** PDF-10 (p. 4). **Decision:** case-insensitive trimmed substring matching on each field separately.

Every input change MUST immediately filter the already loaded collection by a case-insensitive substring match of the trimmed query against brand OR model. Empty/whitespace-only queries MUST show all products. Search MUST NOT require submission or cause an API request. A phrase spanning brand and model MUST NOT match solely because the fields could be concatenated. Accent folding, fuzzy search, URL persistence, and history restoration are not required.

#### Scenario: CAT-02a — Brand and model matches
- GIVEN products with brand `Acme` and model `Orbit 2`
- WHEN the visitor types `  ACME ` or `orbit`
- THEN the matching products appear after that input change without submitting or fetching.

#### Scenario: CAT-02b — Cross-field phrase
- GIVEN a product with brand `Acme` and model `Orbit 2`
- WHEN the visitor types `Acme Orbit`
- THEN that product does not match unless either individual field contains that complete phrase.

#### Scenario: CAT-02c — Clearing and no matches
- GIVEN the full collection has products
- WHEN a query matches none, then the visitor clears it or enters only spaces
- THEN the first state shows a no-matches message and the second restores every product.

### Requirement: CAT-03 — Product card information

**Mandate:** PDF-11 (p. 4). **Decision:** missing-display-data fallbacks and no assumed currency.

Each card MUST expose image, brand, model, and price. Missing text MUST use an explicit unavailable label; a blank price MUST NOT become zero or acquire an invented currency. An unavailable or failed image MUST have a stable fallback and a useful accessible product description.

#### Scenario: CAT-03a — Complete card
- GIVEN a product with all card fields
- WHEN its card renders
- THEN the image, brand, model, and supplied price are displayed without an assumed currency symbol.

#### Scenario: CAT-03b — Missing presentation fields
- GIVEN a valid product identity with blank price and a failed image URL
- WHEN its card renders and image loading fails
- THEN price is marked unavailable and a fallback replaces the broken image while the product remains navigable.

### Requirement: CAT-04 — Product identity navigation

**Mandate:** PDF-07 (p. 2). **Decision:** opaque route identity and keyboard link behavior.

Each card MUST provide a semantic keyboard-operable link to the detail of its exact opaque product identifier. Product identifiers MUST NOT be numerically coerced or replaced by list indices.

#### Scenario: CAT-04a — Correct identity
- GIVEN two cards with different opaque string identifiers
- WHEN either card link is activated by pointer or keyboard
- THEN the corresponding identifier determines the PDP request and route.

### Requirement: CAT-05 — Catalog loading and recovery

**Decision:** resilience supplement to PDF-07/16; not an additional PDF feature.

The PLP MUST distinguish pending, ready, empty, filtered-empty, and failed outcomes. On a failed or malformed response it MUST preserve navigation, show a useful error, and provide a user-initiated retry. It MUST NOT present a failure as an empty successful catalog.

#### Scenario: CAT-05a — Pending to success
- GIVEN no fresh collection is available
- WHEN retrieval begins and later succeeds
- THEN a loading indication is replaced by the returned catalog.

#### Scenario: CAT-05b — Failure and retry
- GIVEN collection retrieval fails
- WHEN the visitor activates retry and the next request succeeds
- THEN the error is replaced by the loaded collection without reloading the document.
