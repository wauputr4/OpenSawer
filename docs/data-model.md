# Data model

The first release uses five application tables in SQLite through Bun's built-in `bun:sqlite` driver.

## `site_settings`

One row stores the presentation defaults editable from the admin dashboard.

| Column                   | Notes                                 |
| ------------------------ | ------------------------------------- |
| `id`                     | Fixed primary key value `1`           |
| `site_name`, `headline`  | Public identity and short copy        |
| `profile_image_url`      | Optional public profile image URL     |
| `social_links`           | JSON array of up to six public links  |
| `minimum_amount`         | Positive integer rupiah amount        |
| `preset_amounts`         | JSON array of positive rupiah amounts |
| `default_show_supporter` | Defaults to true                      |
| `default_show_amount`    | Defaults to true                      |
| `ranking_enabled`        | Defaults to true                      |
| `updated_at`             | UTC timestamp                         |

## `campaigns`

Every donation belongs to a campaign. The initial setup creates one default campaign without a target; admins can create more campaigns immediately.

| Column                     | Notes                                               |
| -------------------------- | --------------------------------------------------- |
| `id`                       | Integer primary key                                 |
| `slug`                     | Unique public identifier                            |
| `name`                     | Public campaign name                                |
| `kind`                     | `general`, `creator`, `social`, `event`, or `other` |
| `description`              | Short public copy                                   |
| `target_amount`            | Nullable positive integer rupiah amount             |
| `is_default`               | Exactly one default campaign                        |
| `is_active`                | Controls new donations                              |
| `created_at`, `updated_at` | UTC timestamps                                      |

## `donors`

Created only for named donors. Donors do not have accounts or passwords.

| Column        | Notes                                |
| ------------- | ------------------------------------ |
| `id`          | Integer primary key                  |
| `username`    | Unique, case-insensitive public name |
| `email`       | Unique, normalized, private email    |
| `verified_at` | Required before public attribution   |
| `created_at`  | UTC timestamp                        |

Every named donation must prove possession of the matching email with a one-time code. A short-lived verified browser cookie may avoid repeating the code within the same donation session, but matching an email and username alone is never sufficient.

## `donations`

| Column                                | Notes                                                            |
| ------------------------------------- | ---------------------------------------------------------------- |
| `id`                                  | Integer primary key                                              |
| `public_id`                           | Random identifier safe for public URLs                           |
| `order_id`                            | Unique Midtrans order and idempotency key                        |
| `campaign_id`                         | Required campaign reference                                      |
| `donor_id`                            | Nullable for anonymous donors                                    |
| `amount`                              | Positive integer rupiah amount                                   |
| `message`                             | Optional plain text                                              |
| `show_supporter`                      | Starts from the open site default; false displays `Anonim`       |
| `show_amount`                         | Starts from the open site default; false hides the public amount |
| `show_in_ranking`                     | Admin moderation flag, defaults to true                          |
| `status`                              | Payment state                                                    |
| `payment_type`                        | Midtrans payment type when known                                 |
| `provider_transaction_id`             | Midtrans transaction identifier                                  |
| `paid_at`, `created_at`, `updated_at` | UTC timestamps                                                   |

`donor_id IS NULL` or `show_supporter = false` renders the donation as anonymous. Email is never copied into `donations` or returned by public queries. Hidden names and amounts remain visible to the admin.

## `email_verifications`

| Column                                | Notes                                                  |
| ------------------------------------- | ------------------------------------------------------ |
| `id`                                  | Integer primary key                                    |
| `email`                               | Normalized target email                                |
| `username`                            | Requested unique username                              |
| `token_hash`                          | Hash of the one-time code; never store the code itself |
| `expires_at`, `used_at`, `created_at` | Verification lifecycle                                 |

Delete expired verification rows during normal requests; no background worker is needed initially.

## Derived values

Campaign totals and progress, donor totals, ranking positions, and supporter counts are SQL aggregates over paid donations. A campaign with `target_amount IS NULL` has no progress target. Do not persist duplicate counters until measurement proves the aggregate queries are too slow.
