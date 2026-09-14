---
title: "Install on Wix"
group: install
slug: install/wix
summary: "Add Jelto to your Wix website and verify the published pages."
---

# Install on Wix

Measure visits to your Wix website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open your site dashboard **Settings → Development & integrations → Custom Code → Add Custom Code**. Paste the tag, name it Jelto, select **All pages**, choose to load once per visit and use **Head** placement. Categorize it consistently with your analytics consent setup.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Choose **Apply**. Use the published site with a connected domain.

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

Use Custom Code rather than an HTML iframe widget. Verify both the initial page and Wix navigation; this is a custom script installation, not a native Wix analytics connector. Domain changes may require reinstalling custom code.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Wix documentation](https://support.wix.com/en/article/wix-editor-embedding-custom-code-on-your-site).
