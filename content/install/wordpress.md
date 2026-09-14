---
title: "Install on WordPress"
group: install
slug: install/wordpress
summary: "Add Jelto to your WordPress website and verify the published pages."
---

# Install on WordPress

Measure visits to your WordPress website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Use a site-wide header-code facility. With the WPCode Insert Headers and Footers plugin, open **Code Snippets → Header & Footer** and paste the tag in **Header**. This is a general WordPress code-insertion plugin, not a Jelto plugin.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Choose **Save Changes**, then clear your site cache if it still serves the old HTML.

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

A page Code block displays code rather than installing it site-wide. WordPress.com must allow custom scripts on your plan. Check again after a theme or caching change.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official WordPress documentation](https://wordpress.com/support/adding-code-to-headers/).
