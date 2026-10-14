# Shell and navigation specification

## Purpose

Provide the two-view application shell required by the brief. This is a new capability. **Mandate** identifies PDF requirements; **Decision** identifies selected prototype behavior beyond the PDF. PDF IDs refer to [exploration.md](../../changes/archive/2026-10-13-project-implementation/exploration.md). MUST/SHALL denote acceptance obligations for this plan; SHOULD denotes a recommendation. Scenario identifiers combine the requirement ID and scenario suffix.

## Requirements

### Requirement: NAV-01 — Two client-routed views

The application MUST use React or Preact and MUST provide only PLP and PDP application views through client-side routing, without SSR or document reloads for internal navigation. Direct loading and refreshing a valid PDP URL MUST resolve when served using the documented SPA fallback configuration. Unknown URLs MUST show a recoverable unavailable state within the shared shell, not introduce another commerce view.

**Mandate:** PDF-01–03 (p. 1). **Decision:** canonical routes `/` and `/products/:productId`, static-server fallback.

#### Scenario: NAV-01a — Client navigation
- GIVEN a loaded PLP and a valid product
- WHEN the visitor opens its card
- THEN the URL identifies that product and the PDP replaces the list without a full document reload.

#### Scenario: NAV-01b — Direct entry and history
- GIVEN a valid PDP URL on the configured static server
- WHEN the visitor loads or refreshes that URL, then navigates home and uses browser Back
- THEN the PDP resolves on direct entry and browser history returns to that product.

#### Scenario: NAV-01c — Unknown route
- GIVEN an unrecognized application path
- WHEN the application renders
- THEN the shared shell shows an unavailable-page message with an operable home link.

### Requirement: NAV-02 — Shared header and breadcrumb

Both views MUST show the same header with a home-linked title/icon, breadcrumb identifying the current location and navigable ancestors, and a right-aligned cart count. The PDP breadcrumb MUST identify the product when available and provide a meaningful generic product label while loading or unavailable.

**Mandate:** PDF-09 (p. 4). **Decision:** current breadcrumb is noninteractive and semantically marked; loading/error titles remain meaningful.

#### Scenario: NAV-02a — Header on both views
- GIVEN either PLP or PDP with a known cart count
- WHEN its header is rendered
- THEN the home control, current-location breadcrumb, and that count are visible.

#### Scenario: NAV-02b — Breadcrumb navigation
- GIVEN a loaded PDP
- WHEN the visitor activates the home breadcrumb or title/icon
- THEN the PLP is displayed; the current-product crumb is identified as the current page.

#### Scenario: NAV-02c — Unavailable product
- GIVEN product loading or retrieval failure
- WHEN the PDP header renders
- THEN a meaningful product breadcrumb and operable home link remain available.

### Requirement: NAV-03 — Explicit back to list

The PDP MUST include an explicit back-to-list link that always reaches the PLP, including when no in-app history exists.

**Mandate:** PDF-08 (p. 3). **Decision:** back control targets PLP even after direct entry; search preservation is not required.

#### Scenario: NAV-03a — Direct-entry return
- GIVEN the PDP was opened directly in a new tab
- WHEN the visitor activates back to list
- THEN the PLP is displayed rather than leaving the application.

### Requirement: NAV-04 — Responsive source layout

The PLP MUST place search above its grid toward the right where space permits and MUST display at most four cards per row. Desktop PDP MUST place the image left of description and actions, with description above actions. Narrow layouts MUST stack content without losing controls or introducing horizontal page overflow at 320 CSS pixels. Exact breakpoints and decorative styling MAY vary.

**Mandate:** PDF-06 (pp. 1–3). **Decision:** small-screen stacking and concrete viewport acceptance.

#### Scenario: NAV-04a — Desktop structure
- GIVEN a 1280 CSS-pixel viewport and at least five products
- WHEN PLP and PDP are inspected
- THEN the PLP has no more than four cards per row and the PDP preserves image-left/description-and-actions-right ordering.

#### Scenario: NAV-04b — Narrow layout
- GIVEN a 320 CSS-pixel viewport
- WHEN either view is used
- THEN required information and controls remain available, the PDP stacks logically, and the page has no horizontal overflow.
