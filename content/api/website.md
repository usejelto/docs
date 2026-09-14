---
title: "Website and app API recipes"
group: api
slug: api/website
summary: "Use scoped server keys to read analytics, manage funnels, or post payments."
---

# Website and app API

Open Settings → Developer to mint a product-scoped `jk_` key. The full key is
shown once. Choose only the needed permissions, store it in your server's
environment and revoke it when no longer needed. Public `prd_` keys are for the
browser snippet and cannot authenticate these APIs. Existing keys gain no new
permissions automatically.

| Scope | Operations |
|---|---|
| `analytics:read` | Website and app analytics, health, realtime and crawler reports |
| `funnels:read` | Read this product's funnel definitions |
| `funnels:write` | Create, update and delete this product's funnels |
| `payments:write` | Submit custom payment/refund records |
| `crawlers:write` | Submit server crawler requests and connection checks |

Use the Jelto dashboard to manage integrations, settings and GitHub annotations.
The examples below run on your application server and authenticate with a Bearer
key. Never put a `jk_` key in a page, extension content script, or distributed app.

## Read a report

Set `JELTO_KEY` privately in the environment. Jelto's REST API uses
`https://app.jelto.io`. Replace the example product ID `prd_acmedemo01` and
dates; the query defaults to the product's reporting timezone.

```sh
curl --fail-with-body --get 'https://app.jelto.io/api/v1/stats' \
  -H "Authorization: Bearer $JELTO_KEY" \
  --data-urlencode 'product=prd_acmedemo01' \
  --data-urlencode 'from=2026-09-01' --data-urlencode 'to=2026-09-05' \
  --data-urlencode 'metric=visitors' --data-urlencode 'dimension=source'
```

Values are envelopes, not always numbers: respect withheld, unavailable,
incomplete and history-coverage states. Website goal queries also require
`surface=web`. A goal companion counts distinct eligible identifiers, not
repeated event occurrences. Currency estimates and native/imported coverage
must remain visible to readers. Honor Retry-After on rate limits and transient
failures rather than retrying in a tight loop.

## Query constraints

`goal:<name>` metrics require `surface=web` or `surface=app`, including when a goal is requested as a companion. Fixed app metrics such as `active_installs`, `onboarding_reached` and `license_share` already select the app surface: omit `surface` when querying them alone or with other fixed app metrics, or the API returns `unexpected_surface`.

For date-based queries, `dimension=hour` needs a single-day range (`from` and `to` must be the same date); a multi-day range returns `invalid_range`. The `entry_page` and `exit_page` dimensions are served by sessions, so `visitors` returns `not_applicable` on either dimension; use a compatible session metric such as `visits`.

## Manage funnel definitions

Create a `funnels:write` key and verify the events used in the journey. Definitions accept `surface: "web"` or `surface: "app"`; omitting it defaults to `web`. The following request creates a website funnel with two ordered steps:

```sh
curl --fail-with-body 'https://app.jelto.io/api/v1/products/prd_acmedemo01/funnels' \
  -H "Authorization: Bearer $JELTO_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"Signup","steps":[{"kind":"page","value":"/signup","match":"equals"},{"kind":"goal","value":"signup"}]}'
```

Use `equals` for one page path or `starts_with` for a page prefix. An optional `hostname` restricts a step to a registered host; `label` changes its display name. A definition contains 2–8 steps and a product can save up to 20 definitions.

`GET` on the collection uses `funnels:read` and returns each definition's ID, name, surface and steps. `PUT` or `DELETE` on `/api/v1/products/YOUR_PRODUCT_ID/funnels/RETURNED_FUNNEL_ID` uses `funnels:write`. Update with the complete name, surface and ordered steps. Include `surface: "app"` when updating an app funnel; omission defaults to `web` on updates too. Editing a definition changes how retained history is queried; it does not rewrite events.

With `analytics:read`, query `/api/v1/stats` using `product`, `from`, `to`, `metric=funnel:RETURNED_FUNNEL_ID` and `dimension=funnel_step`. For a website funnel, omit `surface`. App funnel queries require `surface=app`. A mismatched surface returns `unexpected_surface`; unlike website goal queries, website funnel queries also reject an explicit `surface=web`.

