---
title: "Track forms and visible sections"
group: goals
slug: goals/forms-and-visibility
summary: "Use explicit form-submit and visibility goals with the optional goals helper."
---

# Track forms and visible sections

Use form goals to count validated browser submissions, or visibility goals to learn whether a section was seen. These are different from a completed server action.

## Install the helper

Keep your existing core tracker. Add this second tag immediately after it, using the same script host as your installation:

```html
<script defer src="https://app.jelto.io/jelto.goals.js"></script>
```

The example uses Jelto's standard script host. If you use a custom tracking domain, load `/jelto.goals.js` from that same domain. Both tags must execute in order; keep `defer` and do not add `async`.

## Track a form submission

1. Choose `contact_submitted` and its optional `form` property. No registration is required.
2. Add attributes to the form itself:

```html
<form action="/contact" method="post"
      data-jelto-event="contact_submitted"
      data-jelto-event-form="contact">
  <!-- Your existing fields and submit button -->
</form>
```

3. Publish, complete the required fields and submit. An invalid form should not produce this event.

The event means browser validation passed and a submit event occurred. It does **not** mean your server accepted the message. The helper reads declared attributes, not field contents or FormData. If your app handles submission with JavaScript, put a [manual event](create-goal.md#send-it-after-the-action-succeeds) in the confirmed-success handler instead.

## Track a visible section

To send `pricing_seen`, add:

```html
<section data-jelto-visible="pricing_seen"
         data-jelto-visible-threshold="0.5"
         data-jelto-visible-delay="1000">
  <!-- Your pricing content -->
</section>
```

Here, at least half the element must stay visible for one second. The default threshold is `0.5`; the default delay is `0` milliseconds, with a maximum of `60000`. It fires once per element per accepted pageview while the document is visible.

A visibility event is passive: it does not turn a bounce into an engaged visit. Avoid placing it on an element taller than the viewport when the chosen visible fraction cannot be reached.

## Verify

Visit the page, scroll the section into view and keep it there for the delay. Find the event in Goals. If nothing arrives, verify the core tracker first, then helper order, event spelling, element height and page exclusions.
