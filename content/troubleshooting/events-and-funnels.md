---
title: "Goals or funnels are missing"
group: troubleshooting
slug: troubleshooting/events-and-funnels
summary: "Check event registration and ordered website evidence before changing a funnel."
---

# Goals or funnels are missing

A saved goal or funnel definition does not generate traffic. First verify the underlying pageviews and events.

## Missing goal

1. Confirm the event is saved under **Settings → Events & funnels → Events** and allow up to one minute.
2. Match its spelling and case exactly in the sender. Check every sent property against **Allowed properties**.
3. Perform the action after the tracker or SDK initializes. A guarded browser call made too early can do nothing.
4. Check **Rejected in the last 7 days** and correct the reported reason.
5. Open Goals for the correct product, surface and date range. Clear filters and check hidden-goal presentation settings.

For forms, distinguish a button click, a validated browser submission and a server-confirmed result. For visibility, check helper order, the threshold, delay and whether enough of the element can fit in the viewport.

## Empty or incomplete funnel

1. Verify each step independently in Pages or Goals.
2. Check **Equals** versus **Starts with**, actual path spelling and any hostname restriction.
3. Match the event identifier, not its display label.
4. Perform the steps in order in the same website visit. A later visit or app event does not complete that sequence.
5. Check the dates and data coverage. Imported daily totals cannot reconstruct ordered visits.

A hosted checkout may complete without a browser return. In that case a provider payment can exist even though the funnel's success-page step is absent. [Check revenue](../payments/connect.md) separately.

Return to [Create a goal](../goals/create-goal.md) or [Create a funnel](../web/funnels.md) for the setup sequence.
