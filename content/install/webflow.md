---
title: "Install on Webflow"
group: install
slug: install/webflow
summary: "Add Jelto to your Webflow website and verify the published pages."
---

# Install on Webflow

Measure visits to your Webflow website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open **Site settings → Custom code**. Paste the complete tag in **Head code** to include it site-wide, rather than a single page Embed element.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Save the code and publish to the domain you registered in Jelto.

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

Your site or workspace needs custom-code access. Designer preview alone does not establish that the published site runs the script.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Webflow documentation](https://help.webflow.com/hc/en-us/articles/33961357265299-Custom-code-in-head-and-body-tags).
