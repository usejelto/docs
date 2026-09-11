---
title: "Install on Vue"
group: install
slug: install/vue
summary: "Add Jelto to your Vue website and verify the published pages."
---

# Install on Vue

Measure visits to your Vue website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. For a Vue app built with Vite, open the project-root `index.html` and paste the tag before `</head>`. Keep it outside `App.vue` and route components.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Build and deploy the production site using your existing Vite workflow.

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

Navigate between two Vue Router pages and use Back. Hash-based routes need the explicit `data-hash` option.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Vue documentation](https://vite.dev/guide/).
