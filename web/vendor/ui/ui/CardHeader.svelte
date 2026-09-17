<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Info } from '@lucide/svelte'
  import Popover from './Popover.svelte'
  let { title, hint, titleId, hintId, hintDisclosure = false, level = 3, layout = 'stacked', class: className = '', children, actions }:
    { title?: string; hint?: string; titleId?: string; hintId?: string; hintDisclosure?: boolean; level?: 2 | 3 | 4; layout?: 'stacked' | 'inline'; class?: string; children?: Snippet; actions?: Snippet } = $props()
</script>
<header class={`ui-card__heading ${className}`} data-layout={hintDisclosure ? 'inline' : layout}>
  {#if title}<svelte:element this={`h${level}`} class="ui-card__title" id={titleId}>{title}</svelte:element>{/if}
  {#if hint}<p class={hintDisclosure ? 'sr-only' : 'ui-card__hint'} id={hintId}>{hint}</p>{/if}
  {@render children?.()}
  {#if actions || (hintDisclosure && hint)}
    <div class="ui-card__actions">
      {@render actions?.()}
      {#if hintDisclosure && hint}
        <Popover label={`About ${title ?? 'this card'}`} tooltip={`About ${title ?? 'this card'}`} align="end" triggerProps={{ class: 'ui-btn--ghost ui-icon-btn', 'aria-label': `About ${title ?? 'this card'}` }}>
          {#snippet trigger()}<Info size="var(--icon-standard)" strokeWidth={1.5} aria-hidden="true" />{/snippet}
          <p class="card-help">{hint}</p>
        </Popover>
      {/if}
    </div>
  {/if}
</header>

<style>
  .card-help { max-width: 32ch; margin: 0; font-size: var(--text-sm); line-height: 1.6; color: var(--muted); white-space: pre-line; }
</style>
