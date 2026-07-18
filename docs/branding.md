# Brand direction

## Recommended mark: Open Bowl

The symbol is a rounded open bowl receiving one simple coin. Its negative space suggests a smile, connecting support, openness, and gratitude without drawing a literal banknote or hand.

Requirements:

- Recognizable at favicon size.
- One-color version works first.
- Rounded geometry matching the UI components.
- Original silhouette; do not imitate Lynk or Saweria marks.
- Wordmark uses `Open` in regular weight and `Sawer` in semibold.

## Palette

| Token   | Color     | Use                      |
| ------- | --------- | ------------------------ |
| Emerald | `#18A873` | Primary actions and mark |
| Ink     | `#172621` | Text and dark surfaces   |
| Mist    | `#F3F8F6` | Page background          |
| Coin    | `#F5B942` | Optional small accent    |

The UI should remain mostly neutral: centered mobile-first donation cards, warm white surfaces, 16–20px radii, crisp borders, restrained shadows, and one dominant action. Emerald is a deliberate signature, not a gradient backdrop. Coin yellow should appear only as a small moment of warmth around support, progress, or success.

## UI character

OpenSawer should feel generous, direct, and human rather than like a generic fintech dashboard.

- Use strong type hierarchy and short Indonesian copy.
- Let campaign imagery and supporter messages provide personality; keep the application shell quiet.
- Give the donation amount, visibility choices, total, and payment action a clear reading order.
- Use shadcn-svelte as accessible building blocks, not as the visual identity. Adapt spacing, shape, and states to this direction.
- Keep motion purposeful and brief: payment progress, confirmation, and campaign progress only.
- Avoid oversized marketing headlines, glass effects, ornamental gradients, crowded card grids, and icon-only controls.
- Preserve visible focus states, sufficient contrast, keyboard operation, and 44px touch targets.

Tailwind CSS 4 should express a small set of shared visual tokens. Do not build a separate design-system package until repeated product code proves it is needed.

The selected default artwork follows this direction. The repository logo is stored at `static/opensawer-logo.png`; the compact application mark is implemented in `src/lib/components/logo-mark.svelte`, with the default favicon at `src/lib/assets/favicon.svg`. An instance owner can replace the public logo/profile image and favicon from the admin settings without changing these source assets.
