---
title: "Signup and checkout funnel examples"
group: goals
slug: goals/funnel-examples
summary: "Adapt two short journeys to the pages and events your website actually sends."
---

# Signup and checkout funnel examples

Use these definitions as examples, then replace paths and event names with those on your site. [Create the funnel](../web/funnels.md) only after its pages and goals send data.

## Signup journey

| Step | Kind | Value | Meaning |
| --- | --- | --- | --- |
| Landing | Page | `/` with Equals | The visit reached your homepage. |
| Signup page | Page | `/signup` with Equals | The visit reached the signup form. |
| Account created | Goal | `signup` | Your browser received confirmation that account creation succeeded. |

Call `window.jelto?.('event', 'signup')` in your application's successful account-creation handler. A click on Create account is a different event and should not stand in for successful signup.

Perform this journey once in the same browser visit, then inspect each step in the chosen date range. If your site enters signup directly from a campaign, the homepage-first funnel will intentionally omit those visits; create a second funnel starting at `/signup` to answer that question.

## Checkout journey

| Step | Kind | Value | Meaning |
| --- | --- | --- | --- |
| Pricing | Page | `/pricing` with Equals | The visit viewed prices. |
| Checkout started | Goal | `checkout_started` | Your app successfully opened or created checkout. |
| Return page | Page | `/success` with Equals | The visit reached the tracked return page. |

Send `checkout_started` after checkout creation succeeds. Configure your provider's success URL to return to the real tracked success page. A return-page visit is a navigation signal; only your provider can establish that money was paid. Visitors who close the checkout without returning may have a recorded payment but no final pageview.

## Investigate drop-off

Select dates with actual traffic and clear filters. Check that paths match exactly, host restrictions are correct and goal names match the Events list. Compare **Starts with** carefully: `/pricing` also includes paths such as `/pricing-team`.

For a revenue total or channel breakdown, use [Revenue](../payments/connect.md). A funnel conversion rate does not replace payment verification.
