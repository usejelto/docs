---
title: "Use a custom tracking domain"
group: integrations
slug: integrations/tracking-domain
summary: "Serve website tracking through a registered subdomain and verify DNS and TLS."
---

# Use a custom tracking domain

A custom tracking domain serves the tracker and collection requests through a subdomain such as `analytics.example.com`. Your website itself can remain on its existing hosting platform.

## Connect the subdomain

1. Choose an unused subdomain of a domain you control.
2. Open **Settings → Installation → Custom tracking domain** and enter that full hostname. Save it.
3. At your authoritative DNS provider, create the CNAME record shown in Jelto. Copy the displayed target exactly; do not point the tracking host at your website's application server.
4. Run the explicit DNS/TLS check in Jelto and read its status. A saved hostname and a recent request are separate from a successful DNS and certificate check.
5. Once ready, return to Installation and copy the updated script tag into your website. Preserve its endpoint, and use the same script host for optional helpers.
6. Publish and [verify a new pageview](../start/verify.md).

## Choose your DNS provider

Use [Cloudflare DNS](../subdomain/cloudflare.md) or [Vercel DNS](../subdomain/vercel.md) when that provider manages the authoritative zone. A site hosted behind [Caddy](../subdomain/caddy.md) or [nginx](../subdomain/nginx.md) can still use this managed DNS setup.

## Troubleshooting

Check for conflicting records at the chosen hostname and allow DNS caches to update. Make sure you edited the authoritative DNS zone. If TLS or DNS checks fail, read the displayed reason before switching the installed tag.

A tracking domain does not provide authenticated management APIs. Continue to use the main Jelto API origin for server keys, payments and crawler reporting. It does not connect browser identities across sites; see [Cookies and domains](../analytics/cookies-and-domains.md).
