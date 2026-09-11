<script lang="ts">
  import { untrack } from 'svelte'
  import SearchIcon from '@lucide/svelte/icons/search'
  import ArrowRight from '@lucide/svelte/icons/arrow-right'
  import X from '@lucide/svelte/icons/x'
  import { Button, Dialog, IconButton, SearchField, StatusMessage } from '@jelto/ui'
  import { parseIndex, searchSections, type SearchSection } from './search'

  let open = $state(false)
  let query = $state('')
  let index = $state.raw<SearchSection[] | null>(null)
  let loading = $state(false)
  let failed = $state(false)
  let selected = $state(0)
  const results = $derived(searchSections(index ?? [], query))
  const searching = $derived(query.trim().length > 0)
  const shortcutLabel = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'
  const id = $props.id()
  let input = $state<HTMLInputElement | null>(null)
  let resultList: HTMLUListElement | undefined
  function clear() {
    query = ''
    input?.focus()
  }
  async function load() {
    if (loading || index) return
    loading = true
    failed = false
    try {
      const response = await fetch('/docs/search-index.json', { credentials: 'omit', signal: AbortSignal.timeout(10000) })
      if (!response.ok) throw new Error('Index unavailable')
      index = parseIndex(await response.json())
    } catch { failed = true } finally { loading = false }
  }
  $effect(() => { if (open) untrack(() => { void load() }) })
  $effect(() => { query; selected = 0 })
  function shortcut(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.altKey) {
      event.preventDefault()
      open = !open
    }
  }
  function navigate(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      open = false
      return
    }
    if (!results.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      selected = (selected + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
      resultList?.children[selected]?.scrollIntoView?.({ block: 'nearest' })
    } else if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault()
      const result = results[selected]
      if (result) window.location.assign(result.url)
    }
  }
</script>
<svelte:window onkeydown={shortcut} />
<Button size="compact" class="docs-search-trigger" static aria-label="Search docs" aria-keyshortcuts="Meta+K Control+K" onclick={() => { open = true }}><SearchIcon size={16} strokeWidth={1.5} aria-hidden="true" /><span>Search<span class="docs-search-label">{' docs'}</span></span><kbd class="docs-search-key" aria-hidden="true">{shortcutLabel}</kbd></Button>
<Dialog bind:open title="Search documentation">
  <div class="docs-search-input">
    <SearchField label="Search documentation" placeholder="Find a guide…" bind:value={query} bind:ref={input} onkeydown={navigate} role="combobox" aria-expanded={results.length > 0} aria-controls={`${id}-results`} aria-activedescendant={results.length ? `${id}-result-${selected}` : undefined} aria-autocomplete="list" aria-describedby={`${id}-status`} autocomplete="off" />
    {#if query}<IconButton label="Clear search" onclick={clear}><X size={16} aria-hidden="true" /></IconButton>{/if}
  </div>
  <div id={`${id}-status`} class="docs-search-status"><StatusMessage live="polite">{loading ? 'Loading documentation…' : failed ? 'Search could not load. Check your connection and try again.' : searching ? `${results.length}${results.length === 20 ? '+' : ''} ${results.length === 1 ? 'result' : 'results'}` : 'Suggested guides'}</StatusMessage></div>
  {#if failed}<Button onclick={() => { void load() }}>Try again</Button>{/if}
  {#if !loading && !failed && searching && !results.length}<p class="docs-search-empty">No guides found for “{query}”. Try a feature or integration name, or clear your search.</p>{/if}
  <ul bind:this={resultList} id={`${id}-results`} class="docs-search-results" role="listbox" aria-label="Documentation results">
    {#each results as result, i}
      <li id={`${id}-result-${i}`} role="option" aria-selected={i === selected}>
        <a href={result.url} tabindex="-1" onpointerenter={() => { selected = i }}>
          {#if searching}<span class="docs-result-category">{result.category}</span>{/if}
          <strong>{result.title}<ArrowRight size={16} aria-hidden="true" /></strong>
          {#if result.heading}<span class="docs-result-heading">{result.heading}</span>{/if}
          {#if searching}<span class="docs-result-excerpt">{result.excerpt}</span>{/if}
        </a>
      </li>
    {/each}
  </ul>
  <p class="docs-search-help">↑ ↓ to navigate <span>↵ to open</span><span>esc to close</span></p>
</Dialog>
