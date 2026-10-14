# Product detail delta

## MODIFIED Requirements

### Requirement: PDP-01 — Required device information

The PDP MUST retrieve and show its product image and at least brand, model, price, CPU, RAM, operating system, screen resolution, battery, cameras, dimensions, and weight. Required attribute labels MUST remain present when values are absent, showing an unavailable label. Multiple supplied camera values MUST remain understandable. Prices MUST follow CAT-03 currency/blank-value rules. A weight that is a plain number MUST be shown in grams, and any other supplied weight MUST be shown as supplied. Missing images MUST have a useful fallback. The exact remote keys and types MUST be established by the contract-validation task rather than assumed from display labels.

**Mandate:** PDF-12, PDF-16 (pp. 4, 6). **Decision:** explicit fallbacks rather than fabricated values. Plain numeric weights are grams, based on a live sample of 13 products ranging from 105 to 700.

#### Scenario: PDP-01a — Complete attributes
- GIVEN a valid detail fixture containing each required attribute
- WHEN the PDP loads
- THEN every required attribute and image is visible, including all supplied camera information, and a plain numeric weight such as `260` reads `260 g`.

#### Scenario: PDP-01b — Partial display data
- GIVEN valid detail identity with missing battery, weight, and price
- WHEN the PDP renders
- THEN those labels show unavailable values without zeros or units/currency, and other attributes remain visible.

### Requirement: PDP-02 — Visible color and storage selectors

The PDP MUST expose labeled storage and color selectors, presented as groups of option buttons (one radio group per kind) following the ACTIONS wireframe. The selected option MUST be indicated by more than colour alone. Each selector with exactly one valid option MUST remain visible and select that option automatically. Each selector with multiple valid options MUST initially require an explicit choice. Selecting either field MUST preserve the other field's selection. Codes MUST be preserved as provided by the validated contract, separately from display labels; the PDF does not define option-combination constraints.

**Mandate:** PDF-13 (p. 5), wireframe p. 3. **Decision:** independently default sole valid options; multiple options start unselected; native radios keep keyboard and screen-reader behaviour.

#### Scenario: PDP-02a — Sole options
- GIVEN exactly one valid storage and one valid color
- WHEN the product loads
- THEN both option groups are visible and both sole options are selected.

#### Scenario: PDP-02b — Mixed cardinality
- GIVEN one storage option and three color options
- WHEN the product loads, then the visitor chooses a color
- THEN storage is selected automatically, color initially has no selection, and choosing color preserves storage.

#### Scenario: PDP-02c — Multiple options
- GIVEN multiple options for both fields
- WHEN the product first loads
- THEN neither field is selected and adding is blocked until both choices are valid.
