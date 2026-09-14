---
title: "MCP usage examples"
group: mcp
slug: mcp/usage-examples
summary: "Copy prompts for traffic analysis, setup checks, funnels and approved changes."
---

# MCP usage examples

After [connecting your assistant](setup.md), start with a product and a specific question. The examples below use `prd_acmedemo01` as a placeholder; replace it with an ID returned by `jelto_products_list`. Adjust the sample dates to a period with data in your product.

Scope names below apply to OAuth and account tokens. Product keys have the narrower access described in the [tool reference](tools.md). Your role and the product's available data still apply.

## Find the right product

Read · `products:read` and `analytics:read`.

```text
List my Jelto products with their IDs and reporting timezones. Ask which product I want to analyze, then discover its metrics, dimensions and filters. Keep this session read-only unless I explicitly approve a change.
```

The assistant should call `jelto_products_list`, then `jelto_analytics_catalog`. Product names can be similar; use the returned ID for later calls. A metric in the catalog may still be unavailable for a product without that data source.

## Summarize the last complete week

Read · `products:read` and `analytics:read`.

```text
For prd_acmedemo01, summarize website visitors, visits and pageviews for the last seven complete days, compared with the previous seven. Use the product's timezone, show the exact dates, and explain any unavailable or withheld values.
```

Use `jelto_products_get` for the timezone and `jelto_analytics_query` for each metric. To break visitors down by source, that tool accepts:

```json
{
  "product": "prd_acmedemo01",
  "query": {
    "metric": "visitors",
    "dimension": "source",
    "surface": "web",
    "from": "2026-09-01",
    "to": "2026-09-07",
    "compare": "previous",
    "limit": 10
  }
}
```

Keep the comparison window, filters and units alongside the answer. See [how to read your dashboard](../guides/read-your-dashboard.md) for the same reporting concepts.

## Explore sources and goals

Read · `analytics:read`.

```text
For prd_acmedemo01, list website goals for September 1–7, 2026. Ask me to choose a goal, then compare its results by traffic source for that period. Explain the difference between unique visitors and total goal completions.
```

Use `jelto_analytics_goals` with `query.surface` set to `web`, plus `from` and `to`. Use a returned event name for the goal metric; do not invent one from a display label. Ask for `goal:<event>` or `goal_completions:<event>` as appropriate to the question. [Goal and funnel reports](../guides/explore-goals-and-funnels.md) explain the distinction.

## Investigate missing data

Read · `settings:read` with a Member or Owner role.

```text
Check installation, collection health and onboarding diagnostics for prd_acmedemo01. Separate checks that passed, checks that failed, and checks that could not run. Explain the next action for each issue without changing settings.
```

The relevant tools are `jelto_diagnostics_installation`, `jelto_diagnostics_health` and `jelto_diagnostics_onboarding`. If a custom tracking domain is involved, also inspect `jelto_diagnostics_proxy`. A status check does not install the snippet, change DNS or connect a provider. Follow the [no-data guide](../troubleshooting/no-data.md) for those next steps.

## Review app usage after a release

Read · `analytics:read`.

```text
For prd_acmedemo01, inspect the app metrics available in the catalog. Summarize installs, active installs and app-version adoption for the last seven complete days. State the units and any retention or coverage limits.
```

Use supported app metrics and dimensions from `jelto_analytics_catalog`. Ask separate questions about website traffic and app activity; their aggregates do not identify the same individuals. See [app usage](../guides/understand-app-usage.md) before interpreting an install count as a person count.

## Check search and crawler activity

Read · `analytics:read`; add `settings:read` for integration status.

```text
For prd_acmedemo01, summarize the available Search Console and crawler reports for September 1–7, 2026. Keep search performance, crawler requests and human website visits separate. Tell me if a required connection is missing.
```

Use `jelto_analytics_search_console` and `jelto_analytics_crawlers`; `jelto_diagnostics_integrations` can clarify connection status for Members and Owners. Missing integration data is not evidence of zero search traffic or zero visits.

## Review a saved funnel

Read · `funnels:read` and `analytics:read`.

```text
List the saved funnels for prd_acmedemo01 and ask me to choose one. Show its steps and results for September 1–7, 2026, including where completion falls. Explain the counting method and any unavailable step results.
```

