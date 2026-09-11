---
title: "Custom tracking domain with Vercel DNS"
group: integrations
slug: subdomain/vercel
summary: "Connect a managed tracking subdomain while keeping your existing website host."
---

# Custom tracking domain with Vercel DNS

Use Jelto's managed tracking domain with Vercel DNS. You need permission to edit your domain's DNS records.

## Set up the record

1. In Jelto, open **Settings → Installation → Custom tracking domain**, save an unused hostname such as `analytics.example.com`, and copy its CNAME target.
2. Open your team's **Domains**, choose the domain and add a **CNAME** in its DNS records. Use the chosen subdomain as Name and Jelto's displayed target as Value.
3. Wait for the change to be visible, then run the DNS/TLS check in Jelto.
4. Copy the updated installation tag, publish it on your website and [verify traffic](../start/verify.md).

## Keep the boundaries clear

Manage this record in Vercel only when the domain uses Vercel's authoritative DNS. Hosting the website on Vercel alone does not mean that Vercel manages its DNS.

If your website uses CSP, add the new tracking origin to the relevant script and connection permissions. Update optional helper URLs to use the same host.

## Verify

Check DNS/TLS status and then an actual new pageview. A DNS success alone does not prove the script was published; a saved hostname alone proves neither DNS nor TLS.

For common failure states, use [Custom tracking domain](../integrations/tracking-domain.md).

DNS reference: [Official Vercel DNS documentation](https://vercel.com/docs/domains/managing-dns-records).
