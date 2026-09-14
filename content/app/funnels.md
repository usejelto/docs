---
title: "Create an app funnel"
group: goals
slug: app/funnels
summary: "Follow ordered onboarding and custom events across an app install’s lifetime."
---

# Create an app funnel

An app funnel shows how installs progress through ordered app events, even when steps happen on different days. Website and app identities stay separate; use a [website funnel](../web/funnels.md) for a journey within a browser visit.

## Create the funnel

1. Open **Settings → Events & funnels → Funnels → Add funnel**.
2. Choose **App** under **Surface** and give the funnel a name.
3. Add 2–8 **Goal** steps using exact event names. Suggestions include app goals and `onboarding:<step>` names that your product has received. Creating a funnel does not send events.
4. Arrange the steps using the reorder handle or step actions. Add display labels under **Step options** if needed.
5. Review **Funnel preview**, choose **Save**, then **View funnel results**.

App steps always match the event name exactly. They have no page path, hostname or prefix match. Install and heartbeat measurements, such as `installs` and `active_installs`, cannot be steps.

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

Suppose an install first sends `onboarding:complete` on September 10, then `upgrade_click` on September 12. A September 10–10 cohort report includes both steps once the reference day reaches September 12. The date range selects entrants; it does not cut off their later steps.

## Read the results

Each install enters at its first step 1 event inside the selected dates in the product timezone. Each subsequent step counts once, at its first occurrence after the counted preceding step. Repeating a step does not count the install again. An early upgrade click cannot satisfy a step that comes after onboarding completion. An install that never sends step 1 contributes to no row.

Ordering uses event time, with a recorded ingestion sequence to break equal timestamps. The time a batch arrives does not replace event time. Historical events recorded without that sequence remain tied at equal timestamps.

Later steps count through the **reference day**, the last completed day in the product timezone when you query. Entry cohorts that have not completed a day use the existing **withheld** state. Young completed cohorts can still gain conversions later; compare cohorts with similar time to progress.

Every defined step remains in the report. Counts below five installs show **below floor**, including steps with no observed completions. The report does not print those suppressed values as zero. Rates also require at least five installs in their denominator. The first step has no previous-step rate.

Filter an app funnel by **App**, **App version**, **Architecture**, **Install age** or **OS**. These filters select the entry cohort. The step is a breakdown, not a filter.

## Query through an AI assistant

After reading the saved funnel definitions, ask for `funnel:<id>` with `surface: app` and the `funnel_step` breakdown. Add `funnel_first:<id>` and `funnel_prev:<id>` as companions for rates from the first and previous steps. Replace `<id>` with the saved funnel’s ID.

Use a preview when defining a funnel through MCP. A preview of `onboarding:complete → upgrade_click` should carry `surface: app`; it does not create a live definition. Querying a website funnel with `surface: app` returns `unexpected_surface`.