Use `jelto_funnels_list`, then query `funnel:<id>` with the selected funnel's returned ID. Use `funnel_step` for a step breakdown and the comma-separated `companions` value `funnel_first:<id>,funnel_prev:<id>` for rates. Inspect the saved surface: website funnel queries omit `surface`, while app funnel queries require `surface: "app"` inside `query`.

A website funnel follows one visit. An app funnel follows an install, with entry dates selected by the range and later steps counted through the last completed day in the reporting timezone. See [website examples](../goals/funnel-examples.md) or the [app funnel example and query](../app/funnels.md#query-through-an-ai-assistant).

## Preview a product rename

Write · `settings:write` with a Member or Owner role; `products:read` to read back the name.

```text
Preview renaming prd_acmedemo01 to "Acme website". Show me the product ID and proposed name, and wait for my approval before applying the change. After applying it, read the product back to verify the name.
```

The assistant first calls `jelto_products_update` with:

```json
{
  "product": "prd_acmedemo01",
  "body": { "name": "Acme website" }
}
```

This returns a preview without saving the name. After approval, the same tool call includes confirmation and a unique retry key:

```json
{
  "product": "prd_acmedemo01",
  "body": { "name": "Acme website" },
  "confirm": true,
  "idempotency_key": "rename-acme-20260909-001"
}
```

Use a new key for each new intended change, and keep the same key for identical retries. The [write and retry rules](tools.md#write-previews-and-retries) explain uncertain outcomes and conflicts.

## Preview a new website funnel

Write · `funnels:read` and `funnels:write` with a Member or Owner role.

```text
List the existing funnels for prd_acmedemo01, then preview a funnel named "Pricing to signup" with exact page steps /pricing and /signup. Check for an existing equivalent funnel and wait for my approval before creating one.
```

Use `jelto_funnels_list` before `jelto_funnels_create`. Add `analytics:read` if you also want to query the saved funnel. A sequence of writes is not one transaction: review and confirm each change separately.

## Preview a new app funnel

Write · `funnels:read` and `funnels:write` with a Member or Owner role. Add `analytics:read` to discover app goals and report the saved funnel.

```text
For prd_acmedemo01, inspect the observed app goals and existing funnels. Preview an app funnel named "Onboarding to upgrade" with exact goal steps onboarding:complete and upgrade_click. Keep an existing equivalent definition if one is already saved. Show the surface and ordered steps, explain how entry dates and later conversions are counted, and wait for my approval before saving.
```

After checking for an equivalent definition with `jelto_funnels_list`, preview with `jelto_funnels_create`:

```json
{
  "product": "prd_acmedemo01",
  "body": {
    "name": "Onboarding to upgrade",
    "surface": "app",
    "steps": [
      { "kind": "goal", "value": "onboarding:complete", "match": "equals" },
      { "kind": "goal", "value": "upgrade_click", "match": "equals" }
    ]
  },
  "confirm": false
}
```

The preview should show `surface: "app"` in `data.change`; it does not save a definition. After approval, repeat the same call with `confirm: true` and a unique `idempotency_key`, following the [write and retry rules](tools.md#write-previews-and-retries). Read back the saved definition, then use its returned ID with `surface: "app"` for analytics queries.

This funnel measures an upgrade click after onboarding completion. An onboarding event matches regardless of `ok`, `fail` or `skip`, and an upgrade click does not prove payment. See [Create an app funnel](../app/funnels.md) for a longer onboarding journey.

## Preview a team invitation

Write · `team:read` and `team:write`, with an Owner role.

```text
Review the members of prd_acmedemo01, then preview inviting alex@example.com as a Viewer. Show the address and role, explain that the invitation sends an email, and wait for my approval before sending it.
```

Replace the example address with the intended recipient. Use `jelto_team_list` and `jelto_team_invite`. An invitation does not become accepted membership until the recipient completes the sign-in flow. See [team access](../manage/team.md).

## Preview a new product

Write · account token only, with `products:write` and **All accessible products**.

```text
Preview creating a Jelto product named "Acme docs" for docs.example.com, using UTC as its reporting timezone. Show the proposed details and wait for approval before creating it.
```

Replace the example domain with your own. This uses `jelto_products_create`; OAuth and product keys cannot create products. Creating a product does not install tracking on the website. Continue with [installation](../start/quickstart.md) afterward.

For every workflow, ask the assistant to report tool errors and missing data directly. Follow [best practices and troubleshooting](best-practices-and-troubleshooting.md) if its results differ from the dashboard.
