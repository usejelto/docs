---
title: "Save and reuse a segment"
group: guides
slug: analytics/segments
summary: "Save a useful set of filters and apply it without changing the date range."
---

# Save and reuse a segment

A segment is a named set of filters. Save one when you regularly ask the same question, such as how newsletter visits behave.

## Create and use a segment

1. Open **Filters** beside the dashboard date controls.
2. Add the source, country, page or other supported conditions. Check the resulting report before saving.
3. Choose **Save as segment**, enter a recognizable name and save.
4. Later, reopen Filters and select that segment. The current dates remain selected.

Use [Filter your data](../guides/filter-your-data.md) to see the controls. Remove an applied filter chip to broaden the report again; a filter's visible state matters more than the segment name.

## Event conditions

**Did an event** and **Did not do an event** select website sessions with or without the registered goal during the selected interval. Optional property conditions qualify that event. Conditions combine with AND; this is not a nested rules editor.

For example, select visits that did `signup` with `plan=pro`, then inspect their sources. Use the selected date range consistently. Unsupported app, imported-history or revenue populations can show unavailable results rather than a guessed count.

## Verify

Apply the segment to the same dates as the unsaved filter and check that the chips and results agree. If the result is empty, remove one condition at a time. A saved segment does not create missing historical properties or broaden the underlying collection.
