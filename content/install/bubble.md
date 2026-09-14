---
title: "Install on Bubble"
group: install
slug: install/bubble
summary: "Add Jelto to your Bubble website and verify the published pages."
---

# Install on Bubble

Measure visits to your Bubble website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open **Settings → SEO / metatags**. Under Advanced settings, paste the complete tag into **Script/meta tags in header**.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Deploy the app to Live and visit the published hostname.

This example uses Jelto’s standard cookieless script. Replace `YOUR_PRODUCT_ID` with your public product ID from **Settings → Installation**. If your copied tag uses a custom tracking domain, cookie mode or additional options, preserve those values:

```html
<script defer
  data-product="YOUR_PRODUCT_ID"
  data-endpoint="https://app.jelto.io/v1/e"
  src="https://app.jelto.io/jelto.js"></script>
```

## Verify

Open the published homepage in a normal browser, navigate to another page, then use Jelto's **Check traffic** for the actual hostname. Follow [Verify website tracking](../start/verify.md). For a site with client navigation, check a route change and the Back button as well as a full reload.

## Common problems

Do not install it both globally and in each page HTML header. Live and version-test pages can behave differently; verify the actual customer route.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Bubble documentation](https://manual.bubble.io/core-resources/application-settings/seo-metatags).
