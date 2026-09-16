---
title: "Connect revenue"
group: payments
slug: payments/connect
summary: "Connect a payment account and separately verify checkout attribution."
---

# Connect revenue

Use Revenue to see payments and refunds alongside your website analytics. There are two parts: connecting the provider imports money; checkout attribution connects that money to an aggregate marketing channel.

## Choose your provider

| Provider | Connection | Guide |
| --- | --- | --- |
| Stripe | Restricted API key and selected merchant/products | [Connect Stripe](stripe.md) |
| Lemon Squeezy | API key and selected store/products | [Connect Lemon Squeezy](lemon-squeezy.md) |
| Polar | Organization token and selected products | [Connect Polar](polar.md) |
| Paddle or a custom provider | Your server forwards verified payments with a scoped key | [Paddle and Payments API](paddle.md) |

## Connect an account

1. Open **Settings → Revenue** and choose **Payment provider**.
2. Select **Test** to verify with the provider's test environment, or **Live** for real payments. Keep the account, checkout and helper in the same environment.
3. Follow the provider guide to create the required credential. Paste it only into the connection field; it never belongs in your website code.
4. Select the correct merchant/store/organization. Choose **Selected products only** and select at least one product, or explicitly choose **All products in this account**. Scope locks after payments are imported, so check accounts shared by multiple websites carefully.
5. Choose whether to **Import historical payments**. With history enabled, you can choose a start date at midnight UTC within retention; leave it blank for all retained history. Turn history off to collect from connection onward. If you previously sent these transactions through the Payments API, choose a cutover that avoids counting them twice.
6. Choose **Review connection**, check the provider, test/live environment, account, products and history, then connect. Review does not send a connection request until you confirm it.


[![Wide Revenue settings with badge 1 outlining Payment provider set to Stripe and Environment set to Live; connection is not configured.](../images/20-revenue-provider.png)](../images/20-revenue-provider.png)

*Choose the payment provider and environment. The example accurately shows an unavailable connection method.*

If this connection method is not configured, contact the Jelto team. Creating additional provider keys will not enable a connection that is unavailable in the dashboard.

## Add checkout attribution

After connection, expand **Set up checkout** and select the method your site uses. API-created checkout needs a browser-to-server metadata handoff. Hosted links can use the optional helper. Stripe Payment Element uses PaymentIntent metadata. The Other method offers a limited email fallback for a confirmed purchase.


[![Wide Revenue settings with badge 2 outlining Set up checkout, which requires a connection, and badge 3 outlining Verify revenue & attribution.](../images/21-revenue-checkout.png)](../images/21-revenue-checkout.png)

*Connect the provider to unlock checkout instructions, then verify payment receipt and channel attribution separately.*

Use the matching provider guide and [Browser payment attribution](browser-attribution.md). A connected account or imported history alone does not prove that attribution is working.

## Verify

In a provider test environment, visit your website through a tagged campaign link, complete its test checkout and return to the tracked success page. Use the selected environment's sync action, then check payment count, last sync/live receipt and channel attribution separately. Live checkout charges real money; it is not needed to test the documentation.

Keep amounts and dates from the provider. Historical payments without attribution may remain Unknown. A success-page visit can be a funnel step, but the provider determines whether payment succeeded.

## Read the result

[Understand revenue](../guides/understand-revenue.md) explains the card and channel breakdown. Reporting currency and renewal preferences change presentation; provider amounts remain preserved. For missing labels, use [Revenue shows Direct](../troubleshooting/all-revenue-shows-direct.md).

## Automatic goals

Connecting Stripe, Lemon Squeezy or Polar enables these goals automatically. No event registration or client-side payment event is needed.

| Goal | What it counts |
| --- | --- |
| `payment` | Successful positive payments, including one-time purchases and subscription payments. |
| `free_trial`, `trial_started` | The start of a subscription trial. These are two views of the same milestone. |
| `trial_converted` | A trial becoming a paid subscription. |
| `subscription_started` | The start of a paid subscription. |
| `subscription_upgraded`, `subscription_downgraded` | An increase or decrease in comparable monthly recurring value. |
| `subscription_renewed` | A successful payment explicitly identified as a renewal. |
| `subscription_cancel_scheduled` | Cancellation scheduled for the end of the current period. |
| `subscription_reactivated` | A scheduled cancellation reversed, or an ended subscription resumed. |
| `subscription_ended` | The subscription actually ending. |

Find these in Goals and the read-only **Automatic payment and subscription goals** list in Events settings. Payment API receipts also produce `payment` and, when classified as a renewal, `subscription_renewed`. Refunds do not create payment goals. Test payments and subscriptions stay out of live analytics.

Jelto extends existing managed webhook endpoints during synchronization. Credentials need subscription read access as well as the payment access described in each provider guide; Lemon Squeezy also uses prices and orders. If webhook updates are unavailable, subscription synchronization provides a fallback. Check the connection status if synchronization needs attention.

History recovers milestones with provider dates. It cannot reconstruct every past plan change or cancellation reversal without an earlier observed state. Metered, tiered or otherwise incomparable prices do not produce guessed upgrade or downgrade goals.

Use the [checkout helper](browser-attribution.md) to link verified goals to existing website visits. **Linked visitors** supports conversion, KPI selection, visitor filters and website funnel steps. **Completions** also includes payments without a usable reference; **Unlinked completions** shows that gap. App payment goals remain completion-only.

## Reconnect an existing account

Use the same provider, environment and merchant when replacing credentials or resuming a disconnected account. After discovery, Jelto identifies the saved connection and shows its existing product scope and history bounds for review. Reconnecting keeps those settings and resumes synchronization; it does not import a newly selected date range or move payments between products. If the saved connection changed, review the current settings again. Scope changes remain available only before payments have been imported.
