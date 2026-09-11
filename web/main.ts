import './vendor/fonts/dm-sans.css'
import '@jelto/ui/styles.css'
import './search.css'
import { mount } from 'svelte'
import Search from './Search.svelte'
import CodeExample from './CodeExample.svelte'
import type { CodeLanguage } from '@jelto/ui/highlightCode'
import { rememberNavigationGroups, revealDirectoryTarget } from './navigation'
import { enhanceImages } from './images'

rememberNavigationGroups()
enhanceImages()
window.addEventListener('hashchange', () => revealDirectoryTarget())
revealDirectoryTarget()

const target = document.getElementById('docs-search')
if (target) mount(Search, { target })
const languages: Record<string, CodeLanguage> = { html: 'html', js: 'javascript', javascript: 'javascript', ts: 'typescript', typescript: 'typescript', swift: 'swift', cs: 'csharp', csharp: 'csharp', sh: 'bash', shell: 'bash', bash: 'bash' }
for (const pre of document.querySelectorAll<HTMLPreElement>('.docs-prose pre')) {
  const code = pre.querySelector('code')
  if (!code) continue
  const text = code.textContent ?? ''
  const name = [...code.classList].find((name) => name.startsWith('language-'))?.slice(9) ?? ''
  const wrapper = document.createElement('div')
  wrapper.className = 'docs-code'
  pre.before(wrapper)
  try {
    mount(CodeExample, { target: wrapper, props: { text, language: languages[name] ?? 'text', wrap: name === 'text' } })
    pre.remove()
  } catch { wrapper.remove() }
}
const updateTables = () => {
  for (const table of document.querySelectorAll<HTMLElement>('.docs-table')) {
    const note = table.nextElementSibling
    if (note instanceof HTMLElement && note.classList.contains('docs-table-note')) note.hidden = table.scrollWidth <= table.clientWidth
  }
}
const observer = new ResizeObserver(updateTables)
for (const table of document.querySelectorAll<HTMLElement>('.docs-table')) observer.observe(table)
updateTables()
