# Roadmap

## Milestone 1: donation loop (`v0.1.0-preview.1`)

- SvelteKit application running on Bun with `bun:sqlite` migrations.
- Svelte 5 UI using the minimum copied shadcn-svelte components and Tailwind CSS 4.
- Multiple campaigns from the first release, each with an optional target.
- One default campaign without a target created during initial setup.
- Landing, campaign donation, payment status, admin login, and single dashboard pages.
- Anonymous donations or named donations verified through Google OAuth or email codes.
- Anonymous mode by default, with independent supporter and amount visibility controls.
- Midtrans Snap sandbox and production modes.
- Verified, idempotent notification handler.
- Public paid-donation ranking with privacy-aware ordering.
- Health check, tests for payment transitions, Docker packaging, and self-hosting documentation.

## Milestone 2: operational polish

Add only after the first milestone is used successfully:

- Transaction export.
- Improved moderation tools beyond ranking visibility and campaign archiving.
- Production backup and restore command.
- Email delivery observability.
- Monthly and all-time ranking filters.
- Application-level donation rate limiting.

## Later, based on demand

- A second payment provider and the first real provider abstraction.
- OBS/browser-source overlays.
- More ranking periods.
- Multi-admin roles.
- Multi-tenant hosting.

These are not commitments for the first release.
