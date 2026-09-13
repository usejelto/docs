---
title: "Website API recipes"
group: api
slug: api/website
summary: "Use scoped server keys to read analytics, manage funnels, or post payments."
---

# Website API

Open Settings → Developer to mint a product-scoped `jk_` key. The full key is
shown once. Choose only the needed permissions, store it in your server's
environment and revoke it when no longer needed. Public `prd_` keys are for the
browser snippet and cannot authenticate these APIs. Existing keys gain no new
permissions automatically.

| Scope | Operations |
|---|---|
| `analytics:read` | Website stats, health, realtime and crawler reports |
| `funnels:read` | Read this product's funnel definitions |
| `funnels:write` | Create, update and delete this product's funnels |
| `payments:write` | Submit custom payment/refund records |
| `crawlers:write` | Submit server crawler requests and connection checks |

Use the Jelto dashboard to manage integrations, settings and GitHub annotations.
The examples below run on your application server and authenticate with a Bearer
key. Never put a `jk_` key in a page, extension content script, or distributed app.

## Read a report

Set `JELTO_KEY` privately in the environment. Replace the example Jelto API URL, product ID,
and dates; the query defaults to the product's reporting timezone.

```sh
curl --fail-with-body --get 'https://app.example.com/api/v1/stats' \
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

## Manage funnel definitions

Create a `funnels:write` key and send each custom event once so Jelto discovers any goal used in the journey. The following request creates two ordered steps:

```sh
curl --fail-with-body 'https://app.example.com/api/v1/products/prd_acmedemo01/funnels' \
  -H "Authorization: Bearer $JELTO_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"Signup","steps":[{"kind":"page","value":"/signup","match":"equals"},{"kind":"goal","value":"signup"}]}'
```

Use `equals` for one page path or `starts_with` for a page prefix. An optional `hostname` restricts a step to a registered host; `label` changes its display name. A definition contains 2–8 steps and a product can save up to 20 definitions.

`GET` on the collection uses `funnels:read`. `PUT` or `DELETE` on `/api/v1/products/YOUR_PRODUCT_ID/funnels/RETURNED_FUNNEL_ID` uses `funnels:write`. Update with the complete name and ordered steps. Editing a definition changes how retained history is queried; it does not rewrite events.

With `analytics:read`, query `/api/v1/stats` using `product`, `from`, `to`, `surface=web`, `metric=funnel:RETURNED_FUNNEL_ID` and `dimension=funnel_step`. Render returned rates and availability states; do not divide rounded or withheld display counts. See [Create a website funnel](../web/funnels.md) for the dashboard workflow and visit limits.

## Custom payments

Stripe, Lemon Squeezy and Polar have native connections under Revenue. Use the
Payments API for a custom provider such as [Paddle](../payments/paddle.md), with
a key explicitly granted `payments:write`:

```sh
curl --fail-with-body 'https://app.example.com/api/v1/payments' \
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

Related: [Funnel setup](../web/funnels.md), [Crawler SDK](../sdk/crawler.md),
[GitHub](../integrations/github.md).
