---
title: "OAuth client reference"
group: mcp
slug: mcp/oauth
summary: "Implement resource-bound OAuth sign-in, refresh and revocation for Jelto MCP."
---

# OAuth client reference

This reference is for developers building an MCP client. To connect an existing assistant, follow [MCP setup](setup.md); for sign-in problems, use [connection troubleshooting](best-practices-and-troubleshooting.md#connection-and-access-problems).

Use the origin from your Jelto MCP URL throughout discovery and authorization. Tokens issued for one origin cannot authenticate a different server.

| Endpoint | Purpose |
| --- | --- |
| `GET /.well-known/oauth-protected-resource/api/mcp` | Protected resource, authorization server and default read scopes |
| `GET /.well-known/oauth-authorization-server` | Supported authorization endpoints, scopes and client methods |
| `POST /oauth/register` | Compatibility dynamic client registration |
| `GET /oauth/authorize` | Begin browser consent |
| `POST /oauth/token` | Exchange a code or rotate a refresh token |
| `POST /oauth/revoke` | Revoke the connection associated with a token |

An unauthenticated MCP request returns `401` with a `WWW-Authenticate` header pointing to resource metadata. The transport is stateless; send Bearer authorization on each request. Browser cookies cannot authenticate MCP.

## Identify the client

You may use an HTTPS Client ID Metadata Document URL as `client_id`. Its JSON must contain the identical `client_id`, `client_name`, and `redirect_uris`; only public authentication (`token_endpoint_auth_method: "none"`) is supported for metadata documents. Host the document on a public HTTPS server on port 443. Redirects, private network destinations and documents larger than 32 KiB are rejected. Cache directives are honored with a five-minute maximum.

If the document declares `grant_types` or `response_types`, include `authorization_code` or `code`, respectively. It may advertise additional capabilities for other servers; Jelto still accepts only authorization-code and refresh-token requests.

Alternatively, register the client:

```http
POST /oauth/register
Content-Type: application/json

{
  "client_name": "My assistant",
  "redirect_uris": ["http://127.0.0.1:8765/callback"],
  "token_endpoint_auth_method": "none",
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"]
}
```

The response includes `client_id`. Confidential clients may register `client_secret_basic` or `client_secret_post`; their secret is returned once. Registrations expire after one year. Client names are displayed as unverified metadata on the consent page.

Registration ignores unrecognized metadata fields, including optional fields such as `software_version` and `contacts`. Known fields must have the correct types and supported values. Permissions are selected during authorization and consent; registration metadata does not grant access.

## Authorize and exchange

Generate a random PKCE verifier of 43–128 unreserved ASCII characters. Send its SHA-256 digest as an unpadded base64url `code_challenge`. Authorization requires these query parameters:

```text
response_type=code
client_id=YOUR_CLIENT_ID
redirect_uri=YOUR_EXACT_REGISTERED_CALLBACK
resource=https://YOUR_JELTO_HOST/api/mcp
code_challenge=YOUR_S256_CHALLENGE
code_challenge_method=S256
scope=products:read analytics:read
state=YOUR_RANDOM_STATE
```

Callbacks must match a registered HTTPS URL or HTTP loopback URL, with no fragment or embedded credentials. At authorization, HTTP callbacks on `localhost`, `127.0.0.1` or `[::1]` may use a different port; scheme, hostname, path and query must still match exactly. For example, Claude Code declares `http://localhost/callback` and may request `http://localhost:60965/callback`. HTTPS callbacks must match exactly, including the port. Use and verify `state`; verify the returned `iss` equals the discovered issuer. Consent expires in ten minutes and is bound to its initiating browser and signed-in account. Denial returns `error=access_denied` without a code.

Exchange the code within two minutes using form encoding at `/oauth/token`. Send `grant_type=authorization_code`, `client_id`, `code`, `code_verifier`, the same `redirect_uri` and `resource`. The token request must repeat the exact callback used at authorization, including its loopback port. A confidential client must also use its registered secret authentication method. The response contains `access_token`, `token_type: "Bearer"`, `expires_in`, `refresh_token` and the granted `scope`.

## Refresh and disconnect

Access tokens last up to one hour. Send `grant_type=refresh_token`, the current `refresh_token`, `client_id` and the exact `resource` to the token endpoint. Authenticate confidential clients as above. Store both returned tokens and discard the old refresh token. Serialize refresh requests: reusing a consumed code or refresh token revokes the entire connection. Retrying an ambiguous exchange may require reconnecting.

A refresh token lasts up to 30 days, capped by the connection's 90-day lifetime. Request fresh consent when the connection expires or is revoked. Omit `scope` during refresh, or repeat the exact granted set; widening or narrowing requires new consent.

To disconnect, send a form-encoded `token` with the client's authentication to `/oauth/revoke`, or revoke the app in **Account settings → API / MCP**. Unknown tokens return success without disclosing whether they existed. Revocation blocks new calls and refreshes; a running operation may finish. Data already received by a client stays with that client.

OAuth cannot grant `products:write`, `keys:*`, `tokens:*` or `account:read`. There are no wildcard permissions. OAuth access tokens work only at `/api/mcp`, while [account tokens](../api/account-tokens.md) can also use mapped REST routes. See [tools](tools.md) for exact scopes and confirmation behavior.

On `401`, reconnect if refreshing fails. Missing tool scopes return HTTP `403` with a `WWW-Authenticate` scope challenge for a new authorization flow. Role denials remain tool errors; granting more scopes cannot change a user's role. `429` responses include `Retry-After`. Report empty, withheld or unavailable analytics as returned, rather than treating them as zero.
