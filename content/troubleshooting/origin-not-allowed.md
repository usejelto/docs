---
title: "Fix origin_not_allowed"
group: troubleshooting
slug: troubleshooting/origin-not-allowed
summary: "Register the actual website hostname and keep browser and server endpoints separate."
---

# Fix origin_not_allowed

This rejection means a browser event did not come from an allowed website origin for the selected product.

## Fix the website installation

1. Open the published page and check the hostname after any redirect. While the installation check is waiting, **Settings → Installation** and guided setup also tell you if Jelto is receiving pageviews from a hostname that isn't on the website's **Allowed hostnames** list.
2. In Jelto, open **Settings → Installation → Allowed hostnames** and register that host. Creating a website for `example.com` or `www.example.com` registers both; add any other subdomain, such as `docs.example.com`, when it is actually used. If an existing website lists only one of the `www` and non-`www` pair, add the other when your site serves it.
3. Confirm the product ID in the script (such as `prd_8f3kq2m9x1`) belongs to this product, then publish the corrected tag.
4. Reopen the page in a normal browser and run [Check traffic](../start/verify.md).

A hostname entry is a host such as `www.example.com`, not a complete page URL. A custom tracking subdomain is where events are delivered; it does not replace the website's own allowed hostname.

## Other causes

Local previews often use a different host from production. Localhost also needs the explicit local-testing script option. A proxy or iframe can change the actual browser origin; inspect the context that executes the script.

Do not bypass the check with a fake Origin header or put a secret API key (`jk_…`) into the browser. For authenticated server reporting or payments, use the [Website API](../api/website.md) and its intended key scope.
