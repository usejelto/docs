---
title: "Account tokens and REST"
group: api
slug: api/account-tokens
summary: "Use scoped account tokens for the REST operations available through MCP."
---

# Account tokens and REST

Create a `jt_` token in **Account settings → API / MCP**, then send it as `Authorization: Bearer` to a route in the [supported routes](#supported-rest-routes) below. Each route corresponds to an [MCP tool](../mcp/tools.md). The same scopes, selected products and current roles apply. All other REST operations reject an account token, even if a browser session accompanies it. Existing `jk_` [Website API](website.md) behavior is unchanged.

## Read analytics

Set `JELTO_TOKEN` privately, then replace the example product ID `prd_acmedemo01` and date range. Jelto's REST API uses `https://app.jelto.io`:

```sh
curl --fail-with-body --get 'https://app.jelto.io/api/v1/stats' \
  -H "Authorization: Bearer $JELTO_TOKEN" \
  --data-urlencode 'product=prd_acmedemo01' \
  --data-urlencode 'metric=visitors' \
  --data-urlencode 'from=2026-09-01' --data-urlencode 'to=2026-09-07'
```

Discover metrics and their supported dimensions/filters at `/api/v1/stats/catalog?product=prd_acmedemo01`, using your product ID. Dates use the product timezone unless `tz` is specified. REST responses retain their usual envelopes, units, retention and suppression states.

## Preview and confirm a write

For `jt_` requests, omitting the confirmation headers returns a preview without making a change. For example, a token with `settings:write` may preview a rename:

```sh
curl --fail-with-body -X PATCH \
  'https://app.jelto.io/api/v1/products/prd_acmedemo01' \
  -H "Authorization: Bearer $JELTO_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"My product"}'
```

After approving the preview, repeat the identical request with these headers:

```http
Jelto-Confirm: true
Idempotency-Key: rename-product-20260909-001
```

Generate a unique key for each intended change. Identical retries share the recorded result for 24 hours. Reusing a key with different arguments returns `409 idempotency_conflict`. `409 outcome_unknown` means the result cannot be confirmed: inspect the affected resource before deciding on another action. Do not automatically replace the key and retry, because the change may already have happened. Quota, revision and other current-state checks run when executing.

Completed retry records expire after 24 hours; an old key no longer guarantees protection from a duplicate write. Unresolved outcomes remain blocked for their key and require investigation. See [MCP write troubleshooting](../mcp/best-practices-and-troubleshooting.md#write-problems).

Credentials are returned only on the initial successful creation. A matching retry includes metadata and `secret_returned_once`, without the secret. If that value was lost, revoke the credential and create a replacement.

## Delegate credentials

`tokens:write` can create tokens with no more scope or product access than the caller. `tokens:read` lists the caller and its descendants. A token cannot inspect or revoke an unrelated sibling or broader ancestor. Delegation is limited to eight levels. Product-key creation also requires every requested analytics/funnel scope on the account token; it cannot issue payment or crawler intake keys.

Changing a parent's permissions, replacing it or revoking it disables its delegated credentials. **All accessible products** includes future accessible products and is required for `products:write`. OAuth always uses explicit product selection and cannot administer credentials.

Token editing and replacement, OAuth connection management, billing changes, provider connections, deletion and raw exports use the dashboard. Token create/list/revoke are the only token-management actions exposed through machine access.

## Supported REST routes

Only these methods and paths accept account tokens. The [tool reference](../mcp/tools.md#available-tools) lists their required scopes and role restrictions. For stats, crawler reports, the catalog and integration status, pass `product` as a query parameter; other product routes include it in the path.

| MCP tool | REST method and route |
| --- | --- |
| `jelto_products_list` | `GET /api/v1/products` |
| `jelto_products_get` | `GET /api/v1/products/{product}` |
| `jelto_products_create` | `POST /api/v1/products` |
| `jelto_products_update` | `PATCH /api/v1/products/{product}` |
| `jelto_analytics_catalog` | `GET /api/v1/stats/catalog` |
| `jelto_analytics_query` | `GET /api/v1/stats` |
| `jelto_analytics_realtime` | `GET /api/v1/stats/realtime` |
| `jelto_analytics_goals` | `GET /api/v1/stats/goals` |
| `jelto_analytics_search_console` | `GET /api/v1/stats/search-console` |
| `jelto_analytics_crawlers` | `GET /api/v1/crawls` |
| `jelto_diagnostics_health` | `GET /api/v1/stats/health` |
| `jelto_diagnostics_onboarding` | `GET /api/v1/products/{product}/onboarding` |
| `jelto_diagnostics_installation` | `GET /api/v1/products/{product}/installation` |
| `jelto_diagnostics_proxy` | `GET /api/v1/products/{product}/proxy/diagnostics` |
| `jelto_diagnostics_annotations` | `GET /api/v1/products/{product}/annotations` |
| `jelto_diagnostics_integrations` | `GET /api/v1/mcp/integrations` |
| `jelto_domains_get` | `GET /api/v1/products/{product}/domains` |
| `jelto_domains_update` | `PUT /api/v1/products/{product}/domains` |
| `jelto_apps_get` | `GET /api/v1/products/{product}/apps` |
| `jelto_apps_create` | `POST /api/v1/products/{product}/apps` |
| `jelto_events_get` | `GET /api/v1/products/{product}/events` |
| `jelto_events_update` | `PUT /api/v1/products/{product}/events` |
| `jelto_preferences_get` | `GET /api/v1/products/{product}/preferences` |
| `jelto_preferences_update` | `PATCH /api/v1/products/{product}/preferences` |
| `jelto_shields_get` | `GET /api/v1/products/{product}/shields` |
| `jelto_shields_update` | `PUT /api/v1/products/{product}/shields` |
| `jelto_crawlers_get` | `GET /api/v1/products/{product}/crawlers` |
| `jelto_crawlers_update` | `PATCH /api/v1/products/{product}/crawlers` |
| `jelto_funnels_list` | `GET /api/v1/products/{product}/funnels` |
| `jelto_funnels_create` | `POST /api/v1/products/{product}/funnels` |
| `jelto_funnels_update` | `PUT /api/v1/products/{product}/funnels/{funnel_id}` |
| `jelto_funnels_delete` | `DELETE /api/v1/products/{product}/funnels/{funnel_id}` |
| `jelto_team_list` | `GET /api/v1/products/{product}/members` |
| `jelto_team_invite` | `POST /api/v1/products/{product}/members` |
| `jelto_team_update` | `PATCH /api/v1/products/{product}/members/{member}` |
| `jelto_team_remove` | `DELETE /api/v1/products/{product}/members/{member}` |
| `jelto_keys_list` | `GET /api/v1/products/{product}/keys` |
| `jelto_keys_create` | `POST /api/v1/products/{product}/keys` |
| `jelto_keys_revoke` | `DELETE /api/v1/products/{product}/keys/{key_id}` |
| `jelto_account_get` | `GET /api/v1/mcp/account` |
| `jelto_tokens_list` | `GET /api/v1/access-tokens` |
| `jelto_tokens_create` | `POST /api/v1/access-tokens` |
| `jelto_tokens_revoke` | `DELETE /api/v1/access-tokens/{token_id}` |
