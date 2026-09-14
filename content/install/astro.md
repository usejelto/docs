---
title: "Install on Astro"
group: install
slug: install/astro
summary: "Add Jelto to your Astro website and verify the published pages."
---

# Install on Astro

Measure visits to your Astro website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open the shared layout component used by your pages, for example `src/layouts/Layout.astro`. Paste the tag inside its `<head>` and add `is:inline` to keep Astro from bundling it as a module. Keep `defer` and the product attributes.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Build and deploy your Astro site.

This example uses Jelto’s standard cookieless script. Replace `YOUR_PRODUCT_ID` with your public product ID from **Settings → Installation**. If your copied tag uses a custom tracking domain, cookie mode or additional options, preserve those values:

```html
<script is:inline defer
  data-product="YOUR_PRODUCT_ID"
  data-endpoint="https://app.jelto.io/v1/e"
  src="https://app.jelto.io/jelto.js"></script>
```

## Verify

Open the published homepage in a normal browser, navigate to another page, then use Jelto's **Check traffic** for the actual hostname. Follow [Verify website tracking](../start/verify.md). For a site with client navigation, check a route change and the Back button as well as a full reload.

## Common problems

With client routing, check forward and back navigation on the published site. Do not add `data-astro-rerun` to reinstall the tracker on each navigation.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Astro documentation](https://docs.astro.build/en/guides/client-side-scripts/).
