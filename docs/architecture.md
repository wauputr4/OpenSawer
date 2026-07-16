# Architecture

## Shape

OpenSawer is one Go process serving HTML, static assets, admin routes, and Midtrans endpoints. SQLite stores application state on the same host.

```text
Browser
  -> Go net/http
      -> templ + templUI
      -> SQLite
      -> Midtrans Snap API

Midtrans webhook
  -> Go notification handler
      -> verify with Midtrans
      -> idempotent SQLite update
```

## Packages

Start with only the packages that have real responsibilities:

```text
cmd/opensawer       process entrypoint
internal/app        routes and HTTP handlers
internal/store      SQLite queries and migrations
internal/midtrans   Snap requests and notification verification
internal/ui         templ pages and copied templUI components
```

Do not introduce a payment-provider interface until a second provider is being implemented.

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

- Server-render complete pages with templ.
- Copy only the templUI components actually used.
- Keep Tailwind configuration limited to OpenSawer's tokens.
- Use native form controls and progressive enhancement.
- Use JavaScript only for Midtrans Snap and small state interactions that HTML cannot cover cleanly.

## Security boundary

- Treat donor fields and webhook bodies as untrusted.
- Escape user content through templ; do not render donor HTML.
- Keep server keys and session secrets in environment variables.
- Use HTTPS, secure cookies, CSRF protection on admin mutations, request-size limits, and rate limits on donation/email-verification endpoints.
- Verify Midtrans notifications and process them idempotently.
- Never expose donor email publicly.

