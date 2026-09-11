import { test } from 'node:test'
import assert from 'node:assert/strict'
import { publicBoundaryViolations } from './public-boundaries.mjs'

test('rejects private platform instructions and previously exposed mechanisms', () => {
  for (const text of [
    'Edit web/dashboard/src/app/App.svelte.', 'Run go run ./cmd/jelto serve.',
    'See internal/store and spec/api.yaml.', 'Run make fixtures.',
    'Set JELTO_LS_SECRET before starting.', 'Open the Operator setup guide.',
    "Clone Jelto's private backend.", "You do not need Jelto's backend source.",
    'The worker removes expired rows.', 'The durable revenue ledger stores the payment.',
    'Retained history has a resumable cursor.', 'Raw email is used to calculate a keyed HMAC.',
    'Session mutations also require the deployment Origin for CSRF protection.',
  ]) assert.notDeepEqual(publicBoundaryViolations(text), [], text)
})

test('allows customer integrations, SDK contracts, privacy outcomes and public APIs', () => {
  for (const text of [
    'Add the tracker in your app/layout.tsx and deploy your Next.js website.',
    "import { createClient } from '@jelto/analytics/server'",
    'Set JELTO_API_KEY on your application server and POST /api/v1/payments.',
    'Keep JELTO_CRAWLER_KEY on your server; call trackResponse and flush the SDK queue.',
    "Connect your private GitHub repository in Settings.",
    "Verify your provider webhook's HMAC signature on your server.",
    'The SDK stores unsent activity locally. The first install can take six hours.',
    'Raw email is not stored in analytics or logs. Matching expires after 24 hours.',
    'Set a CNAME in Cloudflare DNS for your custom tracking domain.',
  ]) assert.deepEqual(publicBoundaryViolations(text), [], text)
})
