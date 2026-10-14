# Quality and delivery delta

## ADDED Requirements

### Requirement: QUAL-06 — Shared visual language

The interface MUST draw its colours, radii, spacing, elevation and motion from shared design tokens derived from `DESIGN.md`. Primary actions MUST use the gold pill style, and inputs MUST use cream surfaces. Interactive elevation MUST use coloured glows rather than plain black shadows. Where a DESIGN.md colour would fail WCAG AA as text, it MUST be limited to non-text use, and a darker derived ink MUST carry the text. Micro-interaction animations MUST last 500 ms or less and MUST be disabled when the visitor prefers reduced motion. Game-specific DESIGN.md components are out of scope.

**Decision:** adapt the Flip7 design system to a shop; accessibility (QUAL-02) takes precedence over palette fidelity.

#### Scenario: QUAL-06a — Branded, accessible pages
- GIVEN the catalog, a product detail, the 404 page and the error states
- WHEN they render at 320, 640, 768 and 1280 px
- THEN they use the shared tokens, show no horizontal overflow, and pass the axe WCAG 2.1 A/AA scan, including colour contrast.

#### Scenario: QUAL-06b — Reduced motion
- GIVEN a visitor who prefers reduced motion
- WHEN they hover, focus or press cards and buttons
- THEN no transform or transition animation plays.
