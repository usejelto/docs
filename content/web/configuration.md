---
title: "Script configuration"
group: install
slug: web/configuration
summary: "Choose script options for routes, exclusions, downloads and optional tracking helpers."
---

# Script configuration

Start with the complete tag from **Settings → Installation**. Keep one core tracker per document. This reference explains the optional changes to that tag; use [website installation](../start/website.md) for the first setup.

The examples use Jelto's standard cookieless script at `https://app.jelto.io/jelto.js` and collection endpoint at `https://app.jelto.io/v1/e`. Replace `YOUR_PRODUCT_ID` with your public product ID, and preserve your dashboard's URLs if you use a custom tracking domain or cookie mode.

## Core options

| Attribute | Default | Use it when |
| --- | --- | --- |
| `data-product` | Required | Always: identifies your product. |
| `data-endpoint` | `https://in.jelto.io/v1/e` | Your dashboard supplies a custom collection URL. Copy it exactly. |
| `data-spa="off"` | SPA history tracking on | Your application deliberately sends its own navigation pageviews. |
| `data-auto-pageview="off"` | Automatic initial pageview on | You need to control the initial pageview yourself. |
| `data-hash` | Hash excluded from paths | Your router uses URL fragments as page routes. |
| `data-exclude` | No path exclusions | Specific pages should not collect analytics. |
| `data-file-types` | `dmg pkg zip exe msi appimage deb rpm tar.gz snap` | You need a different set of download extensions. This replaces the defaults. |
| `data-memory="on"` | Off | You explicitly want first-touch channel memory. |
| `data-allow-localhost` | Local hosts excluded | You are testing on a registered local hostname. |

`data-hash` and `data-allow-localhost` are presence flags: writing `data-hash="false"` still enables it. Remove the attribute to turn it off. For the other options, use the exact values shown.

## Routes and manual pageviews

Normal page loads and supported History API navigation are automatic. Leave that enabled unless you have a concrete need for manual control.

For hash routes such as `/#/pricing`, add `data-hash` to include the fragment. For fully manual navigation, disable both initial and SPA pageviews, then call after the tracker is ready and the destination is known:

```html
<script defer data-product="YOUR_PRODUCT_ID"
  src="https://app.jelto.io/jelto.js" data-endpoint="https://app.jelto.io/v1/e"
  data-auto-pageview="off" data-spa="off"></script>
```

```js
window.jelto?.('pageview', { u: '/pricing' })
```

Do not add a manual pageview on top of automatic collection for the same navigation. Put initial manual calls in a script load or application-ready path, not ahead of the external tracker.

## Exclude pages and your own test visit

```html
<script defer data-product="YOUR_PRODUCT_ID"
  src="https://app.jelto.io/jelto.js" data-endpoint="https://app.jelto.io/v1/e"
  data-exclude="/admin/**,/preview/*"></script>
```

`*` matches within one path segment; `**` can span directories. Separate patterns with commas or whitespace. For example, `/admin/**` excludes descendants; add `/admin` as well if the base page must be excluded.

Open a page with `?jelto_ignore=1` to skip tracking for that document and its SPA navigation. It is not a permanent browser opt-out across full navigations. **Settings → Traffic & usage** also provides traffic exclusions and a link to open the site without tracking.

## Download extensions

```html
data-file-types="dmg,zip,pdf"
```

Add this attribute to the existing script. It replaces the full default extension list; include every extension you still want. A download click measures a browser action, not completion of a transfer or installation of an app.

## Local testing

Add `data-allow-localhost` only for a local setup and register its hostname. Production sites do not need it. `file:` pages, detected browser automation and `jelto_ignore=1` remain excluded. Use a normal browser for the [installation check](../start/verify.md).

## Cookies and attribution memory

The core `/jelto.js` installation is cookieless. `/jelto.cookie.js` is an explicit alternative that enables persistent browser identifiers. Do not load both. First-touch `data-memory="on"` is a separate storage choice; turning it on is not implied by choosing a cookie bundle.

Only load optional storage behavior according to your site's privacy and consent choices. See [Cookies and domains](../analytics/cookies-and-domains.md) for how this changes interpretation.

## Optional helpers

| Helper | Purpose | Placement |
| --- | --- | --- |
| `/jelto.crossdomain.js` | Carry aggregate marketing-channel labels across registered hosts | Before the core script; supply matching `data-product` and `data-domains`. |
| `/jelto.goals.js` | Explicit form-submit and visibility goals | After the core script. |
| `/jelto.entry.js` | Configured entry-page group context for attribution | After the core script, before checkout. |
| `/jelto.checkout.js` | Checkout metadata, supported payment links and verified return claims | After the core script and any entry helper. |

Use the same script host as your dashboard's installation. Keep dependent tags in order with `defer`, not `async`. See [Forms and visibility](../goals/forms-and-visibility.md), [Cookies and domains](../analytics/cookies-and-domains.md), and [Browser payment attribution](../payments/browser-attribution.md) for complete examples.

## Endpoints and content security policy

A configured endpoint must resolve to HTTP or HTTPS. Credentials, fragments, an empty value or a malformed URL disable initialization instead of silently collecting elsewhere. A relative endpoint resolves against your page URL.

Your site's CSP must permit the actual script origin in `script-src` and the ingestion origin in `connect-src`. Add the specific origins to your existing policy rather than replacing it with wildcards. For nonce-based policies, pass the site's current nonce through your framework.

## Verify after changing an option

Publish, open a normal browser and check the intended page, excluded page or route change. Use [installation verification](../start/verify.md), [duplicate-pageview troubleshooting](../troubleshooting/duplicate-pageviews.md), or [event troubleshooting](../troubleshooting/events-and-funnels.md) for the relevant result.
