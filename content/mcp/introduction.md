---
title: "Jelto MCP"
group: mcp
slug: mcp/introduction
summary: "Explore your analytics and manage products from an AI assistant."
---

# Jelto MCP

Connect your AI assistant to Jelto to ask questions about traffic, investigate setup problems, and make product changes you approve. MCP, the Model Context Protocol, lets the assistant call Jelto tools and use their results in your conversation.

Jelto provides a remote MCP server. Copy the **MCP server URL** from **Account settings → API / MCP**. The connection uses Streamable HTTP and the URL ends in `/api/mcp`.

## What you can do

- **Explore analytics.** Compare periods, break down traffic sources, inspect goals and funnels, and read available revenue, app, search and crawler reports.
- **Check your setup.** Inspect installation, collection health, custom tracking domains and integration status.
- **Manage product settings.** Update product details, allowed domains, event definitions, preferences, shields and crawler settings.
- **Work with your team.** As an Owner, review members and preview invitations or access changes.
- **Manage machine access.** With an account token, create products and issue or revoke narrower credentials.

The [tool reference](tools.md) covers all 43 tools and their permissions. Available data depends on the product's setup, your role and your plan, just as it does in the dashboard.

## Choose the access you need

| Connection | Product access | Use it for |
| --- | --- | --- |
| OAuth | Products you explicitly approve | Connecting an assistant through browser sign-in. Analytics, diagnostics, settings, funnels and team tools are available with the relevant permissions. |
| Account token (`jt_`) | Selected products, or **All accessible products**, including future ones | Clients with a Bearer-token setting, selected REST operations, product creation and scoped credential management. |
| Product key (`jk_`) | One product | Basic product metadata, analytics and funnels within the key's scopes. |

Scopes describe what the connection may do. Product selection describes where it may act. Your current role still limits both. A broader token cannot make a Viewer an Owner.

## Connect with OAuth

Add the server URL in your assistant, then sign in to Jelto and review the consent page. You choose the products and permissions; future products are never included automatically. This is the simplest starting point for an interactive assistant. Follow [MCP setup](setup.md) for your client.

## Connect with a token

Create an account token in **API / MCP**, or use a [product API key](../manage/api-keys.md). Start with read access and store the value in the client's credential settings. See [token setup](setup.md#use-a-token-instead-of-oauth) for configuration examples.

## Try your first question

After connecting, ask:

```text
List the Jelto products I can access, including their IDs and timezones. Ask me which product to use before querying its analytics.
```

Then try a [weekly traffic summary, installation check or funnel review](usage-examples.md). The assistant can discover the metrics and dimensions before choosing a query.

## Stay in control

Read tools fetch information. Write tools return a preview until the client supplies confirmation and a retry key. Ask the assistant to show the target and proposed change before you approve it. This relies on the client's approval behavior; the confirmation field alone does not prove a human reviewed the change.

Product and account deletion, deletion cancellation, raw exports, billing changes, provider connections and platform administration remain dashboard actions. MCP reports aggregates; it cannot reconstruct an individual journey between a website and an app.

Review or revoke access in **Account settings → API / MCP**. For practical guidance, continue to [best practices and troubleshooting](best-practices-and-troubleshooting.md). If you are building a client, use the [OAuth reference](oauth.md) or [account-token REST guide](../api/account-tokens.md).
