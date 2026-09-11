---
title: "Revenue attribution is missing"
group: troubleshooting
slug: troubleshooting/all-revenue-shows-direct
summary: "Distinguish direct web visits, unknown payment attribution and app revenue."
---

# Revenue attribution is missing

The Revenue card is available now. First check the reporting date, provider
connection status and history coverage under Settings → Revenue. Historical
charges can be imported successfully without a browser attribution record.

| What appears | Meaning and next step |
|---|---|
| Direct website traffic | A real visit without a qualifying referrer or UTM label |
| Unknown revenue attribution | Payment exists but matching checkout metadata/browser claim is missing; verify the current checkout integration |
| App revenue | A purchase attached to an app install; no website channel is invented |
| A missing-original refund | Check `refund_of` against the original transaction ID and retention window |
| Incomplete converted amount | Currency conversion is missing for part of the report; inspect original amounts and rate coverage |

For future checkouts, read `jelto('attribution')` after the tracker loads and
forward its aggregate cohort plus the first-touch flag through your provider's
supported metadata fields. Follow the guide for [Stripe](../payments/stripe.md),
[Lemon Squeezy](../payments/lemon-squeezy.md), [Polar](../payments/polar.md), or
[Paddle](../payments/paddle.md). Missing or late metadata does not justify
assigning historical money to the current browser's channel.

Custom payment adapters require a server key with `payments:write`. Verify
provider signatures, submit the real event timestamp and preserve the same
transaction ID on retry. A new payment returns 201 and a duplicate returns 200.
Refunds need their own transaction ID and `refund_of`; successful provider
connections handle their own refund synchronization.

Jelto never combines `cohort` and `install_id` on one payment. A download click
and a later app install are independent populations, so app revenue cannot be
backfilled into a website channel by joining them. Changing report filters does
not create attribution that was absent at checkout.
