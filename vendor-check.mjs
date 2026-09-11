#!/usr/bin/env node
// Verify this component's vendored snapshots against their own manifests.
//
// spec/repository-boundaries.md §2: an ordinary build checks the installed
// snapshot, and does so without reading the producer. This script is
// deliberately self-contained so it works in a standalone checkout with no
// dependencies installed; refreshing a pin is a separate, explicit operation.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const sha256 = (data) => createHash('sha256').update(data).digest('hex')
const problems = []
let checked = 0

function filesIn(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? filesIn(path, base) : [relative(base, path).split('\\').join('/')]
  })
}

function verify(snapshot) {
  const manifest = JSON.parse(readFileSync(join(snapshot, 'manifest.json'), 'utf8'))
  const expected = new Set(Object.keys(manifest.files ?? {}))
  if (!expected.size) problems.push(`${relative(root, snapshot)}: manifest records no files`)
  for (const [name, entry] of Object.entries(manifest.files ?? {})) {
    const file = join(snapshot, name)
    if (!existsSync(file)) { problems.push(`${relative(root, file)}: missing`); continue }
    if (sha256(readFileSync(file)) !== entry.sha256) problems.push(`${relative(root, file)}: checksum mismatch`)
    checked += 1
  }
  for (const name of filesIn(snapshot)) {
    if (name !== 'manifest.json' && !expected.has(name)) problems.push(`${relative(root, join(snapshot, name))}: unexpected file`)
  }
  const origin = manifest.producer ? ` from ${manifest.producer}` : ''
  console.log(`  ${manifest.name} v${manifest.version}${origin}: ${expected.size} files`)
}

function walk(dir, inVendor = false) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || ['node_modules', '.git', 'dist'].includes(entry.name)) continue
    const path = join(dir, entry.name)
    const vendored = inVendor || entry.name === 'vendor'
    if (vendored && existsSync(join(path, 'manifest.json'))) verify(path)
    else walk(path, vendored)
  }
}

walk(root)
if (problems.length) {
  console.error('\nVendored snapshots do not match their manifests:')
  for (const problem of problems) console.error(`  ${problem}`)
  console.error('\nA snapshot is a pinned input. Restore it, or refresh the pin deliberately.')
  process.exit(1)
}
console.log(`${checked} vendored files verified against their manifests.`)
