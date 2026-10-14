# Proposal: Apply the DESIGN.md visual language

## Intent

Give Device Shop the look and feel described in [`DESIGN.md`](../../../DESIGN.md): the retro, playful Flip7 system in teal, coral and gold. Behavior, routes, copy, accessible names and the API contract stay the same.

## Scope

### In scope

- Design tokens for the DESIGN.md palette, radius scale, spacing scale, coloured-glow elevation and bounce motion.
- A restyled shell, catalog, product detail, state messages, 404 page and error boundary:
  - gold pill CTA;
  - cream inputs;
  - accent-bar cards;
  - dashed section dividers;
  - a ribbon eyebrow and a retro brand mark.
- Decorative markup only where a style needs a container (emoji icons, ribbon tails). All of it is `aria-hidden`.

### Out of scope

- Game-only components: BOOM and Flip7 buttons, counters, rankings, confetti, the crown and the FLIP7 logo text.
- Dark mode, web fonts, and any change to behavior or copy.

## Adaptation decisions

- **Units:** DESIGN.md sizes are in WeChat `rpx`, where 750rpx is the phone width (1rpx ≈ 0.5 CSS px). They form the mobile base, and headings scale up on wider viewports.
- **Contrast:**
  - QUAL-02 and the axe WCAG AA suite take precedence over the palette.
  - Teal #2BA8A2 and coral #EF6C4A fail AA as text, so they are used only for fills, borders, accent bars and glows.
  - Text uses darker derived inks, and gold buttons carry dark text.
- **Motion:** micro-interactions last 500 ms or less (DESIGN.md rule 7) and are disabled under `prefers-reduced-motion`.
