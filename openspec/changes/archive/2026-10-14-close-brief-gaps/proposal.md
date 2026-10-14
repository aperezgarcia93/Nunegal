# Proposal: Close the remaining brief gaps

## Intent

A review of the implementation against `Prueba frontend ITX (1).pdf` found two presentation gaps:

1. **Options.** The ACTIONS wireframe (p. 3) draws the options as rows of buttons, and the app used dropdown menus. The brief asks for the captured structure to be followed.
2. **Units.** Prices ("170") and weights ("260") were shown as bare numbers.

## Changes

- **Option buttons.** Colour and storage options are pill buttons with radio-group semantics: a fieldset and legend, native radios, and a ✓ on the chosen option so the choice does not rely on colour alone. Sole options are still pre-selected, and pending or invalid states disable the group.
- **Units.**
  - A price that is a plain number is shown in euros (`€170`).
  - A weight that is a plain number is shown in grams (`260 g`).
  - Any other value is shown exactly as supplied, and blank values keep their unavailable labels.

## Assumptions

- **Currency:** the service does not state one. EUR is assumed because the brief comes from a Spanish retailer.
- **Weight:** grams are assumed because a sample of 13 live products (every eighth of 100, on 2026-10-14) reported plain numbers between 105 and 700, which is consistent with phones and tablets in grams.
- Both assumptions live in one module (`src/features/catalog/model/format.ts`) and are documented in the README.

## Out of scope

The third gap (incremental repository history) is handled in git, not in the product specification.
