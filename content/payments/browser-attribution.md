---
title: "Attribute a checkout to a channel"
group: payments
slug: payments/browser-attribution
summary: "Use a verified checkout reference, server metadata, or a short-lived email fallback."
---

# Browser payment attribution

Connect Stripe, Lemon Squeezy, or Polar in **Settings → Revenue** first. The
connection retrieves payment amounts and refunds. Browser attribution supplies
the marketing channel and an existing pageview reference; it never supplies revenue amounts.

## Install the optional helper

Add the helper after the main Jelto snippet, on the page before checkout and
the page customers return to:

```html
<script defer src="https://app.jelto.io/jelto.checkout.js"
  data-product="YOUR_PRODUCT_ID"></script>
```

Replace `YOUR_PRODUCT_ID` with your public product ID from **Settings → Installation**.
The example uses Jelto's standard script host. If you use a custom tracking domain,
load `/jelto.checkout.js` from that same domain. The return page's domain
must be in that website's domain list. For a first-party proxy, serve both
scripts and the configured payment endpoint through that proxy. Add
`data-environment="test"` for sandbox payments; live and test matching are separate.

The helper remembers the channel and existing pageview UUID in `sessionStorage` for up to
30 minutes, scoped to the product and browser tab. It stores no email or provider checkout reference there. Set
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

## Mark hosted checkout anchors

`jelto.checkout.js` rewrites only anchors carrying `data-jelto-checkout` with a matching provider value: `lemonsqueezy`, `stripe` or `polar` (`lemon_squeezy` is also accepted as a Lemon Squeezy alias). Use the matching value on a supported provider URL:

```html
<a href="https://your-store.lemonsqueezy.com/buy/YOUR_VARIANT"
   data-jelto-checkout="lemonsqueezy">Buy with Lemon Squeezy</a>
<a href="https://buy.stripe.com/YOUR_PAYMENT_LINK"
   data-jelto-checkout="stripe">Buy with Stripe</a>
<a href="https://polar.sh/checkout/YOUR_CHECKOUT_ID"
   data-jelto-checkout="polar">Buy with Polar</a>
```

Without this attribute, the helper does nothing to the checkout link, and payments read as unattributed unless server metadata or another documented attribution method supplies context. The `jl=` parameter that `jelto.js` appends goes on download links only, never on checkout links; checkout attribution uses the separate helper and provider metadata above.

## Website conversion and funnels

Use `window.jeltoCheckoutMetadata?.() ?? {}` when starting checkout. Forward its
`jelto_cohort`, `jelto_jt`, `jelto_entry_page` and `jelto_pageview` fields to the
provider's documented metadata location. `jelto_pageview` is the existing
pageview event UUID. It introduces no new cookie or cross-device identity.
For Stripe subscriptions, copy metadata to both the Checkout Session and
`subscription_data.metadata`; hosted Stripe Payment Links carry the reference
in `client_reference_id` while preserving any reference your application set.

Jelto links a verified payment or subscription goal only to an admitted pageview
for the same product, preceding the goal, within the selected reporting range.
Browser claims are also bound to their originating hostname. The goal uses the
visit's existing visitor and session identities. Repeated payments increase
**Completions** while **Linked visitors** counts the paying visitor once under
the website's identity model. Conversion divides linked visitors by observed
website visitors. **Unlinked completions** remain visible and are excluded
from conversion and funnels. Mixed identity modes can withhold a unique count
or rate while completions remain available.

Add `payment`, `free_trial` or another automatic goal to a website funnel,
choose it as the website KPI, or use **Filter by this goal**. Funnel steps must
occur in order within the existing visit and 24-hour funnel window. No goal
registration is needed. App payment goals remain completion-only.

Without a usable reference, historical payments and later renewals still count
as completions. An old checkout reference does not create a new visit for a
renewal outside that checkout's reporting range. With checkout memory off,
forward metadata before leaving your website; the return page cannot recover
the original pageview on its own.

## Purchases started from a desktop app

When checkout starts directly from a desktop app, no website visit exists, so the browser helper and return-page method do not apply. The payment stays completion-only unless your server sends it through the [Payments API](../api/website.md#custom-payments) with `install_id` from the desktop SDK. This associates the payment with an app install; it does not create a website visit. `install_id` and `cohort` never share one payment: sending both non-empty fields is rejected with `cohort_and_install_id_both_present`.

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
Analytics shows aggregate channel labels, linked visitor counts and funnel progress. Website visitors and app installations
remain separate; this feature does not link their identities.

## Verify attribution

An accepted tracking request does not confirm that a payment was matched. Open
**Settings → Revenue** and check **API synchronization**, **Last live receipt**
and **Attribution verified** separately. Confirm that the payment appears and
that its channel is correct. If the payment appears without a channel, follow
[Missing revenue attribution](../troubleshooting/all-revenue-shows-direct.md).
