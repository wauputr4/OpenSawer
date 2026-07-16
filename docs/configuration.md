# Configuration

OpenSawer uses environment variables for secrets and deployment-level settings. Editable presentation settings may move into SQLite when the admin UI is implemented.

## Planned environment variables

```dotenv
OPENSAWER_BASE_URL=https://sawer.example.com
OPENSAWER_ADDR=:8080
OPENSAWER_DB_PATH=./data/opensawer.db
OPENSAWER_SESSION_SECRET=replace-with-a-long-random-value

OPENSAWER_ADMIN_USERNAME=admin
OPENSAWER_ADMIN_PASSWORD_HASH=

MIDTRANS_ENV=sandbox
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=

SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=no-reply@example.com
```

Never commit `.env`, database files, uploaded donor data, Midtrans keys, SMTP credentials, or session secrets.

## Initial defaults

| Setting | Default |
| --- | --- |
| Currency | IDR |
| Minimum donation | Rp10.000 |
| Preset amounts | Rp10k, Rp25k, Rp50k, Rp100k |
| Show supporter | Open |
| Show amount | Open |
| Ranking | Enabled |
| Campaign | General Support |
| Campaign target | None |
| Payment environment | Sandbox |

## Midtrans

- Use Snap for the first release.
- Configure a public HTTPS notification endpoint.
- Verify every notification with Midtrans before changing financial state.
- Keep sandbox and production keys separate.
- Do not accept browser callbacks as payment proof.

## Self-hosting

The initial supported deployment is one OpenSawer process behind an HTTPS reverse proxy with a persistent volume containing `data/` and `uploads/`.

