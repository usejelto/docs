---
title: "Create and manage API keys"
group: manage
slug: manage/api-keys
summary: "Grant a server only the product permissions it needs."
---

# Create and manage API keys

A website script uses a public product ID. Authenticated APIs use secret, product-scoped keys beginning with `jk_`. Keep those keys on your server.

## Create a key

1. Open **Settings → Developer → API keys**.
2. Choose **Create API key**, name its purpose and select only the required scopes.
3. Copy the full value when shown. Store it in your server's secret environment; it is shown once.
4. Verify the intended operation with the [Website API guide](../api/website.md).

| Scope | Purpose |
| --- | --- |
| `analytics:read` | Read analytics reports and health. |
| `funnels:read` | Read funnel definitions. |
| `funnels:write` | Create, edit and delete funnels. |
| `payments:write` | Submit verified custom payments and refunds. |
| `crawlers:write` | Send server crawler observations and connection checks. |

Do not put a key in website JavaScript, a distributed desktop app, an iframe embed or an AI-builder prompt. A `prd_` product ID cannot replace it for authenticated endpoints.

## Rotate or revoke

Create a replacement with the necessary scopes, update the server secret and verify it, then revoke the old key. Existing keys do not automatically acquire new scopes. Review integrations when a team member loses access: their issued keys can be revoked by the role change.

If a request is unauthorized, check the key's product, scope and revocation state before widening its permissions.

## Connect an assistant

Use [MCP](../mcp/introduction.md) for analytics and authorized product tools. A product key grants only that product's basic metadata, analytics and funnels. For selected products, OAuth sign-in avoids manual credential handling. Account tokens beginning with `jt_` can additionally authorize product creation and scoped credential management; create them in **Account settings → API / MCP**.
