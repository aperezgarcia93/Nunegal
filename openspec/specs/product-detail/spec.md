# Product detail specification

## Purpose

Describe required device information and valid variant selection. New capability. **Mandate** means PDF obligation; **Decision** means selected prototype behavior. See [source register](../../changes/archive/2026-10-13-project-implementation/exploration.md).

## Requirements

### Requirement: PDP-01 — Required device information

The PDP MUST retrieve and show its product image and at least brand, model, price, CPU, RAM, operating system, screen resolution, battery, cameras, dimensions, and weight. Required attribute labels MUST remain present when values are absent, showing an unavailable label. Multiple supplied camera values MUST remain understandable. Prices MUST follow CAT-03 currency/blank-value rules; missing images MUST have a useful fallback. The exact remote keys and types MUST be established by the contract-validation task rather than assumed from display labels.

**Mandate:** PDF-12, PDF-16 (pp. 4, 6). **Decision:** explicit fallbacks rather than fabricated values; contract mapping is validated before implementation.

#### Scenario: PDP-01a — Complete attributes
- GIVEN a valid detail fixture containing each required attribute
- WHEN the PDP loads
- THEN every required attribute and image is visible, including all supplied camera information.

#### Scenario: PDP-01b — Partial display data
- GIVEN valid detail identity with missing battery, weight, and price
- WHEN the PDP renders
- THEN those labels show unavailable values without zeros or invented units/currency, and other attributes remain visible.

### Requirement: PDP-02 — Visible color and storage selectors

The PDP MUST expose labeled storage and color selectors. Each selector with exactly one valid option MUST remain visible and select that option automatically. Each selector with multiple valid options MUST initially require an explicit choice. Selecting either field MUST preserve the other field's selection. Codes MUST be preserved as provided by the validated contract, separately from display labels; the PDF does not define option-combination constraints.

**Mandate:** PDF-13 (p. 5). **Decision:** independently default sole valid options; multiple options start unselected.

#### Scenario: PDP-02a — Sole options
- GIVEN exactly one valid storage and one valid color
- WHEN the product loads
- THEN both selectors are visible and both sole options are selected.

#### Scenario: PDP-02b — Mixed cardinality
- GIVEN one storage option and three color options
- WHEN the product loads, then the visitor chooses a color
- THEN storage is selected automatically, color initially has no selection, and choosing color preserves storage.

#### Scenario: PDP-02c — Multiple options
- GIVEN multiple options for both fields
- WHEN the product first loads
- THEN neither field is selected and adding is blocked until both choices are valid.

### Requirement: PDP-03 — Selection validity and unavailable options

Adding MUST require a loaded product and one valid selected option from each supplied selector. Missing, malformed, or empty options MUST produce an explanatory unavailable state and MUST NOT generate fabricated codes or cart requests. Validity MUST be based on membership and contract-valid code type, not truthiness, so numeric zero MUST remain valid if the contract permits it. Malformed options MUST NOT be silently reinterpreted as a valid sole-option default.

**Mandate:** PDF-14 (p. 5). **Decision:** block missing/invalid codes, explain unavailable selections, preserve code zero if valid.

#### Scenario: PDP-03a — Incomplete selection
- GIVEN multiple colors and no selected color
- WHEN the visitor reaches the Add action
- THEN the interface explains the required choice and cannot send a cart request.

#### Scenario: PDP-03b — Unavailable options
- GIVEN an empty or malformed storage-option collection
- WHEN the PDP renders
- THEN the storage unavailable reason is visible and no addition can be submitted.

#### Scenario: PDP-03c — Code zero
- GIVEN zero is a valid supplied option code under the validated contract
- WHEN that option and a valid option of the other kind are selected
- THEN the selection is accepted and zero is preserved in the request.

### Requirement: PDP-04 — Product transitions cannot leak state

When the route changes between products, details and selections MUST belong only to the current product. Selections MUST reset according to PDP-02. A late earlier-product response MUST NOT overwrite the currently displayed product, selections, or breadcrumb.

**Decision:** race and state-isolation safeguard for PDF-07/14.

#### Scenario: PDP-04a — Selection reset
- GIVEN choices were made for product A
- WHEN the visitor navigates to product B
- THEN B receives its own sole-option defaults or unselected choices and none of A's selections.

#### Scenario: PDP-04b — Out-of-order requests
- GIVEN A is loading, then navigation requests B
- WHEN B resolves before A
- THEN B remains displayed after A later resolves.

### Requirement: PDP-05 — Detail recovery states

The PDP MUST distinguish loading, loaded, unavailable/not-found, and retrieval failure where the API contract permits that distinction. A failure MUST retain home/back navigation and offer retry where meaningful; invalid local route identifiers MUST not create malformed requests. Errors MUST NOT leave a previously viewed product available for accidental purchase.

**Decision:** resilience supplement to PDF-08/16; status-specific messaging only where supported by actual responses.

#### Scenario: PDP-05a — Missing product
- GIVEN the server responds with a verified not-found outcome
- WHEN the PDP resolves
- THEN an unavailable-product message and back-to-list navigation replace purchase controls.

#### Scenario: PDP-05b — Recoverable failure
- GIVEN a network failure while loading a product
- WHEN the visitor retries and receives valid detail
- THEN the PDP displays that product with fresh selection defaults.
