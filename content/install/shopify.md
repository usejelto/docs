---
title: "Install on Shopify storefront"
group: install
slug: install/shopify
summary: "Add Jelto to your Shopify storefront website and verify the published pages."
---

# Install on Shopify storefront

Measure visits to your Shopify storefront website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. In Shopify admin, open **Online Store**, open the theme actions menu and choose **Edit code**. In `layout/theme.liquid`, paste the complete tag immediately before `</head>`. Keep the existing Shopify content placeholders.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Save the theme and publish the changed theme when you edited an unpublished copy.

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

This tracks the storefront where the theme runs. It is not a Shopify pixel extension and does not automatically cover checkout, customer-account pages or revenue. Recheck the tag after a theme replacement.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Shopify storefront documentation](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/edit-code/edit-theme-code).
