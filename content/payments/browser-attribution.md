---
title: "Attribute a checkout to a channel"
group: payments
slug: payments/browser-attribution
summary: "Use a verified checkout reference, server metadata, or a short-lived email fallback."
---

# Browser payment attribution

Connect Stripe, Lemon Squeezy, or Polar in **Settings → Revenue** first. The
connection retrieves payment amounts and refunds. Browser attribution supplies
only an aggregate marketing channel; it never supplies revenue amounts.

## Install the optional helper

Add the helper after the main Jelto snippet, on the page before checkout and
the page customers return to:

```html
<script defer src="https://analytics.example/jelto.checkout.js"
  data-product="prd_yourkey123"></script>
```

Use your actual script hostname and product ID from Settings. `https://analytics.example` and `prd_yourkey123` above are placeholders. The return page's domain
must be in that website's domain list. For a first-party proxy, serve both
scripts and the configured payment endpoint through that proxy. Add
`data-environment="test"` for sandbox payments; live and test matching are separate.

The helper remembers only the aggregate channel in `sessionStorage` for up to
30 minutes. It stores no email or checkout reference there. Set
`data-payment-memory="off"` to disable that memory. Without remembered context,
a provider return page does not manufacture Direct attribution. Explicitly
observed Direct traffic is supported.

Set your provider's success URL using its exact placeholder:

| Provider | Success URL parameter |
| --- | --- |
| Stripe Checkout | `session_id={CHECKOUT_SESSION_ID}` |
| Lemon Squeezy | `order_id=[order_id]` (numeric API ID) |
| Polar | `checkout_id={CHECKOUT_ID}` |

The helper reads one returned reference automatically. Add
`data-disable-payments="true"` to disable automatic return-parameter detection.
You can still submit a known reference explicitly:

```js
jelto('payment', { session_id: stripeSessionID });
jelto('payment', { order_id: lemonSqueezyNumericOrderID });
jelto('payment', { checkout_id: polarCheckoutID });
```

Submit exactly one reference per call. Jelto verifies the provider's payment
success, merchant, environment, and selected products before changing any
attribution. Repeated callbacks and webhooks resolve to the same monetary
record. A claim that arrives before payment success is retried for up to
24 hours. Known server metadata and app installation attribution take priority.

## Email fallback

For a custom checkout flow, explicitly submit the email used for that purchase:

```js
jelto('payment', { provider: 'stripe', email: checkoutEmail });
```

The provider can be omitted to match across the website's connected providers.
Names, customer IDs, analytics visitor IDs and browsing session IDs are not
accepted. Email is trimmed and lowercased; dots and plus suffixes are preserved.

Jelto uses the purchase email only for temporary payment matching. The raw email
is not stored or included in analytics or logs. Matching data is **pseudonymous**,
not anonymous. A matching request expires 24 hours after submission and can only
match an eligible payment within 24 hours of that payment. Expired matching data
is no longer used.

Only one eligible initial payment can match a claim. Renewals and subscription
updates are excluded. If another initial payment or conflicting claim makes
the match ambiguous within the active matching window, Jelto removes the
browser attribution it previously applied, including inherited refund labels.
Amounts and payment dates do not change. Later server metadata remains intact.
Delayed provider information arriving after expiry cannot be matched by email.

Reference and email claims are temporary matching requests. Capacity limits or ambiguous evidence can leave a claim unmatched while preserving the actual payment. Use server metadata or a verified checkout reference when possible.

Disconnecting stops matching for that connection and removes its temporary
matching data. Deleting the product or account removes its matching data too.
Analytics shows aggregate channel labels. Website visitors and app installations
remain separate; this feature does not link their identities.

## Verify attribution

An accepted tracking request does not confirm that a payment was matched. Open
**Settings → Revenue** and check **API synchronization**, **Last live receipt**
and **Attribution verified** separately. Confirm that the payment appears and
that its channel is correct. If the payment appears without a channel, follow
[Missing revenue attribution](../troubleshooting/all-revenue-shows-direct.md).
