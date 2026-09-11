---
title: "Paddle custom Payments API adapter"
group: payments
slug: payments/paddle
summary: "Forward verified Paddle transactions and refunds with an explicitly scoped server key."
---

# Paddle

This guide uses Paddle Billing, not Paddle Classic. Paddle uses a custom server adapter. Stripe, Lemon Squeezy and Polar can instead
be connected directly under Settings → Revenue. For Paddle, mint a key under
Developer with **payments:write**, and save it as `JELTO_KEY` in your webhook
server. A default analytics-only key cannot write payments. The key is shown
once; manage or revoke it from the same screen.

## Checkout attribution

After the tracker loads, read aggregate attribution when opening checkout:

```js
const attribution = jelto('attribution');
Paddle.Checkout.open({
  items: [{ priceId: PRICE_ID, quantity: 1 }],
  customData: {
    jelto_cohort: attribution.cohort,
    ...(attribution.first ? { jelto_jt: 'first' } : {}),
  },
});
```

Pass that same metadata as `custom_data` when creating a transaction from your
server. It contains a channel label, not a visitor ID. Missing attribution
must stay missing. Web cohort and app `install_id` are mutually exclusive.

## Verified webhook adapter

This Express example uses the official `@paddle/paddle-node-sdk` to validate
the untouched body and its timestamp. Register this route **before** a global
JSON body parser. See [Paddle signature verification](https://developer.paddle.com/webhooks/about/signature-verification/).

Install `express` and `@paddle/paddle-node-sdk` in your Node.js server. Configure
`PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `JELTO_KEY` and `JELTO_ORIGIN` (your
Jelto dashboard's HTTPS origin). Use a separate Jelto product for sandbox tests:
the custom Payments API records submitted payments in its live dataset.
Subscribe your Paddle notification destination to `transaction.completed`,
`adjustment.created` and `adjustment.updated`.

```js
import express from 'express';
import { Paddle } from '@paddle/paddle-node-sdk';
const app = express();
const paddle = new Paddle(process.env.PADDLE_API_KEY);

function decimal(minor, currency) {
  const digits = new Intl.NumberFormat('en', { style: 'currency', currency })
    .resolvedOptions().maximumFractionDigits;
  const value = BigInt(minor);
  const unit = 10n ** BigInt(digits);
  return digits ? `${value / unit}.${(value % unit).toString().padStart(digits, '0')}` : value.toString();
}

app.post('/webhooks/paddle', express.raw({ type: 'application/json', limit: '1mb' }), async (req, res) => {
  let event;
  try {
    const raw = req.body.toString('utf8');
    await paddle.webhooks.unmarshal(raw, process.env.PADDLE_WEBHOOK_SECRET, req.get('Paddle-Signature') ?? '');
    event = JSON.parse(raw);
  } catch { return res.sendStatus(400); }
  const value = event.data;
  const purchase = event.event_type === 'transaction.completed';
  const refund = ['adjustment.created', 'adjustment.updated'].includes(event.event_type)
    && value.action === 'refund' && value.status === 'approved';
  if (!purchase && !refund) return res.sendStatus(200);
  try {
    const custom = value.custom_data ?? {};
    const payment = {
      transaction_id: value.id,
      occurred_at: event.occurred_at,
      currency: value.currency_code,
      amount: (refund ? '-' : '') + decimal(refund ? value.totals.total : value.details.totals.grand_total, value.currency_code),
      ...(refund ? { refund_of: value.transaction_id } : custom.jelto_cohort ? {
        cohort: custom.jelto_cohort, ...(custom.jelto_jt === 'first' ? { jt: 'first' } : {}),
      } : {}),
    };
    const result = await fetch(`${process.env.JELTO_ORIGIN}/api/v1/payments`, {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.JELTO_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payment), signal: AbortSignal.timeout(5000),
    });
    if (!result.ok) return res.sendStatus(503);
    return res.sendStatus(200);
  } catch { return res.sendStatus(503); }
});
app.listen(3000);
```

Use a stable transaction ID for retries. New records return 201, repeated IDs
return 200. Do not acknowledge a provider webhook before either Jelto accepts
it or your own durable queue takes responsibility for retrying it. Investigate
permanent validation failures in your server without logging payer data.

Decimal conversion uses the currency's minor-unit exponent and integer math:
JPY has no decimal places. Sales use the transaction total after credits,
including tax, rather than the pre-credit total or payout earnings. Refunds use the approved adjustment's
ID, negative amount and original transaction ID in `refund_of`. A found original
supplies refund attribution; a missing original stays unknown.

## Verify and read revenue

Confirm a new payment returns 201 and its exact retry returns 200, then inspect
the Revenue card over the event date. Revenue is already available in the
dashboard. It uses historical ECB cross-rates to estimate USD on the monetary
event's UTC date, preserving original amounts and currencies. Missing rates
are labelled incomplete; estimates are not settlement or payout amounts.
Historical provider imports without checkout attribution remain unknown.
Current custom payments with missing or empty cohorts also show Unknown;
some older payments may show Direct
instead. Neither missing-context case establishes a direct website visit.
API event times must be within the last 30 days or five minutes into the future.

Provider fields: [completed transactions](https://developer.paddle.com/webhooks/transactions/transaction-completed/)
and [approved adjustments](https://developer.paddle.com/webhooks/adjustments/adjustment-updated/).

Related: [Website API](../api/website.md), [Browser attribution](browser-attribution.md),
[Revenue attribution troubleshooting](../troubleshooting/all-revenue-shows-direct.md).