### Create an app funnel

This request saves an app funnel from onboarding completion to an upgrade click. Replace the product and event names with your own. Both steps use `kind: "goal"` and `match: "equals"`; do not include `hostname`:

```sh
curl --fail-with-body 'https://app.jelto.io/api/v1/products/prd_acmedemo01/funnels' \
  -H "Authorization: Bearer $JELTO_KEY" -H 'Content-Type: application/json' \
  -d '{
    "name": "Onboarding to upgrade",
    "surface": "app",
    "steps": [
      {"kind": "goal", "value": "onboarding:complete", "match": "equals"},
      {"kind": "goal", "value": "upgrade_click", "match": "equals"}
    ]
  }'
```

The same 2–8 step limit applies, and the 20-definition limit is shared across website and app funnels. Page steps, prefix matching and any `hostname` field return `invalid_steps` for app funnels. Reserved app measurements such as `installs` and `heartbeat` return `reserved_event`. Onboarding steps match the event name regardless of status.

### Query an app funnel

Use the ID returned by create or list; replace every `RETURNED_FUNNEL_ID` below. `companions` is a comma-separated string that adds rates from the first and previous steps:

```sh
curl --fail-with-body --get 'https://app.jelto.io/api/v1/stats' \
  -H "Authorization: Bearer $JELTO_KEY" \
  --data-urlencode 'product=prd_acmedemo01' \
  --data-urlencode 'from=2026-09-01' --data-urlencode 'to=2026-09-07' \
  --data-urlencode 'surface=app' \
  --data-urlencode 'metric=funnel:RETURNED_FUNNEL_ID' \
  --data-urlencode 'dimension=funnel_step' \
  --data-urlencode 'companions=funnel_first:RETURNED_FUNNEL_ID,funnel_prev:RETURNED_FUNNEL_ID'
```

The dates select each install's first step 1 within the range. Later steps count in order through the last completed day in the reporting timezone, even when they occur after `to`. Today's entrants are excluded; a range with no completed entry day returns `withheld`. Step counts under five installs return `below_floor`, including a step with no observed completions. Render returned rates and availability states instead of dividing rounded or withheld counts.

Supported app funnel filters are `app`, `app_version`, `arch`, `install_age` and `os`, evaluated at entry. Use `funnel_step` only as a breakdown. See [Create an app funnel](../app/funnels.md) for cohort examples and [Create a website funnel](../web/funnels.md) for visit-based journeys.

## Custom payments

Stripe, Lemon Squeezy and Polar have native connections under Revenue. Use the
Payments API for a custom provider such as [Paddle](../payments/paddle.md), with
a key explicitly granted `payments:write`:

```sh
curl --fail-with-body 'https://app.jelto.io/api/v1/payments' \
  -H "Authorization: Bearer $JELTO_KEY" -H 'Content-Type: application/json' \
  -d '{"transaction_id":"order-123","amount":"29.00","currency":"USD","occurred_at":"2026-09-05T12:00:00Z","cohort":"newsletter~email~launch"}'
```

Use the verified provider event time and actual decimal amount. Retry with the
same transaction ID: a new record returns 201 and a duplicate 200. Refunds use
a distinct transaction ID, a negative amount and `refund_of`. Forward real
aggregate checkout attribution; omit it when unknown. Never manufacture a
channel or combine `cohort` and `install_id` in one record.

Current payment records with missing or empty cohort information show Unknown.
Some older payments may still show Direct for missing attribution. That label
does not prove a direct visit; check the payment's available attribution evidence.
The Payments API accepts event times from the last 30 days, with at most five
minutes of future clock skew. Older provider history needs an import mechanism;
changing its timestamp to today would misstate revenue.

Related: [Website funnels](../web/funnels.md), [App funnels](../app/funnels.md), [Crawler SDK](../sdk/crawler.md),
[GitHub](../integrations/github.md).
