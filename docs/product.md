# Product and flows

## Roles

### Donor

A donor can support a campaign without registering or signing in.

### Admin

The instance owner manages campaigns, donations, visibility, branding, and Midtrans configuration from one dashboard.

## Donation flow

1. Open the landing page or a direct campaign link.
2. Select a campaign. The default is `Sawer aku` with no target.
3. Select a preset amount or choose `Nominal lain` to enter a custom amount.
4. Add an optional message.
5. Optionally open `Privasi tampilan` to change visibility. Identity and amount are public by default.
6. For a public identity, enter a unique username and email, then verify that email with a one-time code for the donation session.
7. Continue to Midtrans Snap.
8. Wait for the server to verify the Midtrans notification.
9. Show the final payment state and update public totals/rankings when paid.

Browser callbacks never mark a donation as paid.

## Visibility

Each donation stores two independent public choices:

| Show supporter | Show amount | Public result                    |
| -------------- | ----------- | -------------------------------- |
| Yes            | Yes         | `nabila — Rp100.000`             |
| Yes            | No          | `nabila — Nominal disembunyikan` |
| No             | Yes         | `Anonim — Rp100.000`             |
| No             | No          | `Anonim — Nominal disembunyikan` |

The admin can change the instance defaults, but the initial defaults are `show supporter = true` and `show amount = true`. Email is always private.

## Campaigns

Every donation belongs to one campaign.

A campaign has:

- Name and slug.
- Type such as `general`, `creator`, `social`, `event`, or `other`.
- Short description and optional image.
- Optional target amount.
- Active or archived state.

The instance starts with one non-deletable default campaign named `Sawer aku`, type `general`, with no target. A target adds progress display; it does not change payment behavior.

## Ranking

- Only paid donations count.
- Monthly and all-time periods are sufficient for the first release.
- Named donations aggregate by verified donor.
- Anonymous donations may appear as individual entries but never merge into a fake shared donor.
- Hidden amounts count toward ranking order but render without the amount.
- Admins can exclude an abusive entry from public surfaces without changing its payment record.

## Minimum pages

The public experience is rendered with SvelteKit and Svelte 5. Use shadcn-svelte only for primitives that improve consistency or accessibility, then style them with Tailwind CSS 4. The donation flow should feel like one focused page, not a generic admin product or component showcase.

### Landing `/`

Profile image, editable creator name, headline and description, up to six customizable social or short links, primary `Kirim Sawer` button, active campaigns, top-five ranking, and a small footer. Keep the opening screen calm and immediately understandable; avoid feature grids, pricing sections, and decorative dashboard imagery.

### Donation `/sawer`

One mobile-first card containing campaign, amount, optional message, identity, collapsible visibility controls, payment total, and one payment CTA. The amount and CTA must dominate the hierarchy; privacy choices stay available in a native disclosure that is closed by default.

### Payment status `/sawer/{id}`

One reusable page for pending, paid, failed, and expired states.

### Admin login `/admin/login`

One owner login. No registration or password recovery in the first release.

### Admin dashboard `/admin`

One responsive screen with Overview, History, Campaign, and Setting menus. Campaign creation and editing use a native modal dialog. The menu stays at the top on desktop and becomes bottom navigation on mobile. Prefer native SvelteKit forms and clear tables over client-side dashboard machinery. No charts are required.
