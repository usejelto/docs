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
    'The SDK stores unsent activity locally and queues the first install claim immediately.',
    'Raw email is not stored in analytics or logs. Matching expires after 24 hours.',
    'Set a CNAME in Cloudflare DNS for your custom tracking domain.',
  ]) assert.deepEqual(publicBoundaryViolations(text), [], text)
})

test('allows the reviewed public wire contract link without allowing private specifications', () => {
  const link = '[spec/wire-v1.md §4](https://github.com/usejelto/contracts/blob/main/spec/wire-v1.md#4-reserved-event-names)'
  assert.deepEqual(publicBoundaryViolations(`Read ${link}.`), [])
  for (const text of [
    `${link} and spec/api.yaml`,
    `${link} and internal/store`,
    link.replace('/contracts/', '/jelto/'),
    link.replaceAll('wire-v1.md', 'api.yaml'),
    'See spec/wire-v1.md §4.',
  ]) assert.ok(publicBoundaryViolations(text).includes('private source path'), text)
})

// The whole repository is public, not only content/. build-agent-twins.mjs scans
// the guides; this scans everything else that is tracked, so a private path in a
// Go comment, a test fixture or a build script fails the same gate.
test('every tracked file outside content/ stays inside the public boundary', async () => {
  const { execFileSync } = await import('node:child_process')
  const { readFileSync } = await import('node:fs')
  // The scanner and its two tests must spell out the private terms they reject;
  // they are the rule, not prose, and are excluded by name rather than by pattern.
  const scanner = new Set(['public-boundaries.mjs', 'public-boundaries.test.mjs', 'public_boundary_test.go'])
  // No tolerated literals: the pinned @jelto/ui and font snapshots once cited the
  // private dashboard and design-system specs in comments; the producer now names
  // them without a path, so vendored files are held to the same rule as the rest.
  const allowed = []
  const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
  const violations = []
  for (const file of files) {
    if (file.startsWith('content/') || scanner.has(file)) continue
    let text
    try { text = readFileSync(file, 'utf8') } catch { continue }
    if (text.slice(0, 1024).includes('\0')) continue
    for (const { literal, under } of allowed) if (file.startsWith(under)) text = text.split(literal).join('')
    const found = publicBoundaryViolations(text)
    if (found.length) violations.push(`${file}: ${found.join(', ')}`)
  }
  assert.deepEqual(violations, [], violations.join('\n'))
})
