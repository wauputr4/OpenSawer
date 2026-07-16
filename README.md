# OpenSawer

OpenSawer is a small, self-hosted donation page for Indonesian creators and communities. It focuses on one job: accepting support through a modern public page without requiring donors to create accounts.

> Status: early alpha. The complete donation loop is runnable locally; use sandbox credentials before any production deployment.

## Product boundary

- One self-hosted instance represents one creator or organization.
- Donors do not have accounts or passwords.
- Named donors verify ownership of a unique username through email.
- Donors can hide their identity, donation amount, or both. Both are public by default.
- Every donation belongs to a campaign. A default `General Support` campaign without a target is always available.
- Campaign targets are optional.
- Rankings include successful donations only and respect donor visibility choices.
- Midtrans Snap is the first payment provider.
- SQLite is the only database for the initial release.

OpenSawer is not a marketplace, storefront, multi-tenant SaaS, page builder, or withdrawal service.

## Pages

| Page           | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| `/`            | Minimal landing page, active campaigns, CTA, and ranking          |
| `/sawer`       | Campaign, amount, identity, visibility, message, and payment form |
| `/sawer/{id}`  | Pending, successful, expired, or failed payment status            |
| `/admin/login` | Single-owner admin login                                          |
| `/admin`       | Summary, donations, campaigns, and settings in one dashboard      |

## Stack

- [Bun](https://bun.com/) as the JavaScript runtime and package manager
- [SvelteKit](https://svelte.dev/docs/kit) with Svelte 5 for server-rendered pages, forms, and endpoints
- [shadcn-svelte](https://www.shadcn-svelte.com/) for accessible, locally owned UI components
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- SQLite through Bun's built-in `bun:sqlite` driver
- Midtrans Snap through server-side `fetch` and verified HTTP notifications
- TypeScript throughout the application

## Documentation

- [Product and flows](docs/product.md)
- [Architecture](docs/architecture.md)
- [Data model](docs/data-model.md)
- [Configuration](docs/configuration.md)
- [Brand direction](docs/branding.md)
- [Roadmap](docs/roadmap.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Local development

Requires Bun 1.3.14 or newer.

```bash
cp .env.example .env
bun install --frozen-lockfile
bun run dev
```

Open `http://localhost:5173`. The example environment enables `MIDTRANS_MOCK=true`, exposes email verification codes only in local development, and uses the local admin password `change-me`. Never use those settings in production.

Before a production run:

1. Set a long `OPENSAWER_SESSION_SECRET` and a Bun password hash in `OPENSAWER_ADMIN_PASSWORD_HASH`.
2. Set `MIDTRANS_MOCK=false`, add Midtrans keys, and configure the HTTPS notification URL as `/webhooks/midtrans`.
3. Configure SMTP for named donors and set the public `ORIGIN`.
4. Mount `data/` persistently and keep one application writer.

Quality checks:

```bash
bun run check
bun run lint
bun test
bun --bun run build
```

Run the production build with `bun ./build/index.js`, or use the included Docker Compose file. See [configuration](docs/configuration.md) for every environment variable.

## License

[MIT](LICENSE)
