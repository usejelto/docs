---
title: "Install on Squarespace"
group: install
slug: install/squarespace
summary: "Add Jelto to your Squarespace website and verify the published pages."
---

# Install on Squarespace

Measure visits to your Squarespace website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open the site-wide **Code Injection** panel and paste the complete tag into **Header**. Use site-wide injection rather than a single page Header Code Injection field.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Save, then visit the published site outside the editor.

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

Code Injection needs a supported plan. Checkout pages do not support this code, so storefront installation does not provide checkout or payment coverage automatically.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Squarespace documentation](https://support.squarespace.com/hc/en-us/articles/205815908-Using-code-injection).
