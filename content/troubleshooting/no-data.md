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
3. Inspect the published page, not just an editor preview. Confirm one script uses the correct product ID.
4. Register the hostname reached after redirects in **Installation → Allowed hostnames**.
5. Check that the script loads and CSP permits both its origin and the ingestion endpoint. Check whether a blocker or your site's consent logic prevents execution.
6. Open a real page in a normal browser and run [Check traffic](../start/verify.md).

Localhost and automation are excluded by default. `file:` URLs do not work. A URL containing `jelto_ignore=1` intentionally suppresses collection for that document. See [Script configuration](../web/configuration.md).

## Other sources

For an app, check SDK initialization, permission to collect, product/app slug and its network access. The SDK queues the first install claim immediately on first initialization.

For payments, check the selected environment, connection and sync state before checking attribution. For server crawlers, a successful connection check creates no traffic: enable collection and verify actual eligible requests.

## Ask for help

Share the product name, affected hostname, approximate time and safe status/error text with the Jelto team. Do not include credentials, personal event data or full server logs.
