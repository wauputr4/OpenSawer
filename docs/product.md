# Product and flows

## Roles

### Donor

A donor can support a campaign without registering or signing in.

### Admin

The instance owner manages campaigns, donations, visibility, branding, and Midtrans configuration from one dashboard.

## Donation flow

1. Open the landing page or a direct campaign link.
2. Select a campaign. The default is `General Support` with no target.
3. Select a preset amount or enter another valid amount.
4. Add an optional message.
5. Choose visibility. Identity and amount are public by default.
6. For a public identity, enter a unique username and email, then verify the email when claiming a new username.
7. Continue to Midtrans Snap.
8. Wait for the server to verify the Midtrans notification.
9. Show the final payment state and update public totals/rankings when paid.

Browser callbacks never mark a donation as paid.

## Visibility

Each donation stores two independent public choices:

| Show supporter | Show amount | Public result |
| --- | --- | --- |
| Yes | Yes | `nabila — Rp100.000` |
| Yes | No | `nabila — Nominal disembunyikan` |
| No | Yes | `Anonim — Rp100.000` |
| No | No | `Anonim — Nominal disembunyikan` |

The admin can change the instance defaults, but the initial defaults are `show supporter = true` and `show amount = true`. Email is always private.

## Campaigns

Every donation belongs to one campaign.

A campaign has:

- Name and slug.
- Type such as `general`, `creator`, `social`, `event`, or `other`.
- Short description and optional image.
- Optional target amount.
- Active or archived state.

The instance starts with one non-deletable default campaign named `General Support`, type `general`, with no target. A target adds progress display; it does not change payment behavior.

## Ranking

- Only paid donations count.
- Monthly and all-time periods are sufficient for the first release.
- Named donations aggregate by verified donor.
- Anonymous donations may appear as individual entries but never merge into a fake shared donor.
- Hidden amounts count toward ranking order but render without the amount.
- Admins can exclude an abusive entry from public surfaces without changing its payment record.

## Minimum pages

### Landing `/`

Logo, recipient identity, short pitch, primary `Kirim Sawer` button, active campaigns, top-five ranking, and a small footer.

### Donation `/sawer`

One mobile-first card containing campaign, amount, optional message, identity, visibility controls, payment total, and one payment CTA.

### Payment status `/sawer/{id}`

One reusable page for pending, paid, failed, and expired states.

### Admin login `/admin/login`

One owner login. No registration or password recovery in the first release.

### Admin dashboard `/admin`

One screen with Summary, Donations, Campaigns, and Settings sections. No charts are required.

