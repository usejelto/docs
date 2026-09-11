export type SearchSection = { title: string; category: string; heading: string; text: string; url: string }
export type SearchResult = SearchSection & { excerpt: string }
const words = (value: string) => value.toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? []

export function searchSections(index: SearchSection[], query: string): SearchResult[] {
  const terms = words(query)
  if (!terms.length) {
    const seen = new Set<string>()
    return index.filter((section) => {
      if (section.category !== 'Get started' || seen.has(section.title)) return false
      seen.add(section.title)
      return true
    }).map((section) => ({ ...section, excerpt: section.text.slice(0, 160) }))
  }
  return index.map((section, order) => {
    const title = words(section.title), heading = words(section.heading), body = words(section.text)
    const matches = (tokens: string[], term: string) => tokens.some((token) => token.startsWith(term))
    let score = 0
    for (const term of terms) {
      if (matches(title, term)) score += 30
      else if (matches(heading, term)) score += 15
      else if (matches(body, term)) score += 1
      else return null
    }
    if (section.title.toLowerCase() === query.trim().toLowerCase()) score += 100
    const at = Math.max(0, section.text.toLowerCase().indexOf(terms[0] ?? '') - 48)
    const excerpt = (at > 0 ? '…' : '') + section.text.slice(at, at + 180) + (section.text.length > at + 180 ? '…' : '')
    return { section, score, order, excerpt }
  }).filter((result) => result !== null)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, 20).map(({ section, excerpt }) => ({ ...section, excerpt }))
}

export function parseIndex(value: unknown): SearchSection[] {
  if (!Array.isArray(value) || !value.every((s: unknown) => {
    if (typeof s !== 'object' || s === null) return false
    const entry = s as Record<string, unknown>
    return ['title', 'category', 'heading', 'text', 'url'].every((key) => typeof entry[key] === 'string') &&
      /^\/docs\/[a-z0-9-]+\/[a-z0-9-]+(?:#[a-z0-9-]+)?$/.test(entry.url as string)
  })) throw new Error('Invalid documentation index')
  return value as SearchSection[]
}
