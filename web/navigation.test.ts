import { waitFor } from '@testing-library/svelte'
import { afterEach, expect, test, vi } from 'vitest'
import { rememberNavigationGroups, revealDirectoryTarget } from './navigation'

let stopRemembering = () => {}
afterEach(() => {
  stopRemembering()
  vi.restoreAllMocks()
  sessionStorage.clear()
  document.body.innerHTML = ''
  window.history.replaceState(null, '', '/')
})

function renderNavigation(active: string) {
  stopRemembering()
  const groups = ['start', 'install', 'sdk'].map((id) => `<details class="nav-group" data-nav-group="${id}"${id === active ? ' open' : ''}><summary>${id}</summary><a href="/docs/${id}/guide"${id === active ? ' aria-current="page"' : ''}>Guide</a></details>`).join('')
  document.body.innerHTML = `<aside class="docs-sidebar"><div class="desktop-nav">${groups}</div><details class="mobile-nav"><summary>Browse documentation</summary>${groups}</details></aside>`
  stopRemembering = rememberNavigationGroups()
}

function expectGroupOpen(id: string, open: boolean) {
  const copies = document.querySelectorAll<HTMLDetailsElement>(`[data-nav-group="${id}"]`)
  expect(copies).toHaveLength(2)
  for (const copy of copies) expect(copy.open).toBe(open)
}

test('expanded categories survive guide navigation and reloads while the destination stays visible', async () => {
  renderNavigation('start')
  document.querySelector<HTMLElement>('.desktop-nav [data-nav-group="install"] > summary')!.click()
  await waitFor(() => expectGroupOpen('install', true))

  renderNavigation('install')
  expectGroupOpen('start', true)
  expectGroupOpen('install', true)
  renderNavigation('install')
  expectGroupOpen('start', true)
  expectGroupOpen('install', true)

  // A search result can lead to a category that was previously collapsed.
  renderNavigation('sdk')
  for (const id of ['start', 'install', 'sdk']) expectGroupOpen(id, true)
})

test('manual collapses persist and desktop/mobile disclosures stay synchronized', async () => {
  renderNavigation('start')
  document.querySelector<HTMLElement>('.mobile-nav [data-nav-group="install"] > summary')!.click()
  await waitFor(() => expectGroupOpen('install', true))
  document.querySelector<HTMLElement>('.desktop-nav [data-nav-group="start"] > summary')!.click()
  await waitFor(() => expectGroupOpen('start', false))

  renderNavigation('install')
  expectGroupOpen('start', false)
  expectGroupOpen('install', true)
})

test.each(['{', '{"start":true}', '["start",5]'])('invalid stored navigation %s keeps the native defaults', (saved) => {
  sessionStorage.setItem('jelto.docs.openCategories', saved)
  renderNavigation('install')
  expectGroupOpen('start', false)
  expectGroupOpen('install', true)
})

test('blocked storage leaves categories independently usable', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage disabled') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage disabled') })
  renderNavigation('start')
  document.querySelector<HTMLElement>('.desktop-nav [data-nav-group="sdk"] > summary')!.click()
  await waitFor(() => expectGroupOpen('sdk', true))
  expectGroupOpen('start', true)
})

test('existing category deep links reveal their guides without closing another topic', () => {
  document.body.innerHTML = '<details id="start" class="directory-group" open><summary>Get started</summary></details><details id="install" class="directory-group"><summary>Website installation</summary><a href="/docs/install/html">HTML</a></details>'
  window.history.replaceState(null, '', '/docs/#install')
  revealDirectoryTarget()
  expect(document.querySelector<HTMLDetailsElement>('#install')?.open).toBe(true)
  expect(document.querySelector<HTMLDetailsElement>('#start')?.open).toBe(true)
})

test('article anchors and malformed fragments leave navigation unchanged', () => {
  document.body.innerHTML = '<details id="install" class="nav-group"><summary>Website installation</summary></details><h2 id="verify">Verify</h2>'
  for (const hash of ['#verify', '#install', '#missing', '#%E0%A4%A']) {
    window.history.replaceState(null, '', '/docs/start/website' + hash)
    expect(() => revealDirectoryTarget()).not.toThrow()
    expect(document.querySelector<HTMLDetailsElement>('#install')?.open).toBe(false)
  }
})
