---
title: "Goals or funnels are missing"
group: troubleshooting
slug: troubleshooting/events-and-funnels
summary: "Check event delivery, ordering, dates and privacy limits for website or app funnels."
---

# Goals or funnels are missing

Opening the goal setup guide or saving a funnel definition does not generate traffic. First verify the underlying pageviews and events.

## Missing goal

1. Send the event to the correct product. It and its property keys appear in **Settings → Events & funnels → Events** automatically after receipt.
2. Match its spelling and case exactly in the sender. Check name spelling, reserved names and the limits of 100 custom events and 20 property keys per event.
3. Perform the action after the tracker or SDK initializes. A guarded browser call made too early can do nothing.
4. Check **Rejected in the last 7 days** and correct the reported reason.
5. Open Goals for the correct product, surface and date range. Clear filters and check hidden-goal presentation settings.

For forms, distinguish a button click, a validated browser submission and a server-confirmed result. For visibility, check helper order, the threshold, delay and whether enough of the element can fit in the viewport.

## Empty or incomplete funnel

Check the saved funnel's surface first, then follow the matching checklist.

### Website funnel

1. Verify each step independently in Pages or Goals.
2. Check **Equals** versus **Starts with**, actual path spelling and any hostname restriction.
3. Match the event identifier, not its display label.
4. Perform the steps in order in the same website visit. A later visit or app event does not complete that sequence.
5. Check the dates and data coverage. Imported daily totals cannot reconstruct ordered visits.

A hosted checkout may complete without a browser return. In that case a provider payment can exist even though the funnel's success-page step is absent. [Check revenue](../payments/connect.md) separately.

## Empty or incomplete app funnel

1. Confirm the definition uses **App**. An app event cannot advance a website funnel, even if its name is accepted as a website goal step.
2. Verify receipt of each exact app event name for the same product. Use `onboarding:complete` for the onboarding milestone, including its prefix. A display label is not an event identifier.
3. Check that the same install sent step 1 followed by the remaining steps. A reinstall has a different install identity. Repeated events cannot replace a missing preceding step; an event sent before that step needs a later occurrence to count.
4. Select dates containing step 1, and allow the entry day to complete in the reporting timezone. Later steps can occur after the selected end date, but today's activity is outside the reference day.
5. Clear filters and retry. App funnels accept only **App**, **App version**, **Architecture**, **Install age** and **OS** filters, evaluated at entry.

| Result | What to check |
| --- | --- |
| `withheld` with `cohort is not mature yet` | The range has no completed entry day. Read it after the day ends or select a completed period. |
| `below_floor` | Fewer than five installs reached the step, including possibly none. Keep the suppressed state; it does not establish zero completions. |
| `unexpected_surface` | Query an app definition with `surface=app`; omit `surface` for a website definition. Read the saved definition before choosing the query. |
| `invalid_steps` on create or update | Use only `kind: goal` and exact matching. Omit `hostname` entirely, even an empty field. |
| `reserved_event` on create or update | Replace an install, heartbeat or other reserved app measurement with the actual onboarding or custom event. |

Equal event timestamps use their recorded ingestion sequence. Older events without that sequence remain tied, so they may not establish the required step order. Onboarding steps match event names regardless of `ok`, `fail` or `skip`; inspect onboarding status metrics to explain failures separately.

Return to [Create a goal](../goals/create-goal.md), [Create a website funnel](../web/funnels.md) or [Create an app funnel](../app/funnels.md) for the setup sequence.
