---
title: "Install on Podia"
group: install
slug: install/podia
summary: "Add Jelto to your Podia website and verify the published pages."
---

# Install on Podia

Measure visits to your Podia website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. From your site menu open **Admin → Settings → Analytics**. Choose **Edit** beside **Third-party code**, then paste the tag into **Website tracking code**. Podia places it near the end of the document.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Choose **Save** and visit the public website.

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

Website tracking code does not extend to the customer Home Feed. Do not put the core tracker only in Conversion tracking code or assume that website visits import purchases.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Podia documentation](https://help.podia.com/en/articles/11371020-installing-third-party-apps-on-your-podia-site).
