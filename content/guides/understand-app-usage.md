---
title: "Understand app usage"
group: guides
slug: guides/understand-app-usage
summary: "Read active installs, version adoption, onboarding funnels and retention."
---

# Understand app usage

For a product with app activity, the dashboard includes app metrics and cards. Use them to understand adoption after installation and whether people keep returning.

## Start with the app metrics

- **Installs** counts install claims received during the period. A reinstall is another install.
- **Active installs** counts distinct installs that sent activity during the selected range.
- **% on latest** shows adoption of the latest configured app version.
- **D7 retention** shows how many eligible installs returned on day seven.

Select an app metric to explore its trend, just as you would a website metric.

## Check version adoption

Find **Version adoption** in the app section. The card groups active installs by their latest reported version on the reference day and shows **% on latest** alongside the distribution.

[![EQBase Version adoption card with a callout pointing to the 76 percent on latest indicator and a table of active installs by version.](../images/07-app-usage.png)](../images/07-app-usage.png)

*Version adoption shows each active install under its latest reported version. Select the image to view it at full size.*

Use **Quiet · 14+ days** to explore installs that have stopped checking in, or **App updates** to inspect reported version changes. **View version data** opens the underlying breakdown.

## Follow onboarding to an outcome

Use an [app funnel](../app/funnels.md) to measure an ordered journey such as `onboarding:welcome → onboarding:complete → upgrade_click`. Open **Settings → Events & funnels → Funnels → Add funnel**, choose **App**, and use the exact onboarding or custom event names your SDK sends.

The report counts installs entering step 1 during the selected dates. Later steps can occur on later days, through the last completed day when you query. Repeated events count once per step, and an event that happens before its preceding step does not advance the journey. Recent cohorts need time to progress; counts below five installs are suppressed.

An onboarding step matches its name regardless of `ok`, `fail` or `skip` status. Use onboarding status metrics when investigating failed or skipped setup steps. An upgrade click is an action; use license or verified payment reporting to assess paid conversion.

## License properties

Report the `license` install property with your desktop SDK’s install-property setter when the license changes.

Accepted license values are strings matching `^[a-z0-9_.-]{1,24}$`, such as `free`, `trial`, `paid` or `expired`; these examples are not a fixed enum. Uppercase letters, spaces and values longer than 24 characters are rejected. `license_share` breaks the live install fleet down by the stored `license` value. `license_conversion` counts an install as converted only when its latest stored `license` equals the product's `paid_license_value` setting by string equality; the setting defaults to `paid`. If no stored values ever match, an otherwise reportable cohort stays at a true, permanent 0 % even though the query succeeds; align the value in the product settings or through the account API's `paid_license_value` field.

## Put retention in context

The **Retention** card offers **D1**, **D7**, and **D30**. A cohort needs time to reach the day being measured; recent installs may not yet qualify. Treat unavailable retention as unavailable, rather than assuming nobody returned.

**Download to Install** is a period ratio. Downloads and installs counted in the same period can belong to different people, so it is not a person-by-person conversion funnel.

Need to connect an app first? Choose the appropriate [app setup guide](../sdk/swift.md), such as [Electron](../sdk/electron-forge.md) or [Tauri](../sdk/tauri.md).
