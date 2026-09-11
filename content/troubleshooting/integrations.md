---
title: "An integration will not connect"
group: troubleshooting
slug: troubleshooting/integrations
summary: "Resolve unavailable connections, authorization, scope and sync issues."
---

# An integration will not connect

Read the connection status before replacing credentials. Not configured, connected, syncing and receiving live data describe different states.

| Symptom | Next check |
| --- | --- |
| Not configured or connection unavailable | Contact the Jelto team. Customer credentials cannot enable a service that is unavailable in Jelto. |
| Credential rejected | Check provider, environment, expiry and the exact permissions in that provider's guide. |
| Account or product missing | Check the selected merchant/store/organization and what the credential can access. |
| Search Console property missing | Check Google account authorization and matching registered hostname. |
| GitHub repository missing | Check the App installation's account, repository selection and organization approval. |
| Connected with no data | Check sync freshness, import coverage, dates and actual provider activity. |
| Payments present but attribution absent | Check checkout metadata and return-page setup separately. |

Use Test credentials with Test checkout and the helper's test environment. Live and test do not merge. Repeatedly reconnecting can obscure the original issue; use the available sync/retry action for a recoverable sync failure.

A configured webhook does not prove a real receipt was delivered. A completed history import does not prove attribution. Verify each step using [Revenue setup](../payments/connect.md).

See [Search Console](../integrations/search-console.md), [GitHub](../integrations/github.md) and [custom tracking domain](../integrations/tracking-domain.md) for focused checks. Share only safe status text when asking for help, never keys or authorization codes.
