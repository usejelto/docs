<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type { CodeLanguage, CodeToken } from './highlightCode'
  import Textarea from './Textarea.svelte'
  let { text, label, language = 'text', selectable = false, wrap = true, class: className = '', actions, onkeydown, ...rest }:
    HTMLAttributes<HTMLPreElement> & { text: string; language?: CodeLanguage; wrap?: boolean; class?: string; actions?: Snippet } & ({ selectable: true; label: string } | { selectable?: false; label?: string }) = $props()

  let highlighted = $state.raw<{ text: string; language: CodeLanguage; tokens: CodeToken[] } | null>(null)
  const tokens = $derived(highlighted?.text === text && highlighted.language === language ? highlighted.tokens : null)

  $effect(() => {
    const source = text, lang = language
    if (selectable || lang === 'text' || !source) return
    let canceled = false
    void import('./highlightCode').then(({ highlightCode }) => highlightCode(source, lang)).then((result) => {
      if (!canceled) highlighted = { text: source, language: lang, tokens: result }
    }).catch(() => {
      // Highlighting is progressive enhancement; the current source stays usable.
      if (!canceled) highlighted = null
    })
    return () => { canceled = true }
  })

  function selectCode(event: KeyboardEvent & { currentTarget: EventTarget & HTMLPreElement }) {
    onkeydown?.(event)
    if (event.defaultPrevented || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== 'a') return
    const selection = window.getSelection()
    const code = event.currentTarget.querySelector('code')
    if (!selection || !code) return
    event.preventDefault()
    const range = document.createRange()
    range.selectNodeContents(code)
    selection.removeAllRanges()
    selection.addRange(range)
  }
</script>
<div class={`ui-code-block ${className}`} data-wrap={wrap}>
  {#if selectable}
    <Textarea readonly value={text} aria-label={label} rows={Math.min(12, text.split('\n').length + 2)} />
  {:else}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable code is keyboard accessible.) -->
    <pre {...rest} tabindex="0" aria-label={label} onkeydown={selectCode}><code data-language={language} data-highlighted={tokens ? true : undefined}>{#if tokens}{#each tokens as token}<span class={token.color ? `ui-code-syntax-${token.color.slice(6, -1)}` : undefined}>{token.content}</span>{/each}{:else}{text}{/if}</code></pre>
  {/if}
  {#if actions}<div class="ui-code-block__actions">{@render actions()}</div>{/if}
</div>
