---
title: "Track clicks with HTML attributes"
group: goals
slug: goals/html-events
summary: "Attach a registered event to an obvious button or link without adding a click handler."
---

# Track clicks with HTML attributes

Use HTML attributes when the action you want to count is a click. For a confirmed signup or purchase, track the confirmed outcome in your application instead.

## Add the event

1. [Register](create-goal.md) `pricing_clicked` with an allowed `location` property.
2. Find the actual link or button in your website's template or component.
3. Add the event attributes and publish.

```html
<a href="/pricing"
   data-jelto-event="pricing_clicked"
   data-jelto-event-location="header">See pricing</a>
```

The core website script handles the click. Custom properties are literal values declared with `data-jelto-event-KEY`; the tracker does not need to read form fields or personal data.

## Verify

Open the published page and click the link. Find `pricing_clicked` in Goals, then check its `location` breakdown. Register the property before testing and allow up to one minute after saving.

## Avoid double counting

Choose one way to report the click: an HTML attribute or a JavaScript handler. A link to a supported download can already produce a download event, so create an additional custom goal only when it answers a different question.

For a form, put the attribute on the `<form>` and install the optional helper described in [Forms and visibility](forms-and-visibility.md). A submit-button click can happen even when the browser rejects the form, so it is not a reliable successful-submission goal.
