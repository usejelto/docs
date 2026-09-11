import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

// Execute the actual checked-in recipe with local adapters. No SDK/provider
// request is made; signature cryptography is delegated to Paddle's SDK.
const markdown = readFileSync(new URL('../content/payments/paddle.md', import.meta.url), 'utf8')
const example = [...markdown.matchAll(/```js\n([\s\S]*?)\n```/g)]
  .map(match => match[1]).find(code => code.includes("app.post('/webhooks/paddle'"))
assert.ok(example, 'Paddle webhook recipe is present')

function adapter({ rejectSignature = false, downstreamStatus = 201 } = {}) {
  let handler
  const posts = [], verified = []
  const app = { post: (_path, _raw, callback) => { handler = callback }, listen: () => {} }
  const express = Object.assign(() => app, { raw: () => () => {} })
  class Paddle {
    webhooks = { unmarshal: async (raw, secret, signature) => {
      verified.push({ raw, secret, signature })
      if (rejectSignature) throw new Error('fixture signature rejected')
    } }
  }
  vm.runInNewContext(example.replace(/^import .*;\n/gm, ''), {
    express, Paddle, AbortSignal,
    process: { env: { PADDLE_API_KEY: 'fixture', PADDLE_WEBHOOK_SECRET: 'fixture-webhook', JELTO_KEY: 'fixture-server-key', JELTO_ORIGIN: 'https://jelto.example' } },
    fetch: async (url, init) => { posts.push({ url, payment: JSON.parse(init.body) }); return { ok: downstreamStatus >= 200 && downstreamStatus < 300 } },
  })
  return { posts, verified, deliver: async event => {
    let status
    const raw = JSON.stringify(event)
    await handler({ body: Buffer.from(raw), get: () => 'fixture-signature' }, { sendStatus: value => { status = value } })
    return { status, raw }
  } }
}

const sale = (currency = 'USD', amount = '2400') => ({ event_type: 'transaction.completed', occurred_at: '2026-09-05T12:00:00Z', data: { id: 'txn_fixture', currency_code: currency, details: { totals: { total: '2900', grand_total: amount } }, custom_data: { jelto_cohort: 'news~email~launch', payer_email: 'never-forward@example.com' } } })

test('verified sales use after-credit amounts and retry with the same transaction ID', async () => {
  const a = adapter(), event = sale()
  const first = await a.deliver(event)
  assert.equal(first.status, 200)
  assert.equal(a.verified[0].raw, first.raw)
  assert.equal(a.posts[0].url, 'https://jelto.example/api/v1/payments')
  assert.deepEqual(a.posts[0].payment, { transaction_id: 'txn_fixture', occurred_at: event.occurred_at, currency: 'USD', amount: '24.00', cohort: 'news~email~launch' })
  await a.deliver(event)
  assert.deepEqual(a.posts[1].payment, a.posts[0].payment)
})

test('zero-decimal currencies and large integer amounts keep their exact value', async () => {
  const a = adapter()
  await a.deliver(sale('JPY', '2500'))
  assert.equal(a.posts[0].payment.amount, '2500')
  await a.deliver(sale('USD', '9007199254740993'))
  assert.equal(a.posts[1].payment.amount, '90071992547409.93')
})

test('only approved refunds forward a negative adjustment linked to its original', async () => {
  const a = adapter(), event = { event_type: 'adjustment.updated', occurred_at: '2026-09-05T12:00:00Z', data: { id: 'adj_fixture', transaction_id: 'txn_fixture', action: 'refund', status: 'pending_approval', currency_code: 'USD', totals: { total: '1200' } } }
  assert.equal((await a.deliver(event)).status, 200)
  assert.equal(a.posts.length, 0)
  event.data.status = 'approved'
  await a.deliver(event)
  assert.deepEqual(a.posts[0].payment, { transaction_id: 'adj_fixture', occurred_at: event.occurred_at, currency: 'USD', amount: '-12.00', refund_of: 'txn_fixture' })
})

test('invalid signatures never forward data and failed delivery is not acknowledged', async () => {
  const rejected = adapter({ rejectSignature: true })
  assert.equal((await rejected.deliver(sale())).status, 400)
  assert.equal(rejected.posts.length, 0)
  const unavailable = adapter({ downstreamStatus: 503 })
  assert.equal((await unavailable.deliver(sale())).status, 503)
})
