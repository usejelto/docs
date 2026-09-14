---
title: "Install on WooCommerce storefront"
group: install
slug: install/woocommerce
summary: "Add Jelto to your WooCommerce storefront website and verify the published pages."
---

# Install on WooCommerce storefront

Measure visits to your WooCommerce storefront website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Install the tag in the WordPress site-wide header, as in the WordPress guide. With WPCode, use **Code Snippets → Header & Footer → Header**, then paste the complete tag.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Save and open a public product page outside WordPress admin.

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

This is a website-script installation. It does not automatically send WooCommerce order data or instrument a hosted payment page. Connect a supported payment provider separately.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official WooCommerce storefront documentation](https://wordpress.com/support/adding-code-to-headers/).
