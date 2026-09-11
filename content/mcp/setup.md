---
title: "MCP setup"
group: mcp
slug: mcp/setup
summary: "Connect Codex, Claude, Cursor, VS Code or another remote MCP client."
---

# MCP setup

Use OAuth to sign in from your assistant and select the products it can access. If your client needs a manually configured Bearer token, use an account token or product key instead.

## Before you start

You need a Jelto account with access to a product, and a client that supports remote MCP over **Streamable HTTP**. Your organization's client settings must allow custom MCP connections.

Open **Account settings → API / MCP** in Jelto and copy **MCP server URL**. Replace `https://YOUR_JELTO_HOST/api/mcp` in the examples with that entire URL. No local Jelto server or package installation is needed.

These examples follow the clients' documented configuration formats. Client versions and organization policies can affect sign-in and tool availability. The verification step below confirms access in your own client.

## Connect your client

Choose your client, then [review the Jelto consent page](#approve-the-connection).

### Codex

Run these commands in your terminal:

```sh
codex mcp add jelto --url https://YOUR_JELTO_HOST/api/mcp
codex mcp login jelto
```

Complete browser sign-in, then use `codex mcp list` to check the configuration. In a Codex conversation, `/mcp` shows active servers. If you configure the server through an MCP settings screen, use the same URL and choose Streamable HTTP. See the [official OpenAI MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli) for client settings and authentication options.

### Claude Code

Run this command in your terminal:

```sh
claude mcp add --transport http jelto https://YOUR_JELTO_HOST/api/mcp
```

Open Claude Code, enter `/mcp`, select Jelto and follow the authentication prompt. The default configuration applies to your current project. See [Claude Code's MCP documentation](https://code.claude.com/docs/en/mcp) for configuration scopes and connection management.

### Claude web and desktop

In **Customize → Connectors**, choose **Add custom connector**, name it **Jelto**, and enter the MCP server URL. Add the connector, then connect and complete browser sign-in. Enable it for the conversation where you want to use Jelto.

On a Team or Enterprise account, an organization Owner adds the connector first; each person then connects with their own Jelto account. Follow [Claude's custom connector instructions](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) for the current controls and availability.

### Cursor

Add this entry to `~/.cursor/mcp.json` for personal use, or merge it into `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "jelto": {
      "url": "https://YOUR_JELTO_HOST/api/mcp"
    }
  }
}
```

Enable Jelto in Cursor's MCP controls and complete OAuth when prompted. Preserve any other servers already in the file. See [Cursor's MCP documentation](https://cursor.com/docs/mcp) for configuration locations and authentication.

### VS Code with Copilot

Run **MCP: Add Server** from the Command Palette, choose an HTTP server and enter the URL. Or merge this entry into your project's `.vscode/mcp.json`:

```json
{
  "servers": {
    "jelto": {
      "type": "http",
      "url": "https://YOUR_JELTO_HOST/api/mcp"
    }
  }
}
```

Start the server, complete the connection prompts, and enable Jelto's tools for your chat. **MCP: Open User Configuration** provides a personal configuration shared across workspaces. See [VS Code's MCP setup guide](https://code.visualstudio.com/docs/agent-customization/mcp-servers) for current options.

### Another MCP client

Add a remote server named **Jelto**, choose **Streamable HTTP**, paste the URL and start OAuth. A browser visit to `/api/mcp` is not a connection test: use the client's MCP connection flow.

If you are writing a client, the [OAuth reference](oauth.md) covers discovery, registration, callback validation and token refresh. A client that cannot complete this flow may support the token setup below.

## Approve the connection

1. Sign in to Jelto in the browser opened by your assistant. Review any current agreements if prompted.
2. On **Connect to Jelto**, check the signed-in email and the requesting app's identity. The app's displayed name is supplied by its developer and is not verified by Jelto.
3. Select the products to share. None are selected automatically, and future products are excluded.
4. Review **Permissions**. Begin with **View products** and **Read analytics**. Team information and writes require explicit selection; permissions your client has not requested will not appear.
5. Choose **Allow access**, return to your assistant and run the verification prompt below.

Choose **Deny** to stop. A consent request expires after ten minutes and must be completed in the browser that started it. Start a new connection attempt if it expires.

## Use a token instead of OAuth

An account token can cover selected products and the additional account operations listed in the [access comparison](introduction.md#choose-the-access-you-need).

1. In **Account settings → API / MCP**, find **Create an account token**.
2. Enter a **Token name**, such as `Cursor reporting`, and select products. Leave **All accessible products** off unless the workflow needs future products or product creation.
3. Keep **View products** and **Read analytics** for reporting, adding only the permissions the workflow needs.
4. Select **Create token**, copy the `jt_` value into your client's credential store, and choose **I’ve saved it**. The full value is shown once.

For a single product, you can instead create a `jk_` key in **Settings → Developer**. See [product API keys](../manage/api-keys.md) for its analytics and funnel scopes. Ingestion identifiers and payment-provider secrets are not MCP credentials.

Use the token as an `Authorization: Bearer` header. Keep it out of source control and chat messages. If you use an environment variable, make sure it is available to the process running your client; a desktop app may not inherit variables from your terminal.

For Codex, set `JELTO_TOKEN` privately, then add a token connection with:

```sh
codex mcp add jelto-token --url https://YOUR_JELTO_HOST/api/mcp --bearer-token-env-var JELTO_TOKEN
```

This uses a separate name so it does not overwrite an existing OAuth entry. Enable only the connection you intend to use. Codex also supports the `bearer_token_env_var` configuration field, as described in the [OpenAI MCP reference](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

For Cursor, add `headers` to the server entry:

```json
{
  "mcpServers": {
    "jelto": {
      "url": "https://YOUR_JELTO_HOST/api/mcp",
      "headers": {
        "Authorization": "Bearer ${env:JELTO_TOKEN}"
      }
    }
  }
}
```

`${env:JELTO_TOKEN}` is [Cursor's environment-variable syntax](https://cursor.com/docs/mcp#config-interpolation). Other clients may use a different syntax or a dedicated credential field. Do not paste this configuration into an unrelated client without adapting it.

## Verify access

Ask your assistant:

```text
Use jelto_products_list to show my available product names, IDs and timezones. Ask me to choose a product, then use jelto_analytics_catalog to show its available metrics. Do not make any changes.
```

A working connection returns the products allowed by your grant and the selected product's metric catalog. A tool appearing in the client does not guarantee permission to call it. Check the returned result, then try a [usage example](usage-examples.md).

If products are missing or a call fails, follow [connection troubleshooting](best-practices-and-troubleshooting.md#connection-and-access-problems).

## Change or remove access

In **API / MCP**, review **Account tokens** or **Connected apps**, including the products, permissions and last-used time.

- For OAuth, reconnect to approve different products or permissions. Connections require fresh consent after 90 days. Revoke the old connection if you no longer need it.
- For an account token, **Edit permissions** changes its access. **Replace token** immediately disables the old value and issues a new one; update the client before using it again. Account tokens have no automatic expiry.
- **Revoke access** disables the selected connection or token. Changing a token's permissions, replacing it or revoking it also disables credentials delegated from it.

Revoking access prevents new calls. A request already running may finish, and revocation cannot remove data the client has already received.
