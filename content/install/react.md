---
title: "Install on React, Vite and React Router"
group: install
slug: install/react
summary: "Add Jelto to your React, Vite and React Router website and verify the published pages."
---

# Install on React, Vite and React Router

Measure visits to your React, Vite and React Router website using the script from your Jelto product.

## Before you start

Register the published hostname in Jelto and copy the complete script from **Settings → Installation**. You need permission to edit and publish the site. If your platform restricts custom scripts, confirm that your plan provides this feature.

## Add the script

1. For a Vite React app, open the project-root `index.html` and put the tag inside `<head>`. For React Router framework mode, put the equivalent JSX script once inside the `<head>` of `app/root.tsx`; preserve its existing document and routing components.
2. Preserve the copied `data-product`, `data-endpoint` and `src` values.
3. Build and deploy your app with its existing production command.

The tag has this structure; uppercase values below must be replaced with the values from your own dashboard:

```html
<script defer
  data-product="YOUR_PRODUCT_ID"
  data-endpoint="YOUR_INGEST_ENDPOINT"
  src="YOUR_SCRIPT_URL"></script>
```

For React Router framework mode, the JSX equivalent goes inside your existing root `<head>`:

```tsx
<script defer data-product="YOUR_PRODUCT_ID"
  data-endpoint="YOUR_INGEST_ENDPOINT" src="YOUR_SCRIPT_URL" />
```

## Verify

Open the published homepage in a normal browser, navigate to another page, then use Jelto's **Check traffic** for the actual hostname. Follow [Verify website tracking](../start/verify.md). For a site with client navigation, check a route change and the Back button as well as a full reload.

## Common problems

Do not reinsert the script in a component effect on every render. Keep automatic SPA tracking on and avoid adding a second manual pageview listener.

If traffic is still missing, check [collection troubleshooting](../troubleshooting/no-data.md). For optional route, exclusion and download settings, use [Script configuration](../web/configuration.md).

Platform reference: [Official React, Vite and React Router documentation](https://reactrouter.com/api/framework-conventions/root.tsx).
