---
title: "Custom tracking domain with a Caddy-hosted website"
group: integrations
slug: subdomain/caddy
summary: "Connect a managed tracking subdomain while keeping your existing website host."
---

# Custom tracking domain with a Caddy-hosted website

Use Jelto's managed tracking domain with a Caddy-hosted website. You need permission to edit your domain's DNS records.

## Set up the record

1. In Jelto, open **Settings → Installation → Custom tracking domain**, save an unused hostname such as `analytics.example.com`, and copy its CNAME target.
2. At your authoritative DNS provider, add a CNAME for the new tracking subdomain pointing to the target displayed in Jelto. Keep your website's existing Caddy host configuration.
3. Wait for the change to be visible, then run the DNS/TLS check in Jelto.
4. Copy the updated installation tag, publish it on your website and [verify traffic](../start/verify.md).

## Keep the boundaries clear

This managed setup does not need a Caddy reverse proxy to Jelto, a local Jelto server, or changes to your application routes.

If your website uses CSP, add the new tracking origin to the relevant script and connection permissions. Update optional helper URLs to use the same host.

## Verify

Check DNS/TLS status and then an actual new pageview. A DNS success alone does not prove the script was published; a saved hostname alone proves neither DNS nor TLS.

For common failure states, use [Custom tracking domain](../integrations/tracking-domain.md).
