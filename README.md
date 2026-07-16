# OpenSawer

OpenSawer is a small, self-hosted donation page for Indonesian creators and communities. It focuses on one job: accepting support through a modern public page without requiring donors to create accounts.

> Status: documentation-first planning. The application is not implemented yet.

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

## Planned pages

| Page | Purpose |
| --- | --- |
| `/` | Minimal landing page, active campaigns, CTA, and ranking |
| `/sawer` | Campaign, amount, identity, visibility, message, and payment form |
| `/sawer/{id}` | Pending, successful, expired, or failed payment status |
| `/admin/login` | Single-owner admin login |
| `/admin` | Summary, donations, campaigns, and settings in one dashboard |

## Planned stack

- Go with `net/http`
- [templ](https://templ.guide/) for server-rendered UI
- [templUI](https://templui.io/) components copied into the project
- Tailwind CSS through the minimal templUI toolchain
- SQLite through `database/sql` and `modernc.org/sqlite`
- Midtrans Snap and verified HTTP notifications
- Small amounts of vanilla JavaScript only where Snap requires it

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

There is no runnable application yet. The first implementation milestone is tracked in [the roadmap](docs/roadmap.md).

## License

[MIT](LICENSE)

