# Architecture

## Shape

OpenSawer is one SvelteKit application running on Bun. It serves the public pages, admin UI, server actions, and Midtrans endpoints. Bun's built-in `bun:sqlite` driver stores application state in SQLite on the same host.

```text
Browser
  -> SvelteKit on Bun
      -> Svelte 5 + shadcn-svelte + Tailwind CSS 4
      -> server actions and route handlers
      -> bun:sqlite -> SQLite
      -> Midtrans Snap API

Midtrans webhook
  -> SvelteKit route handler
      -> verify with Midtrans
      -> idempotent SQLite update
```

## Project shape

Keep responsibilities close to the routes that use them:

```text
src/lib/components/ui     copied shadcn-svelte components actually used
src/lib/server/db.ts      bun:sqlite connection and migrations
src/lib/server/auth.ts    admin session and donor verification helpers
src/lib/server/midtrans.ts Snap requests and notification verification
src/routes                public, admin, health, and webhook routes
```

Do not add a separate API service, client-side state library, ORM, or payment-provider interface for the first release. Extract a provider contract only when a second provider is implemented.

## Payment state

```text
created -> pending -> paid
                   -> failed
                   -> expired
                   -> refunded
```

- `order_id` is unique and is the webhook idempotency key.
- Only a verified Midtrans response can move a donation to `paid`.
- A later `pending` notification must not overwrite `paid`.
- Ranking and campaign progress read only `paid` donations.

## SQLite operation

- Enable foreign keys.
- Use WAL mode.
- Set a busy timeout.
- Keep one application instance writing to the database.
- Back up with SQLite's online backup mechanism, not a raw copy of a live WAL database.

Move to another database only when measured concurrency or deployment requirements exceed a single SQLite writer.

## UI

- Render public and admin pages with SvelteKit SSR and Svelte 5.
- Copy only the shadcn-svelte components that are used.
- Use Tailwind CSS 4 for the small shared design token set.
- Prefer native form controls and SvelteKit form actions.
- Keep client JavaScript to Midtrans Snap and interactions that need immediate feedback.

## Security boundary

- Treat donor fields and webhook bodies as untrusted.
- Render donor messages as text, never HTML.
- Keep Midtrans server keys, SMTP credentials, and session secrets server-only.
- Use HTTPS, secure cookies, CSRF origin checks, request-size limits, and rate limits on donation and email-verification endpoints.
- Verify Midtrans notifications and process them idempotently.
- Never expose donor email publicly.
