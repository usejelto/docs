---
title: "No data arriving"
group: troubleshooting
slug: troubleshooting/no-data
summary: "Check the live installation, hostname, collection state and browser restrictions."
---

# No data arriving

Start with the data source you expected to see. Website pageviews, app activity, provider payments and crawler requests use different connections.

## Website checklist

1. Open the correct product, select dates including today and clear dashboard filters.
2. Check account collection status and **Settings → Traffic & usage → Pause website collection**.
3. Inspect the published page, not just an editor preview. Confirm one script uses the correct product ID (such as `prd_8f3kq2m9x1`).
4. Register the hostname reached after redirects in **Settings → Installation → Allowed hostnames**. If your site serves both `example.com` and `www.example.com`, check that both are listed; creating a website registers that pair, but other subdomains, such as `blog.example.com`, need their own entry. While the installation check is waiting, **Settings → Installation** and guided setup tell you if pageviews are arriving from a hostname that isn't on this list.
5. On the published page, open your browser's DevTools, select **Network** and reload. `jelto.js` (or `jelto.cookie.js`, or the script on your custom tracking domain) should return `200`.
6. Select the `/v1/e` request and read its response. HTTP `202` with `{}` means the batch was accepted; an unknown product ID also receives `{}`, so recheck step 3 if nothing appears. A rejected event is listed with its position and reason, such as `{"rejected":[{"i":0,"reason":"origin_not_allowed"}]}`. For `origin_not_allowed`, see [Fix origin_not_allowed](origin-not-allowed.md). Other `reason` values are listed in section 6, Acceptance and rejection, of the [public wire contract](https://github.com/usejelto/contracts).
7. If there is no `/v1/e` request, or the script or request shows as blocked, check blocker extensions, your site's consent logic and your [content security policy](../web/configuration.md#endpoints-and-content-security-policy).
8. Open a real page in a normal browser and run [Check traffic](../start/verify.md).

Localhost and automation are excluded by default. `file:` URLs do not work. A URL containing `jelto_ignore=1` intentionally suppresses collection for that document. See [Script configuration](../web/configuration.md).

## Other sources

For an app, check SDK initialization, permission to collect, product/app slug and its network access. The SDK queues the first install claim on first initialization and sends it about 2 seconds later; offline sends retry with backoff.

For payments, check the selected environment, connection and sync state before checking attribution. For server crawlers, a successful connection check creates no traffic: enable collection and verify actual eligible requests.

## Ask for help

Share the product name, affected hostname, approximate time and safe status/error text with the Jelto team. Do not include credentials, personal event data or full server logs.
