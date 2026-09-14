---
title: "Install on SvelteKit"
group: install
slug: install/sveltekit
summary: "Add Jelto to your SvelteKit website and verify the published pages."
---

# Install on SvelteKit

Measure visits to your SvelteKit website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. Open `src/app.html`. Add the copied tag inside `<head>`, after `%sveltekit.head%`. Keep `%sveltekit.head%` and `%sveltekit.body%` intact. If you use SvelteKit nonce-based CSP, also add `nonce="%sveltekit.nonce%"` to the tag.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Build and deploy with your existing SvelteKit adapter.

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

Do not add another tracker to `+page.svelte` or reinitialize it on each route change. Allow the tracking host in your CSP.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official SvelteKit documentation](https://svelte.dev/docs/kit/project-structure).
