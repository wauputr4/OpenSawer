# Configuration

OpenSawer uses environment variables for secrets and deployment settings. Campaigns and editable presentation defaults belong in SQLite and are managed from the admin dashboard.

## Environment variables

```dotenv
ORIGIN=https://sawer.example.com
PORT=3000
OPENSAWER_DB_PATH=./data/opensawer.db
OPENSAWER_SESSION_SECRET=replace-with-a-long-random-value
# Optional path used when the admin must update a mounted env file.
OPENSAWER_ENV_PATH=.env

OPENSAWER_ADMIN_USERNAME=admin
# Local development only; production requires the hash below.
OPENSAWER_ADMIN_PASSWORD=change-me
OPENSAWER_ADMIN_PASSWORD_HASH=

PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_ENABLED=false

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://sawer.example.com/auth/google/callback

MIDTRANS_ENV=sandbox
MIDTRANS_MERCHANT_ID=
MIDTRANS_SERVER_KEY=
MIDTRANS_MOCK=false
MIDTRANS_CLIENT_KEY=

SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=no-reply@example.com
SMTP_ENCRYPTION=
SMTP_FROM_ADDRESS=
SMTP_FROM_NAME=
```

`SMTP_USER` dan `SMTP_PASS` dapat dipakai sebagai alias. Isi `SMTP_ENCRYPTION=null` untuk SMTP lokal tanpa TLS; `SMTP_FROM_ADDRESS` dan `SMTP_FROM_NAME` dipakai jika `SMTP_FROM` kosong.

`ORIGIN` is required by the self-hosted SvelteKit server for correct public URLs and form-origin checks. `OPENSAWER_ENV_PATH` defaults to `.env`; set it to the writable mounted env path when the admin dashboard must save encrypted Midtrans keys. Never commit `.env`, database files, Midtrans keys, SMTP credentials, or session secrets.

Turnstile is optional. The admin login renders and validates it when both keys are configured and `TURNSTILE_ENABLED` is not `false`; set it explicitly to `true` when enabling the feature. `TURNSTILE_SITE_KEY` is accepted as a server-side alias for `PUBLIC_TURNSTILE_SITE_KEY`.

Google is the default named-donor method when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured. Register `GOOGLE_REDIRECT_URI` as an authorized redirect URI using either the built-in `/auth/google/callback` route or its `/api/auth/google/callback` alias. Email OTP remains available as the fallback.

`MIDTRANS_MOCK=true` is only for local UI development. It adds a server-side payment simulation action and must never be enabled on a public deployment. Without SMTP, local development returns the OTP in the page response; production rejects OTP delivery until SMTP is configured.

Generate the production admin hash with Bun, for example. Plain `OPENSAWER_ADMIN_PASSWORD` is ignored in production:

```bash
bun -e "console.log(await Bun.password.hash('replace-this-password'))"
```

## Initial defaults

| Setting             | Default                     |
| ------------------- | --------------------------- |
| Currency            | IDR                         |
| Minimum donation    | Rp10.000                    |
| Preset amounts      | Rp10k, Rp25k, Rp50k, Rp100k |
| Show supporter      | Open                        |
| Show amount         | Open                        |
| Ranking             | Enabled                     |
| Initial campaign    | Sawer aku                   |
| Campaign target     | None                        |
| Payment environment | Sandbox                     |

## Midtrans

- Use Snap for the first release.
- Sandbox is the default mode; production must be selected explicitly.
- The admin dashboard tests credentials before saving. Client and server keys are encrypted with AES-256-GCM before `.env` is atomically replaced.
- `OPENSAWER_SESSION_SECRET` is the encryption master key. Keep it stable; changing it requires entering the Midtrans keys again.
- Configure a public HTTPS notification endpoint.
- Verify every notification with Midtrans before changing financial state.
- Keep sandbox and production keys separate.
- Do not accept browser callbacks as payment proof.

## Self-hosting

The supported first deployment is one SvelteKit process running on Bun behind an HTTPS reverse proxy. Mount the persistent `data/` directory and the writable `.env` file. Build with `bun --bun run build`, run with `bun ./build/index.js`, and keep a single writer for SQLite. Apply public request rate limits at the reverse proxy; OpenSawer currently throttles email-code requests but does not include a general donation rate limiter.
