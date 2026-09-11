---
title: "Pageviews look duplicated"
group: troubleshooting
slug: troubleshooting/duplicate-pageviews
summary: "Find repeated installations or overlapping automatic and manual tracking."
---

# Pageviews look duplicated

Compare pageviews before concluding that visitor counts are duplicated. One visitor can legitimately view several pages or reload one page.

## Find duplicate collection

1. Inspect the published document for multiple core Jelto tags or a core script plus the JavaScript browser SDK.
2. Check both the site's shared layout and site-builder custom code. A Tag Manager installation may be present in addition to a direct tag.
3. Remove manual route pageviews when automatic SPA tracking already reports that navigation.
4. Check that a framework effect does not insert a script on each mount or render. In Framer use Once for installation; in Tag Manager fire installation once per document.
5. Publish the change, reload a normal browser and navigate through two pages while observing collection requests.

Do not infer duplicates solely from a request count: a request can batch several events, and downloads or engagement can produce their own event types. Compare the actual pageview observations.

## Manual tracking

If you intentionally own pageview reporting, disable both automatic initial pageviews and SPA pageviews, then send exactly one at each intended point after the tracker loads. See [Script configuration](../web/configuration.md#routes-and-manual-pageviews).

Do not reset visitor or app identifiers to fix a collection duplicate. Fix the installation and use an appropriate date range to assess the result.
