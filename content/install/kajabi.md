---
title: "Install on Kajabi"
group: install
slug: install/kajabi
summary: "Add Jelto to your Kajabi website and verify the published pages."
---

# Install on Kajabi

Measure visits to your Kajabi website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open **Settings → Site Details → Page Scripts**. Paste the complete tag into **Header Page Scripts**.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Save your changes at the bottom of the page and open the published site.

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

Site-level header scripts do not cover checkout and some system pages. A signup or checkout funnel can only use steps where Jelto actually runs. Connect revenue separately.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Kajabi documentation](https://help.kajabi.com/articles/analytics/add-google-tag-manager-to-your-site).
