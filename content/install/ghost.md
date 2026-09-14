---
title: "Install on Ghost"
group: install
slug: install/ghost
summary: "Add Jelto to your Ghost website and verify the published pages."
---

# Install on Ghost

Measure visits to your Ghost website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. In Ghost admin, open **Settings → Advanced → Code Injection**. Paste the complete tag into **Site Header**.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Save Code Injection and open the public site.

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

Use the site-wide field, not only the Code Injection field for one post. Make sure your theme includes the normal Ghost header output.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Ghost documentation](https://ghost.org/help/code-injection-styles/).
