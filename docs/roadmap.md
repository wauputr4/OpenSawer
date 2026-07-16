# Roadmap

## Milestone 1: donation loop (alpha implemented)

- SvelteKit application running on Bun with `bun:sqlite` migrations.
- Svelte 5 UI using the minimum copied shadcn-svelte components and Tailwind CSS 4.
- Multiple campaigns from the first release, each with an optional target.
- One default campaign without a target created during initial setup.
- Landing, campaign donation, payment status, admin login, and single dashboard pages.
- Anonymous or email-verified named donations with unique usernames.
- Independent supporter and amount visibility, open by default.
- Midtrans Snap sandbox integration.
- Verified, idempotent notification handler.
- Public paid-donation ranking with privacy-aware ordering.
- Health check, tests for payment transitions, Docker packaging, and self-hosting documentation.

## Milestone 2: operational polish

Add only after the first milestone is used successfully:

- Transaction export.
- Improved moderation and campaign archiving.
- Production backup and restore command.
- Email delivery observability.
- Monthly and all-time ranking filters.

## Later, based on demand

- A second payment provider and the first real provider abstraction.
- OBS/browser-source overlays.
- More ranking periods.
- Multi-admin roles.
- Multi-tenant hosting.

These are not commitments for the first release.
