---
title: "Track marketing campaigns"
group: guides
slug: analytics/campaigns
summary: "Use consistent UTM links and inspect the resulting source and campaign reports."
---

# Track marketing campaigns

Campaign links help distinguish intentional marketing traffic from ordinary referrals. Add UTM parameters to the destination URL before distributing it.

## Build a campaign link

Use a readable convention across your team:

```text
https://example.com/pricing?utm_source=newsletter&utm_medium=email&utm_campaign=autumn_launch&utm_content=primary_button
```

`utm_source` names the sender or platform; `utm_medium` names the channel type; `utm_campaign` identifies the campaign. Use `utm_content` for creative or placement differences and `utm_term` when you have a meaningful campaign term. Keep values consistent and free of personal information.

## Verify and interpret

1. Open the tagged link in a normal browser on your published site.
2. Confirm the URL reaches the tracked page without losing its parameters during redirects.
3. Choose dates including the visit and inspect Sources and the available campaign tabs/breakdowns.
4. Apply a source or campaign filter to compare pages and goals.

Referrer information and explicit campaign information are different signals. A Direct label can mean a visit has no usable external source, while Unknown revenue means no valid attribution accompanied a payment.

## Checkout and domains

An installed pageview script does not automatically send context through a custom checkout server. Use [payment attribution](../payments/browser-attribution.md). For movement between registered sites, see [Cookies and domains](cookies-and-domains.md).

Campaign labels describe aggregate channels. Do not put customer IDs, email addresses or a unique user token in UTM values, and do not treat them as a web-to-app identity link.
