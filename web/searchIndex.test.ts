import { expect, test } from 'vitest'
import { parseIndex, searchSections, type SearchSection } from './search'
const section = (title: string, heading: string, text: string, url = '/docs/start/website'): SearchSection => ({ title, heading, text, url, category: 'Get started' })
test('ranks title before heading before body and supports case-insensitive prefixes', () => {
  const index = [section('Other', '', 'Install tracking now'), section('Other', 'Install', 'Example'), section('Install tracking', '', 'Example')]
  expect(searchSections(index, 'INSTALL').map(s => s.title + s.heading)).toEqual(['Install tracking', 'OtherInstall', 'Other'])
  expect(searchSections(index, 'track')).toHaveLength(2)
})
test('finds body-only code terms, requires all query words and returns section anchors', () => {
  const index = [section('Goals', 'Register an event', 'Use allowed_properties before sending checkout_started.', '/docs/goals/create-goal#register-an-event')]
  expect(searchSections(index, 'allowed_prop checkout')[0]?.url).toBe('/docs/goals/create-goal#register-an-event')
  expect(searchSections(index, 'allowed_prop missing')).toEqual([])
})
test('empty queries offer unique starter guides and unmatched queries return no results', () => {
  const index = [section('First', '', 'Welcome'), section('First', 'Next', 'Next'), section('Second', '', 'Setup')]
  expect(searchSections(index, '  ').map(s => s.title)).toEqual(['First', 'Second'])
  expect(searchSections(index, 'nonexistent')).toEqual([])
})
test('validates the public index and rejects unsafe navigation destinations', () => {
  expect(parseIndex([section('Guide', '', 'Hello')])).toHaveLength(1)
  for (const url of ['javascript:alert(1)', '//evil.test', '/docs/../private', '/api/v1/me']) {
    expect(() => parseIndex([section('Guide', '', 'Hello', url)])).toThrow()
  }
  expect(() => parseIndex({})).toThrow()
})
