---
title: "Connect Stripe revenue"
group: payments
slug: payments/stripe
summary: "Connect a merchant account, import retained payments, receive live updates, and attribute revenue to aggregate channels."
---

# Stripe

Open your website's **Settings → Revenue** and choose Stripe. Revenue setup is
optional; website analytics can start before you connect a payment account.

## Connect your account

1. Choose **Live** for real payments or **Test** for sandbox verification.
2. Create a restricted API key in your Stripe account for the selected
   environment. Grant read access to account identity, Charges (including refunds), PaymentIntents,
   Checkout Sessions and line items, Products, Subscriptions, and Invoices (including invoice
   payments). Paste its `rk_live_…` or `rk_test_…` value. Unrestricted customer
   `sk_…` keys are not accepted.
3. Select the merchant and products belonging to this website. An empty product
   selection includes all merchant products. Mixed-product orders are included
   only when every product belongs to the selected scope.
4. Choose whether to import retained history. Original dates are preserved. If
   manual Payments API history exists, choose an explicit import start date
   after it and stop sending those same payments manually at the cutover.

The connection works through automatic API synchronization, normally hourly.
Optionally grant **Webhook Endpoints: Write** on the restricted key: Jelto
sets up live payment notifications automatically.
Without that permission, Settings shows **API sync** and setup still completes.
Webhook creation failures also leave API synchronization available.

For advanced manual live delivery, create a Stripe webhook using the URL shown
in Settings and paste its `whsec_…` signing secret. Subscribe to:

- `charge.succeeded`, `charge.captured`, `charge.refunded`
- `refund.created`, `refund.updated`, `refund.failed`
- `payment_intent.succeeded`
- `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- `checkout.session.completed`, `checkout.session.async_payment_succeeded`
- `invoice.paid`, `invoice.payment_succeeded`

The webhook belongs to your connection. Saving a signing secret confirms
configuration. **Last live receipt** confirms actual delivery.

## Choose your checkout method

After connecting, expand **Set up checkout** and choose the method used by your website. Copy the generated example for your selected provider and environment. The code belongs in your own site's checkout flow.

### API-created checkout

1. Install the [checkout helper](browser-attribution.md#install-the-optional-helper) after your core tracker.
2. In the browser action that starts checkout, send its metadata to your existing server endpoint:

```js
const response = await fetch('/api/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jelto: window.jeltoCheckoutMetadata?.() ?? {} }),
})
if (!response.ok) throw new Error('Unable to start checkout')
const checkout = await response.json()
window.location.assign(checkout.url)
```

3. In that server endpoint, preserve your existing authentication, CSRF protection, price selection and order validation. Accept only the documented checkout attribution fields; never take an amount or product selection from untrusted browser metadata.
4. Copy those fields into the provider metadata location described below, create checkout with your server-held provider credential, and return its URL.
5. Verify a payment and its channel separately. Omit attribution when the helper has no context; do not invent a source.

### Hosted payment links

Add the checkout helper on the page containing the provider link. Keep the link as a real supported provider URL; the helper adds checkout context without replacing unrelated metadata. For a verified return claim, configure the exact provider success parameter below and install the helper on the return page too.

### Other checkout flows

Use the limited email fallback only after your app confirms payment, when neither server metadata nor a supported checkout reference is available. Its matching and privacy limits are documented in [Browser payment attribution](browser-attribution.md#email-fallback).

### Stripe Payment Element

Use the **PaymentIntent / Elements** method in Set up checkout. Send helper metadata to your server before creating the PaymentIntent, then attach it to that PaymentIntent. Keep the amount and currency server-controlled. Return only the client secret to Stripe.js, mount the Payment Element, and confirm payment through Stripe. A configured return page and payment reference can provide fallback attribution; payment amounts always come from the connected provider.

## Add channel attribution

For the easiest Checkout setup, load the optional `/jelto.checkout.js` helper
after the main snippet, on the checkout entry and success pages, and set:

```js
success_url: 'https://your-site.example/thanks?session_id={CHECKOUT_SESSION_ID}'
```

The helper reads the returned Session ID. Jelto verifies the paid Session,
merchant, environment, selected products and payment status through Stripe.
Delayed success is retried for up to 24 hours. This does not add a second payment.
Use the `data-environment="test"` helper setting for test Sessions. See
[browser attribution](browser-attribution) for installation and controls.

For a custom checkout without a return URL, the optional email fallback is:

```js
jelto('payment', { provider: 'stripe', email: checkoutEmail });
```

It matches only one recent initial payment whose provider email agrees. Missing
or conflicting provider emails remain unmatched. Recurring invoices are not
relabeled from a recent email claim. Server metadata remains the strongest
method and takes priority over browser claims.

The connection retrieves money independently of browser tracking. To attribute
payments, send the snippet's aggregate channel context to your checkout server:

```js
const metadata = window.jeltoCheckoutMetadata?.() ?? {};
```

For one-time Checkout, use the metadata on both the Session and PaymentIntent:

```js
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price: PRICE_ID, quantity: 1 }],
  success_url: SUCCESS_URL,
  cancel_url: CANCEL_URL,
  metadata,
  payment_intent_data: { metadata },
});
```

For subscription Checkout, use `subscription_data: { metadata }` alongside
Session metadata. For Elements, put metadata on the PaymentIntent and include
`jelto_product_id` when assigning the payment to a selected Stripe product.
Forward `jelto_pageview` from the helper to enable website conversion and funnels. Keep emails, customer IDs and analytics visitor/session identifiers out of metadata. The optional
email fallback above is a separate, short-lived matching flow.

For hosted Payment Links, add the optional `/jelto.checkout.js` helper to the
page containing the link. It forwards the available channel automatically and
preserves an existing unrelated client reference. Use the helper-generated value
unchanged. Missing channel information remains Unknown in revenue reports.

## Reporting and recovery

Revenue includes successful captured payments. The same payment is counted once,
even when Stripe sends multiple notifications or confirms it later. Paid renewals
are included according to your reporting settings.
Successful refunds subtract their actual amount; pending, failed and canceled
refunds do not. Captured totals include tax after discounts and before fees.
Invoices paid outside Stripe and balance adjustments without a charge are not
fabricated as charge revenue.

Use **Retry** to continue an interrupted history import or recheck imported
payments. Disconnecting stops new updates and keeps existing history. Reconnecting
the same merchant and product selection does not count those payments again.

Dashboard money uses the selected reporting currency and historical ECB cross-rates
on each monetary event's UTC date. Refunds use refund dates. Original signed
amounts and currencies remain available. Rates can be carried forward at most
seven calendar days; missing currencies make converted totals **Incomplete**. These
estimates are not Stripe settlement or payout values.


Primary references: [invoice payment relationships](https://docs.stripe.com/changelog/basil/2025-03-31/add-support-for-multiple-partial-payments-on-invoices),
[refunds](https://docs.stripe.com/refunds),
[Checkout Session references](https://docs.stripe.com/payments/checkout/custom-success-page),
[restricted API keys](https://docs.stripe.com/keys/restricted-api-keys),
[webhook endpoint creation](https://docs.stripe.com/api/webhook_endpoints/create),
[ECB rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html).

## Verify the connection

Use the provider's Test environment with a test checkout on your own website. Check payment receipt, history/sync status and channel attribution separately under **Verify revenue & attribution**. Allow a pending payment to settle; repeatedly clicking the connection action does not make it paid.

If the account connection is unavailable in Jelto, contact the Jelto team. See [connection troubleshooting](../troubleshooting/integrations.md) and [missing attribution](../troubleshooting/all-revenue-shows-direct.md).
