---
title: "Connect Lemon Squeezy revenue"
group: payments
slug: payments/lemon-squeezy
summary: "Select a store, import retained orders and renewals, and receive live payments and refunds automatically."
---

# Lemon Squeezy

Open your website's **Settings → Revenue** and choose Lemon Squeezy. Website
analytics and funnels can be set up independently of payment connections.

## Connect your store

1. Create a named Lemon Squeezy API key for **Live** or **Test** mode.
2. Paste it in Jelto and verify the accessible stores and products.
3. Select the store and products belonging to this website. An empty product
   selection includes all products in that store.
4. Choose whether to import retained history, then connect. Jelto automatically
   sets up payment notifications for that store.

Lemon Squeezy keys are not scoped read-only credentials. Jelto reads your
store/catalog, orders, subscriptions and invoices and manages its own webhook.
It does not issue refunds or change subscriptions. According to the [Lemon Squeezy API reference](https://docs.lemonsqueezy.com/api/getting-started/requests), generated keys are valid for one year; reconnect with a new key when credentials need attention.

If manual Payments API history already exists, choose an explicit import start
date after it and stop sending those same transactions manually at the cutover.
Jelto does not guess duplicates from amounts and dates.

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

Add the checkout helper on the page containing the provider link. Keep the link as a real supported provider URL; the helper adds aggregate context without replacing unrelated metadata. For a verified return claim, configure the exact provider success parameter below and install the helper on the return page too.

#### Mark hosted checkout anchors

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

### Other checkout flows

Use the limited email fallback only after your app confirms payment, when neither server metadata nor a supported checkout reference is available. Its matching and privacy limits are documented in [Browser payment attribution](browser-attribution.md#email-fallback).

## Attribute payments to a channel

Load the optional `/jelto.checkout.js` helper after the main snippet, on the
checkout entry and return pages. Set the product's Lemon Squeezy redirect URL to:

```text
https://your-site.example/thanks?order_id=[order_id]
```

Use `[order_id]`, the numeric API order ID. `[order_identifier]` is a different
UUID and cannot be used here. The helper submits the numeric ID; Jelto verifies
the order, store, environment, products, and paid status through Lemon Squeezy.
See [browser attribution](browser-attribution) for helper settings and limits.

For a custom flow that has the buyer's email but no order return parameter:

```js
jelto('payment', { provider: 'lemon_squeezy', email: checkoutEmail });
```

The fallback can label one recent initial order. It does not label subscription
renewals. Multiple matching initial orders remain unmatched; server metadata
takes priority over either browser method.

Revenue starts with the connection. You can also pass the aggregate label
through checkout as server metadata. Missing context remains unknown.

Use the optional `/jelto.checkout.js` helper or the documented custom checkout
parameters on a hosted checkout URL:

```js
const metadata = window.jeltoCheckoutMetadata?.() ?? {};
const checkout = new URL('https://your-store.lemonsqueezy.com/buy/YOUR_VARIANT');
for (const [key, value] of Object.entries(metadata)) {
  checkout.searchParams.set(`checkout[custom][${key}]`, value);
}
location.assign(checkout.href);
```

For API-created checkouts, put the same fields in `checkout_data.custom`.
Signed webhooks carry them in `meta.custom_data`. Renewal invoices can inherit
the initial order's saved server metadata, including `jelto_pageview`. Browser reference/email
fallbacks are limited to the identified initial payment. Historical API reads may omit
checkout custom data, so imported revenue can remain unattributed.

## Payments and refunds

Paid totals include tax after discounts and before fees. Subscription invoices
with `billing_reason=initial` are excluded because their initial order already
represents the payment. Paid renewal and update invoices are separate receipts.

Partial refunds reduce revenue by the amount actually returned. If the refunded
amount increases from 300 to 500 cents, revenue decreases by another 200 cents.
Repeated notifications do not subtract the refund again. Refunds use the date
reported by Lemon Squeezy.

Historical reads expose one cumulative amount and one provider refund date,
not each earlier partial refund. Jelto cannot reconstruct those earlier dates.
An imported period total can therefore include refunds made before that period
or before your retention window. The connection displays this limitation;
increments observed through live delivery remain separate refund records.

You can resume an interrupted history import. Imported payments keep their
original dates.
Connection, history, live receipt and attribution statuses are independent.
Completing history does not prove that checkout forwarded a channel label.
Disconnect stops intake and attempts to remove Jelto's webhook while keeping
history. Reconnecting the same store and product selection does not count payments again.

## Reporting currency

Dashboard currency estimates use ECB rates for each monetary event's UTC date;
refunds use their own dates. Original signed amounts and currencies are kept.
Rates older than seven calendar days are unavailable, and missing currencies
make converted totals **Incomplete**. Lemon Squeezy's provider USD fields are not mixed
with ECB conversion values from other providers.

Primary references: [API authentication and key expiry](https://docs.lemonsqueezy.com/api/getting-started/requests),
[webhook creation](https://docs.lemonsqueezy.com/api/webhooks/create-webhook),
[order amounts](https://docs.lemonsqueezy.com/api/orders/the-order-object),
[redirect link variables](https://docs.lemonsqueezy.com/help/products/link-variables),
[subscription invoices](https://docs.lemonsqueezy.com/api/subscription-invoices/the-subscription-invoice-object).

## Verify the connection

Use the provider's Test environment with a test checkout on your own website. Check payment receipt, history/sync status and channel attribution separately under **Verify revenue & attribution**. Allow a pending payment to settle; repeatedly clicking the connection action does not make it paid.

If the account connection is unavailable in Jelto, contact the Jelto team. See [connection troubleshooting](../troubleshooting/integrations.md) and [missing attribution](../troubleshooting/all-revenue-shows-direct.md).
