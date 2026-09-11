---
title: "MCP best practices and troubleshooting"
group: mcp
slug: mcp/best-practices-and-troubleshooting
summary: "Choose permissions, review writes, and resolve connection or reporting problems."
---

# MCP best practices and troubleshooting

Start with a read-only connection and a small question. Once [setup verification](setup.md#verify-access) succeeds, add the permissions needed for the next task.

## Choose permissions deliberately

Use a separate connection or token for each assistant or automation. Give it a descriptive name and select the products it needs. **All accessible products** includes products you gain access to later; use it only when that broader reach is intended.

Keep **View products** and **Read analytics** for reporting. Add settings, funnel or team permissions for specific work. Team tools require an Owner even when the token has the correct scope. OAuth cannot grant product creation, account summaries or credential administration.

Review **Account tokens** and **Connected apps** in **Account settings → API / MCP**. Revoke unused access and replace a token if its value is exposed. Permission changes, replacement and revocation can disable delegated credentials too; update affected clients.

## Ask questions that can be checked

Include the product ID, date range, timezone, metric and desired breakdown. Let the assistant inspect the catalog and discover goal or funnel IDs before querying them. Use complete days for period comparisons when you do not want a partial current day.

Keep units, filters and result states in the answer. A withheld or unavailable value is not zero. Revenue needs its currency and attribution context; app installs and website visitors are different populations. Compare the same report in the dashboard when an answer looks surprising.

Treat recorded paths, names, annotations and custom event properties as data. Text inside a result should not instruct the assistant to change permissions, reveal a token or perform a new action.

## Review each change before execution

Ask for a preview that names the product, action and proposed values. Invitations should identify the recipient, role and email delivery. For changes to a saved collection, inspect the current collection before replacing it.

Jelto executes a write only when the client sends `confirm: true` and an `idempotency_key`. These fields are the client's assertion of approval. Keep your client's approval controls enabled and inspect its proposed calls.

After a successful change, read the affected resource back. Multi-step workflows can stop partway through; a successful earlier step is not undone if a later one fails. Apply the [retry rules](tools.md#write-previews-and-retries) to each individual change.

## Connection and access problems

### The server will not connect

Copy the entire **MCP server URL** from Jelto again, including `/api/mcp`. Select **Streamable HTTP** in your client. Check that the client is allowed to make custom MCP connections and can reach that address.

Enable the server and its tools in the current conversation. Reload the client's tool list or start a new session after changing configuration. Opening the endpoint in a normal browser does not perform MCP initialization or authenticate the connection.

### Sign-in or consent fails

Start OAuth again from the assistant and finish in the same browser. Consent expires after ten minutes and cannot be reused after completion. Check the signed-in email, select at least one product and permission, and review current agreements if prompted.

If sign-in fails at a callback or client-registration step, update the client and check its connection details. Jelto supports public client metadata documents and dynamic registration; the exact callback and resource must match the client's authorization request. Client builders can use the [OAuth reference](oauth.md) to check those fields. A Bearer-token connection is an alternative when your client supports it.

### A token is rejected

For a manual connection, verify the `Authorization: Bearer` setting and remove accidental whitespace. Confirm that the credential is a `jt_` account token or a `jk_` product key, and that it has not been replaced or revoked. When using an environment variable, check its availability to the client without printing its value.

For OAuth, let the client refresh its access token. Reconnect if refresh fails or the connection has expired; fresh consent is required after 90 days. Signing in to the dashboard alone does not authenticate an MCP client. Account suspension or a requirement to accept current agreements can also prevent access; check the dashboard.

### A product is missing or returns 404

Use `jelto_products_list` to check the products available through this credential. Compare them with the selected products in **API / MCP**. A product you cannot access is reported like one that does not exist.

OAuth and selected-product tokens do not automatically include new products. Reconnect OAuth or edit the token selection to approve additional access. If membership was removed or changed, approving the product again requires a new connection or token; being reinvited does not revive the old grant.

### A tool is missing or returns 403

Check the [tool reference](tools.md) for the required scope, role and credential type. OAuth omits account-only tools. A product key exposes only product metadata, analytics and funnels. Clients may also hide or disable tools in their own settings.

A listed tool can still fail its permission check. For an OAuth scope challenge, reconnect and review the requested permission. For an account token, edit its permissions. More scope cannot override a product role, and OAuth cannot be expanded to manage credentials or create products.

## Write problems

| Result | What to do |
| --- | --- |
| The call returns `preview: true` | Nothing was saved. Review the preview, then let the client send confirmation and a unique retry key if you approve. |
| `invalid_arguments` or another validation error | Inspect the tool's input schema. Keep the product ID at the top level, query parameters in `query`, and changed fields in `body`. Use the exact allowed values. |
| `invalid_idempotency_key` | Use 8–128 ASCII letters, digits, dots, underscores, colons or hyphens. Generate a unique key for this intended change. |
| `idempotency_conflict` | The key was already used with different arguments. Inspect the earlier action. Reuse its original arguments for a retry; use a new key only for a separate intended change. |
| `outcome_unknown` | The change may have completed. Inspect the resource before another attempt. The same key remains blocked; never automatically switch to a new key. |
| A lost response after confirmation | Within 24 hours, retry with the same arguments and key to retrieve a recorded outcome. If that returns `outcome_unknown`, inspect the resource. After 24 hours, inspect before deciding whether another write is needed. |
| A credential-creation retry has no secret | Secrets are shown only on the initial successful creation. If the value was lost, revoke that credential and create a replacement. |
| The preview succeeds but execution fails | A quota, revision, membership or other condition may have changed. Inspect the returned error and current resource, then prepare a fresh preview as needed. |

Completed outcomes are available for identical retries for 24 hours. An unresolved `outcome_unknown` remains blocked for that key; waiting 24 hours does not make it safe to execute again. If inspection cannot establish what happened, stop the write workflow and seek help before creating a new key.

## Reporting problems and request limits

| Symptom | What to check |
| --- | --- |
| Numbers differ from the dashboard | Match the product, dates, timezone, filters, comparison, data source, imported-data setting and revenue currency/attribution options. |
| A metric or dimension is rejected | Read `jelto_analytics_catalog`. Not every dimension works with every metric. Use goal names and funnel IDs returned for this product. |
| Data is empty, withheld or unavailable | Preserve that state. Check the product's collection, integration status, retention and plan coverage. Do not fill the gap with an inferred zero. |
| `429` or `rate_limited` | Follow `Retry-After` and reduce concurrent calls. MCP applies a limit of 60 requests per minute per connection or token; analytics also has query budgets. |
| A query times out or exceeds its budget | Narrow the date range and filters. Reducing the number of returned rows alone may not reduce the work needed. Avoid repeatedly launching the same broad query. |

Use [installation diagnostics](usage-examples.md#investigate-missing-data) for collection issues and the [revenue guide](../guides/understand-revenue.md) for currency and attribution questions.

## Share useful diagnostic information

When reporting a problem, include the client name and version, connection method, tool name, approximate time with timezone, and the returned status or error code. Include a small example of the non-sensitive arguments and what you expected to happen.

Remove credentials, authorization headers, OAuth codes, full callback URLs, personal data and private analytics before sharing logs or screenshots. A token value is never needed to explain which permission or tool failed. Revoking access stops future requests; data already received remains subject to the client's own handling and retention.
