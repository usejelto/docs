---
title: "Understand cookies and domains"
group: guides
slug: analytics/cookies-and-domains
summary: "Choose collection behavior and understand what can cross website boundaries."
---

# Understand cookies and domains

Jelto's default website script is cookieless. Optional cookie mode, first-touch memory and checkout memory serve different purposes and should be chosen explicitly.

## Cookie mode

In website setup or **Settings → Installation**, select **Use cookie mode** and review the confirmation. The choice is available with both agent and manual installation. Confirming saves the mode and updates the script and agent prompt; it does not publish changes to your website. Replace the existing script and publish your site. Cookie mode uses `/jelto.cookie.js` in place of `/jelto.js`; never load both for one page.

Use the cookie-mode installation only when it matches your site's privacy and consent choices. Configure your site's consent gate before loading the script where required; enabling cookie mode does not add a consent banner. The first-party `jelto_vid` cookie lasts up to 13 months from creation, without extending on later visits, and is limited to the hostname that sets it. A persistent browser identifier can support new/returning and visit-count reports when the required retained history exists.

**New** means first observed in the retained history during the selected range. **Returning** means previously observed in that history. These are not lifetime identities, and enabling cookie mode cannot recover older uncollected history. Mixed collection modes or incomplete evidence can make a report unavailable.

To switch back, clear **Use cookie mode**, confirm, then replace the installed script with the updated cookieless version and publish. Cookieless tracking counts visitors separately each day and does not read or set visitor cookies. Switching scripts does not delete cookies already in a visitor's browser. First-touch memory and checkout memory keep their own settings.

## First-touch and checkout memory

`data-memory="on"` explicitly enables first-touch channel memory. The checkout helper has separate, short-lived tab memory for aggregate checkout context, controlled by `data-payment-memory="off"`. See [Script configuration](../web/configuration.md) and [Browser payment attribution](../payments/browser-attribution.md).

## Multiple website hosts

Register every collecting hostname under **Settings → Installation → Allowed hostnames**. For aggregate channel propagation between your sites, load the optional cross-domain helper before the core tracker:

```html
<script defer src="YOUR_SCRIPT_HOST/jelto.crossdomain.js"
  data-product="YOUR_PRODUCT_ID"
  data-domains="example.com,shop.example.com"></script>
<!-- Your existing core Jelto script goes next. -->
```

Use the same product and the script host from your dashboard. The helper decorates eligible links with aggregate channel context and preserves existing explicit UTM information. It does not move a browser cookie or join sessions across hosts. Visitor cookies remain host-only.

## Verify

Open a campaign-tagged landing page, follow a real link to the second registered host and check the resulting source reports. Check whether redirects preserve the channel parameters. Missing labels remain missing; do not add a personal ID to make the two sides match.

A [custom tracking domain](../integrations/tracking-domain.md) changes where collection is served. It does not create cross-domain identity or replace consent choices.
