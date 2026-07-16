# Data model

The initial database needs four domain tables.

## `campaigns`

| Column | Notes |
| --- | --- |
| `id` | Integer primary key |
| `slug` | Unique public identifier |
| `name` | Public campaign name |
| `kind` | `general`, `creator`, `social`, `event`, or `other` |
| `description` | Short public copy |
| `image_path` | Optional local upload |
| `target_amount` | Nullable integer rupiah amount |
| `is_default` | Exactly one default campaign |
| `is_active` | Controls new donations |
| `created_at`, `updated_at` | UTC timestamps |

## `donors`

Created only for named donors.

| Column | Notes |
| --- | --- |
| `id` | Integer primary key |
| `username` | Unique, case-insensitive public name |
| `email` | Unique, normalized, private email |
| `verified_at` | Required before public attribution |
| `created_at` | UTC timestamp |

## `donations`

| Column | Notes |
| --- | --- |
| `id` | Integer primary key |
| `public_id` | Random identifier safe for public URLs |
| `order_id` | Unique Midtrans order and idempotency key |
| `campaign_id` | Required campaign reference |
| `donor_id` | Nullable for anonymous donors |
| `amount` | Positive integer rupiah amount |
| `message` | Optional plain text |
| `show_supporter` | Defaults to true |
| `show_amount` | Defaults to true |
| `show_in_ranking` | Admin moderation flag, defaults to true |
| `status` | Payment state |
| `payment_type` | Midtrans payment type when known |
| `provider_transaction_id` | Midtrans transaction identifier |
| `paid_at`, `created_at`, `updated_at` | UTC timestamps |

`donor_id IS NULL` or `show_supporter = false` renders the donation as anonymous. The email is never copied into `donations`.

## `email_verifications`

| Column | Notes |
| --- | --- |
| `id` | Integer primary key |
| `email` | Normalized target email |
| `username` | Requested unique username |
| `token_hash` | Store only a hash of the one-time token |
| `expires_at`, `used_at`, `created_at` | Verification lifecycle |

Delete expired verification rows periodically during normal requests; no background worker is needed initially.

## Derived values

Campaign totals, donor totals, ranking positions, and supporter counts are SQL aggregates over paid donations. Do not persist duplicate counters until measurement proves the queries are too slow.

