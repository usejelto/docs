---
title: "Install on Google Tag Manager"
group: install
slug: install/google-tag-manager
summary: "Add Jelto to your Google Tag Manager website and verify the published pages."
---

# Install on Google Tag Manager

Measure visits to your Google Tag Manager website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open your web container and choose **Tags → New → Tag Configuration → Custom HTML**. Paste the complete Jelto tag. Use an **All Pages** pageview trigger, subject to your existing analytics consent rules.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Save the tag, preview the container, then submit and publish its new version.

The tag has this structure; uppercase values below must be replaced with the values from your own dashboard:

```html
<script defer
  data-product="YOUR_PRODUCT_ID"
  data-endpoint="YOUR_INGEST_ENDPOINT"
  src="YOUR_SCRIPT_URL"></script>
```

## Verify

Open the published homepage in a normal browser, navigate to another page, then use Jelto's **Check traffic** for the actual hostname. Follow [Verify website tracking](../start/verify.md). For a site with client navigation, check a route change and the Back button as well as a full reload.

## Common problems

Fire the installation once per document. Do not use a History Change trigger to reload the script: Jelto already observes supported SPA changes. Remove any separate direct installation.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Google Tag Manager documentation](https://support.google.com/tagmanager/answer/6107167?hl=en-GB).
