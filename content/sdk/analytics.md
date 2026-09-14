---
title: "JavaScript browser and server SDK"
group: sdk
slug: sdk/analytics
summary: "Use typed wrappers for the website tracker or scoped server-side APIs."
---

# JavaScript browser and server SDK

Use typed JavaScript helpers to install tracking in your website or call Jelto APIs from your application server. Both examples below belong in your own project.

## Setup steps

1. Install `@jelto/analytics` from npm.
2. Choose the browser entry for website tracking or the server entry for scoped APIs.
3. Initialize with the matching product and endpoint values.
4. Verify a pageview or inspect the API result, following the relevant example below.

## Install

The package is published on npm as `@jelto/analytics`; its source and releases are at [usejelto/javascript-sdk](https://github.com/usejelto/javascript-sdk). It exposes `@jelto/analytics/browser` and `@jelto/analytics/server`. The server entry requires Node.js 22 or later.

```sh
npm install @jelto/analytics
```

## Browser setup

Use this installation instead of a separate HTML tracker tag. Call it once after the application mounts in the browser. Replace `YOUR_PRODUCT_ID` with your public product ID from **Settings → Installation**. The example uses Jelto's standard cookieless script; preserve the copied script URL and collection endpoint if you use a custom tracking domain or cookie mode:

```ts
import { initialize } from '@jelto/analytics/browser'

const analytics = await initialize({
  product: 'YOUR_PRODUCT_ID',
  scriptUrl: 'https://app.jelto.io/jelto.js',
  endpoint: 'https://app.jelto.io/v1/e',
  goals: true,
})
// In a later confirmed-success handler:
analytics.track('signup', { plan: 'pro' })
```

Jelto discovers `signup` and `plan` on receipt; no registration is required. `goals: true` loads explicit form-submit and visibility tracking. Automatic pageviews are enabled by default; do not send a manual pageview for the same navigation.

Identical repeated initialization shares the initial load, while conflicting options or an existing HTML installation fail. A failed script load requires a page reload before trying again. `scriptUrl` must end in `jelto.js` or `jelto.cookie.js`. Cookie mode and first-touch memory are separate explicit choices.

## Server setup

Keep the key in your server environment. Use Jelto's **API origin**, `https://app.jelto.io`, as the endpoint, and replace `YOUR_PRODUCT_ID` with your public product ID.

```ts
import { createClient } from '@jelto/analytics/server'

const apiKey = process.env.JELTO_API_KEY
if (!apiKey) throw new Error('Set JELTO_API_KEY on the server')
const jelto = createClient({
  endpoint: 'https://app.jelto.io',
  product: 'YOUR_PRODUCT_ID',
  apiKey,
})
const result = await jelto.stats({
  from: '2026-09-01', to: '2026-09-07', metric: 'visitors',
})
if (result.ok) console.log(result.data.total)
```

Use `analytics:read` for reporting, `funnels:read` or `funnels:write` for the respective funnel operations, and `payments:write` for verified payments. See [API keys](../manage/api-keys.md) and [Website API](../api/website.md).

## Verify and handle failure

Use [website verification](../start/verify.md) for browser collection. On the server, inspect `result.ok` and the returned error details; preserve unavailable metric states rather than replacing them with zero. Requests do not automatically retry mutations. Reuse the same transaction ID when retrying a payment.

This SDK does not provide an `identify` method or arbitrary server-side visitor events. Use the separate [crawler SDK](crawler.md) for server crawler reporting.
