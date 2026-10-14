# Tasks: apply-visual-design

## 1. Tokens and global styles
- [x] 1.1 Replace `src/styles/tokens.css` with the DESIGN.md tokens and AA-safe text inks.
- [x] 1.2 Restyle the shared classes in `src/styles/global.css`: buttons, focus, state messages, eyebrow ribbon, fallback, reduced motion.

## 2. Components
- [x] 2.1 Header: retro brand mark, cart pill with a gold badge.
- [x] 2.2 Catalog: cream search pill, accent-bar cards with glow, dashed results divider.
- [x] 2.3 Detail: image panel, spec card with an emoji section title, purchase panel, cream selects, hint.
- [x] 2.4 404 page and error boundary use the shared styles.

## 3. Verification
- [x] 3.1 Add a reduced-motion e2e check (QUAL-06b).
- [x] 3.2 Lint, typecheck, `npm test`, `npm run test:e2e` on three browsers, including axe contrast (QUAL-06a).
- [x] 3.3 Review screenshots at 375 and 1280 px.

## Verification (2026-10-14)
- Lint and typecheck: clean.
- Vitest: 49 of 49 pass.
- Playwright: 68 passed and 1 skipped across Chromium, Firefox and WebKit. The skip is the existing WebKit keyboard-tab case.
  - The axe WCAG 2.1 A/AA scans (catalog, detail, 404), including colour contrast, report no violations (QUAL-06a).
  - At 320, 640, 768 and 1280 px there is no horizontal overflow. The first 320 px run overflowed by 6 px in the header, which narrow-screen header sizing fixed.
  - The reduced-motion test confirms 0 s transitions and no transform under `reduce`, and transitions of 500 ms or less otherwise (QUAL-06b).
- Screenshots of the catalog, detail and 404 pages at 375 and 1280 px were reviewed.
