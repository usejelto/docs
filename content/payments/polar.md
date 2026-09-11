---
title: "Connect Polar revenue"
group: payments
slug: payments/polar
summary: "Connect an organization, select products, import retained orders, and receive payments and refunds."
---

# Polar

Open your website's **Settings → Revenue** and choose Polar. Revenue is optional
and does not block installing website analytics.

## Connect an organization

1. Choose **Live** or **Test**. Test uses Polar's sandbox and stays separate
   from live reports.
2. Create an organization access token in your Polar account with
   `organizations:read`, `products:read`,
   `orders:read`, `refunds:read`, `subscriptions:read`, `webhooks:read` and
   `webhooks:write`, then paste it in Jelto.
3. Confirm the organization and select its products for this website. Jelto
   stores this explicit selection and applies it to reads and webhooks. An empty
   product selection includes all products in the selected organization.
4. Choose whether to import retained history and connect. Jelto creates its
   webhook for live payment updates.

If manual Payments API history exists, choose an explicit import start date
after it and stop duplicate manual events at the cutover.

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

3. In that server endpoint, preserve your existing authentication, CSRF protection, price selection and order validation. Accept only the documented aggregate attribution fields; never take an amount or product selection from untrusted browser metadata.
4. Copy those fields into the provider metadata location described below, create checkout with your server-held provider credential, and return its URL.
5. Verify a payment and its channel separately. Omit attribution when the helper has no context; do not invent a source.

### Hosted payment links

Add the checkout helper on the page containing the provider link. Keep the link as a real supported provider URL; the helper adds aggregate context without replacing unrelated metadata. For a verified return claim, configure the exact provider success parameter below and install the helper on the return page too.

### Other checkout flows

Use the limited email fallback only after your app confirms payment, when neither server metadata nor a supported checkout reference is available. Its matching and privacy limits are documented in [Browser payment attribution](browser-attribution.md#email-fallback).

## Forward checkout attribution

Load the optional `/jelto.checkout.js` helper after the main snippet on both
the checkout entry and success pages. Set the Polar checkout success URL to:

```text
https://your-site.example/thanks?checkout_id={CHECKOUT_ID}
```

The helper submits that checkout reference. Jelto verifies the paid
orders through the connected organization, checks the selected products and
environment, and adds only the aggregate channel attribution. Pending checkouts
retry for up to 24 hours. See [browser attribution](browser-attribution) for
installation and controls.

An optional fallback for custom checkout flows is:

```js
jelto('payment', { provider: 'polar', email: checkoutEmail });
```

It can match one recent initial purchase using the email on the paid order. Renewal, subscription-update and unknown
billing reasons are excluded. Ambiguous email matches remain unattributed.

The account connection retrieves revenue. For channel attribution, forward
only the aggregate context returned by the snippet:

```js
const attribution = jelto('attribution');
const metadata = {
  jelto_cohort: attribution.cohort,
  ...(attribution.first ? { jelto_jt: 'first' } : {}),
};
```

Pass `metadata` when your server creates a Polar checkout. Hosted checkout
integrations that accept the documented metadata query parameter can use the
optional `/jelto.checkout.js` helper or URL-encoded JSON:

```js
const checkout = new URL(POLAR_CHECKOUT_URL);
checkout.searchParams.set('metadata', JSON.stringify(metadata));
location.assign(checkout.href);
```

Keep email, customer, session and visitor IDs out of metadata. Unlabelled
orders remain unknown attribution. Renewal orders can use the subscription's
aggregate metadata when the order does not repeat it.

## Payments, refunds and recovery

Only paid orders count. `total_amount` includes tax after discounts and before
fees. Each paid order is counted once, even when it appears in both history and live updates.
An order-created notification alone does not count as payment.

Only successful refunds subtract revenue. Their gross amount includes both
`amount` and `tax_amount`: 300 cents plus 60 cents returned tax subtracts 360
cents. Pending, failed and canceled refunds do not count. Refunds keep their
own dates and inherit the original order's channel when available.

Settings separately reports connection, history, live receipt and attribution.
A valid receipt proves webhook delivery; an attributed payment proves that
checkout metadata completed the journey. Retry resumes failed history.
Disconnect stops intake and keeps previously imported records.

## Reporting currency

Original signed amounts and currencies remain available. Dashboard estimates use the selected reporting currency and ECB historical cross-rates on each monetary event's UTC date, including
refund-date rates. A quote can be carried forward at most seven calendar days.
Missing currencies make converted totals **Incomplete**. These estimates are not
provider payout totals.

Primary references: [authentication](https://polar.sh/docs/integrate/authentication),
[checkout success URLs](https://polar.sh/docs/features/checkout/links),
[order checkout filter](https://polar.sh/docs/api-reference/orders/list),
[webhook creation](https://polar.sh/docs/api-reference/2026-04/webhooks/create-webhook-endpoint),
[refund tax semantics](https://polar.sh/docs/features/refunds).

## Verify the connection

Use the provider's Test environment with a test checkout on your own website. Check payment receipt, history/sync status and channel attribution separately under **Verify revenue & attribution**. Allow a pending payment to settle; repeatedly clicking the connection action does not make it paid.

If the account connection is unavailable in Jelto, contact the Jelto team. See [connection troubleshooting](../troubleshooting/integrations.md) and [missing attribution](../troubleshooting/all-revenue-shows-direct.md).
