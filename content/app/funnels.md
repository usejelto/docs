---
title: "Create an app funnel"
group: goals
slug: app/funnels
summary: "Follow ordered onboarding and custom events across an app install’s lifetime."
---

# Create an app funnel

An app funnel shows how installs progress through ordered app events, even when steps happen on different days. Website and app identities stay separate; use a [website funnel](../web/funnels.md) for a journey within a browser visit.

## Before you start

Connect your app with [Swift](../sdk/swift.md), [Electron Forge](../sdk/electron-forge.md), [Electron Vite](../sdk/electron-vite.md), [Tauri](../sdk/tauri.md) or [.NET](../sdk/dotnet.md). Send the onboarding milestones and custom events you want to measure to the same product, and verify their receipt. Existing SDK onboarding and tracking calls work as funnel steps without new instrumentation when they already describe the journey.

Choose event names that represent the outcome you mean. For example, `upgrade_click` measures an upgrade click; a paid conversion needs separate payment or license evidence. The funnel follows an install ID, so its counts represent installs rather than individual people.

## Create the funnel

1. Open **Settings → Events & funnels → Funnels → Add funnel**.
2. Choose **App** under **Surface** and give the funnel a name.
3. Add 2–8 **Goal** steps using exact event names. Suggestions include app goals and `onboarding:<step>` names that your product has received. Creating a funnel does not send events.
4. Arrange the steps using the reorder handle or step actions. Add display labels under **Step options** if needed.
5. Review **Funnel preview**, choose **Save**, then **View funnel results**.

App steps always match the event name exactly. They have no page path, hostname or prefix match. Install and heartbeat measurements, such as `installs` and `active_installs`, cannot be steps.

A product can save up to 20 funnels across both surfaces. Choose the surface when creating the funnel; the dashboard keeps it fixed when editing. Saving or editing a definition applies its steps to retained event history. It does not require waiting for new events if the journey has already been recorded.

## Example: eqbase onboarding to upgrade

The eqbase app sends these onboarding milestones through `Jelto.onboarding` and sends `upgrade_click` through `Jelto.track`. Choose **App**, name the funnel **Onboarding to upgrade**, and add:

| Step | Event name | Suggested label |
|---|---|---|
| 1 | `onboarding:welcome` | Welcome |
| 2 | `onboarding:system_audio` | System audio |
| 3 | `onboarding:verify` | Verify audio |
| 4 | `onboarding:setup` | Setup |
| 5 | `onboarding:complete` | Onboarding complete |
| 6 | `upgrade_click` | Upgrade clicked |

For a shorter question, use just `onboarding:complete → upgrade_click`. This measures how many installs that reached the completion event later clicked upgrade. It does not establish that they paid. An onboarding step matches its event name regardless of its reported status.

## Choose dates and interpret later conversions

The date range selects installs whose first matching step 1 within that range starts the journey. It selects the entry event's date, which can be later than the date the app was installed. Later steps can happen after the range ends.

For the two-step example, select September 10, 2026 as both the start and end date, then read the report on September 14 in the product timezone. The reference day is September 13, the last completed day:

| Events for one install | Contribution to this cohort |
| --- | --- |
| Complete on September 10; upgrade click on September 12 | Counts at both steps. The click is after the selected end date but before the reference day ends. |
| Upgrade click before completion on September 10, with no later click | Counts only at completion. |
| Complete on September 10; upgrade click on September 14 | Counts only at completion for now. Today's click is not yet in the completed-day window. |
| Upgrade click on September 12, with no completion event | Counts at neither step. |

These examples explain eligibility; a single install's contribution is not shown as an individual report. The privacy floor still applies to the aggregate results.

There is no fixed 7-day or 30-day conversion window. A completed cohort can gain later conversions as its installs progress, so the same date range may show a higher conversion rate when queried later. Compare cohorts with similar time to progress.

## Read the results

Each install enters at its first step 1 event inside the selected dates in the product timezone. Each subsequent step counts once, at its first occurrence after the counted preceding step. Repeating a step does not count the install again. An early upgrade click cannot satisfy a step that comes after onboarding completion. An install that never sends step 1 contributes to no row.

Ordering uses event time, with a recorded ingestion sequence to break equal timestamps. The time a batch arrives does not replace event time. Historical events recorded without that sequence remain tied at equal timestamps.

Later steps count through the **reference day**, the last completed day in the product timezone when you query. Today's entrants are excluded from both counts and rates. A range with no completed entry day returns **withheld** with the reason `cohort is not mature yet`. An API `tz` override applies to both the selected dates and the reference day.

Every defined step remains in the report. Counts below five installs return **below floor** (`below_floor`), including steps with no observed completions. The report does not print those suppressed values as zero. Rates also require at least five installs in their denominator. The first step has no previous-step rate.

The **Conversion** figure is the share of entering installs that reached the final step in order. For each step, inspect its count, its rate from the first step and its rate from the previous step. See [goal and funnel reports](../guides/explore-goals-and-funnels.md) for the shared report controls.

Filter an app funnel by **App**, **App version**, **Architecture**, **Install age** or **OS**. These filters use the install's values at entry. A later app update does not move its earlier entry to the new version's cohort. A later repeat of step 1 cannot replace the first entry just to satisfy a filter. The step is a breakdown, not a filter.

## Query through an AI assistant

After [connecting an assistant](../mcp/setup.md), use this prompt:

```text
List my product's saved app funnels and show the steps of the onboarding-to-upgrade funnel. Report installs entering September 1–7, 2026, with step counts and conversion from the first and previous steps. State the reporting timezone and reference day, preserve withheld and below-floor results, and explain that later steps may occur after September 7.
```

The assistant should read `jelto_funnels_list`, then use `jelto_analytics_query`. Replace the sample product, dates and funnel ID `4` below with values from your product:

```json
{
  "product": "prd_acmedemo01",
  "query": {
    "metric": "funnel:4",
    "surface": "app",
    "dimension": "funnel_step",
    "companions": "funnel_first:4,funnel_prev:4",
    "from": "2026-09-01",
    "to": "2026-09-07"
  }
}
```

| Metric | Meaning for each step |
| --- | --- |
| `funnel:<id>` | Distinct entering installs that reached this step in order. |
| `funnel_first:<id>` | Share of entrants that reached this step. |
| `funnel_prev:<id>` | Share of the previous step's installs that reached this step; `not_applicable` on step 1. |

Reading definitions requires `funnels:read`; querying results requires `analytics:read`. Use the [app funnel preview example](../mcp/usage-examples.md#preview-a-new-app-funnel) to create one through MCP, or the [REST API recipe](../api/website.md#create-an-app-funnel) for a server integration. App funnel queries require `surface: app`. For website funnel queries, omit `surface`; a mismatched surface returns `unexpected_surface`.

If events are missing, steps do not advance, or results are suppressed, follow [app funnel troubleshooting](../troubleshooting/events-and-funnels.md#empty-or-incomplete-app-funnel).
