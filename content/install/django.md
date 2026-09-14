---
title: "Install on Django"
group: install
slug: install/django
summary: "Add Jelto to your Django website and verify the published pages."
---

# Install on Django

Measure visits to your Django website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open your shared base template, commonly `templates/base.html`. Put the copied tag before `</head>` in that base. Ensure each relevant page extends the base template.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Deploy the changed templates through your usual Django release process.

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

Pages using a different base need the same installation. The browser script does not belong in Python request handlers.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official Django documentation](https://docs.djangoproject.com/en/5.2/ref/templates/language/).
