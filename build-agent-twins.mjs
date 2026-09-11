#!/usr/bin/env node
// Shared navigation and public-source validation; generate standalone agent copies.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join, dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publicBoundaryViolations } from './public-boundaries.mjs'

const DOCS = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(DOCS, 'content')
const SITE = 'https://jelto.io/docs'
const OUT = join(DOCS, 'agents')
const groups = JSON.parse(readFileSync(join(CONTENT, 'navigation.json'), 'utf8'))
const problems = []
const fail = (file, message) => problems.push(`${file}: ${message}`)
const unquote = value => value.trim().replace(/^["'](.*)["']$/, '$1')
function frontMatter(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) { fail(file, 'missing or unclosed front matter'); return null }
  const meta = {}; let list = null
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue
    const item = line.match(/^\s+-\s+(.*)$/)
    if (item && list) { meta[list].push(unquote(item[1])); continue }
    const pair = line.match(/^([a-z_]+):\s*(.*)$/)
    if (!pair) { fail(file, `invalid metadata: ${line}`); continue }
    const [, key, value] = pair
    meta[key] = value ? unquote(value) : []
    list = value ? null : key
  }
  for (const key of ['title', 'group', 'slug', 'summary']) {
    if (!meta[key] || (Array.isArray(meta[key]) && !meta[key].length)) fail(file, `missing ${key}`)
  }
  // Traceability lives in the private backend (the backend's traceability spec), so a
  // public page must validate without it and must not reintroduce it: these keys
  // cite specifications a reader of this repository cannot open.
  for (const key of ['implements', 'verified']) {
    if (key in meta) fail(file, `${key} is private traceability; it belongs in the backend, not in a public page`)
  }
  if (meta.summary && !/[.?]$/.test(meta.summary)) fail(file, 'summary must end with a full stop')
  return { meta, body: text.slice(match[0].length) }
}
function pageFiles(dir = CONTENT) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || ['agents', 'diagrams'].includes(entry.name)) return []
    const file = join(dir, entry.name)
    return entry.isDirectory() ? pageFiles(file) : entry.name.endsWith('.md') && file !== join(CONTENT, 'README.md') ? [file] : []
  })
}
const pages = new Map()
const groupIDs = new Set()
for (const group of groups) {
  if (!/^[a-z-]+$/.test(group.id) || groupIDs.has(group.id) || !group.title || !group.description || !group.pages.length) {
    fail('navigation.json', `invalid or duplicate group ${group.id}`)
  }
  for (const violation of publicBoundaryViolations(`${group.title}\n${group.description}`)) fail('navigation.json', violation)
  groupIDs.add(group.id)
  for (const slug of group.pages) {
    if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(slug) || pages.has(slug)) { fail('navigation.json', `invalid or duplicate page ${slug}`); continue }
    const file = join(CONTENT, slug + '.md')
    if (!existsSync(file)) { fail(slug, 'manifest page is missing'); continue }
    const parsed = frontMatter(readFileSync(file, 'utf8'), slug)
    if (!parsed) continue
    if (parsed.meta.slug !== slug || parsed.meta.group !== group.id) fail(slug, 'metadata disagrees with navigation manifest')
    pages.set(slug, { ...parsed, file, group, slug })
  }
}
for (const file of pageFiles()) {
  const slug = relative(CONTENT, file).replace(/\.md$/, '')
  if (!pages.has(slug)) fail(slug, 'public page is absent from navigation manifest')
}
const home = { slug: 'README', file: join(CONTENT, 'README.md'), body: readFileSync(join(CONTENT, 'README.md'), 'utf8') }
function anchors(body) {
  const used = new Set()
  for (const match of body.replace(/```[\s\S]*?```/g, '').matchAll(/^#{1,6}\s+(.+)$/gm)) {
    // Goldmark's default heading IDs keep ASCII letters/digits and replace whitespace with dashes.
    let id = match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*_]/g, '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s/g, '-')
    if (!id) id = 'heading'
    const base = id; let n = 1
    while (used.has(id)) id = `${base}-${n++}`
    used.add(id)
  }
  return used
}
const all = new Map([...pages, ['README', home]])
function absoluteLinks(body, page) {
  if (/!\[\]\(/.test(body)) fail(page.slug, 'image needs alt text')
  // Match both destinations of a linked image: [![alt](image)](full-size).
  return body.replace(/\]\(([^)\s]+)\)/g, (whole, href) => {
    if (/^(https?:|mailto:)/.test(href)) return whole
    const parsed = new URL(href, `${SITE}/${page.slug === 'README' ? '' : page.slug}`)
    if (parsed.origin !== 'https://jelto.io' || /%2f|%5c/i.test(parsed.pathname)) { fail(page.slug, `unsafe link ${href}`); return whole }
    if (!parsed.pathname.startsWith('/docs/')) {
      if (href !== '/') fail(page.slug, `unexpected root link ${href}`)
      return `](${parsed.href})`
    }
    const path = decodeURIComponent(parsed.pathname.slice('/docs/'.length))
    if (path.endsWith('.png')) {
      if (!/^images\/[a-z0-9-]+\.png$/.test(path) || !existsSync(join(CONTENT, path))) fail(page.slug, `unapproved or missing image ${href}`)
      return `](${parsed.href})`
    }
    const slug = path.replace(/\.md$/, '') || 'README'
    const target = all.get(slug)
    if (!target) fail(page.slug, `missing guide ${href}`)
    else if (parsed.hash && !anchors(target.body).has(decodeURIComponent(parsed.hash.slice(1))) && !(slug === 'README' && groupIDs.has(parsed.hash.slice(1)))) fail(page.slug, `missing heading ${href}`)
    return `](${SITE}/${slug === 'README' ? '' : slug}${parsed.hash})`
  })
}
for (const page of all.values()) {
  page.absolute = absoluteLinks(page.body, page)
  // Titles and summaries appear in navigation/search/agent copies too. Private
  // implements/verified metadata stays in source front matter and is excluded.
  const publicText = [page.meta?.title, page.meta?.summary, page.body].filter(Boolean).join('\n')
  for (const violation of publicBoundaryViolations(publicText)) fail(page.slug, violation)
}
if (problems.length) {
  console.error('docs: validation failed\n' + problems.map(p => `  ${p}`).join('\n'))
  process.exit(1)
}
if (process.argv.includes('--check')) {
  console.log(`docs: ${pages.size} pages; manifest, metadata, links, anchors and public boundaries check out. Nothing written.`)
  process.exit(0)
}
if (existsSync(OUT)) rmSync(OUT, { recursive: true })
mkdirSync(OUT, { recursive: true })
for (const page of pages.values()) {
  const out = join(OUT, page.slug + '.md'); mkdirSync(dirname(out), { recursive: true })
  const header = `# ${page.meta.title}\n\n${page.meta.summary}\n\nCanonical page: ${SITE}/${page.slug}\nSection: ${page.group.title}\n\n---\n\n`
  writeFileSync(out, header + page.absolute.replace(/^\s*#\s+.*\n+/, ''), 'utf8')
}
const index = ['# Jelto documentation', '', '> Setup and user guides for website and desktop app analytics.', '', `Start here: ${SITE}/`, '']
for (const group of groups) {
  index.push(`## ${group.title}`, '', group.description, '')
  for (const slug of group.pages) {
    const page = pages.get(slug)
    index.push(`- [${page.meta.title}](${SITE}/agents/${slug}.md): ${page.meta.summary}`)
  }
  index.push('')
}
writeFileSync(join(DOCS, 'llms.txt'), index.join('\n'))
console.log(`docs: ${pages.size} public guides → agent copies and llms.txt in manifest order.`)
