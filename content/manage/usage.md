---
title: "Understand account usage"
group: manage
slug: manage/usage
summary: "Find account-wide usage, plan limits and separate crawler usage."
---

# Understand account usage

Usage and plan limits apply across websites and apps in your account. The selected product's Traffic & usage page links to account billing.

The 14-day trial includes two products for production and development, sharing the same account usage allowances. Starter includes one product after the trial. Remove the test product and wait for deletion to finish before choosing Starter, or choose Growth to keep both. Checkout never deletes products to fit a plan.

## Review usage

1. Open **Settings → Traffic & usage → View account billing**, or account Billing from your account menu.
2. Check the current period, plan and the displayed website/app usage.
3. Read any collection-limit or subscription status before interpreting missing recent data.
4. Review [crawler usage](../payments/bot-billing.md) separately when collecting bot requests.

Use the values and current offer shown in Billing when choosing a plan. A date range in the analytics dashboard is not necessarily your billing period.

## What counts as a web event

Your website allowance counts each accepted human pageview, download click,
outbound click, and custom website event as one. Custom events include tagged
clicks, form submissions, and visibility goals. Non-interactive events and goals
hidden from reports still count. Event properties add no extra units.

One pageview + one download click + one custom signup event = **three web events**.
Automatic engagement updates, scroll depth, time-on-page reports, payment-provider
records and derived payment goals, bots, and imported historical aggregates do not
consume this allowance. Derived metrics and funnel calculations add no events.
Rejected events and retries suppressed by ingestion do not count. Existing
[delivery and retry rules](../troubleshooting/duplicate-pageviews.md) still apply;
there is no additional lifetime deduplication guarantee for billing.

Desktop events, including heartbeats and custom events, use the separate monthly
active-install allowance. Server crawler requests have their own
[crawler allowance](../payments/bot-billing.md). Choose the smallest band that
covers both web events and active installs across all your products.

Billing measures calendar months in UTC and refreshes nightly. Product reports
can use a different timezone. A pending measurement is unknown, not zero;
current-month events appear after the first complete measurement.
Over-limit human usage triggers notices and an upgrade request, with no automatic
overage charge or throttling.

## Collection controls

**Pause website collection** stops website events while app and payment intake continue. Keep this separate from changing filters, hiding a goal or changing chart appearance, which do not stop collection.

If collection stopped unexpectedly, check the account subscription state, usage limits, website pause control and [missing-data checklist](../troubleshooting/no-data.md). Subscription changes and deletion can affect retention; read the account's confirmation before applying them.

Product deletion has a seven-day cancellation window. Allow at least seven days for the development product to be deleted before switching to a one-product plan.
