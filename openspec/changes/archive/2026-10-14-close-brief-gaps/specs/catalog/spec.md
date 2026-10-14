# Catalog delta

## MODIFIED Requirements

### Requirement: CAT-03 — Product card information

Each card MUST expose image, brand, model, and price. Missing text MUST use an explicit unavailable label; a blank price MUST NOT become zero or acquire a currency. A price that is a plain number MUST be shown in euros, and any other supplied price MUST be shown as supplied. An unavailable or failed image MUST have a stable fallback and a useful accessible product description.

**Mandate:** PDF-11 (p. 4). **Decision:** missing-display-data fallbacks. EUR is assumed for plain numeric prices because the brief comes from a Spanish retailer; the service states no currency.

#### Scenario: CAT-03a — Complete card
- GIVEN a product with all card fields and a plain numeric price such as `170`
- WHEN its card renders
- THEN the image, brand, model, and price `€170` are displayed.

#### Scenario: CAT-03b — Missing presentation fields
- GIVEN a valid product identity with blank price and a failed image URL
- WHEN its card renders and image loading fails
- THEN price is marked unavailable and a fallback replaces the broken image while the product remains navigable.
