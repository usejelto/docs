<script lang="ts">
  import type { Snippet } from 'svelte'
  let { title, hint, titleId, hintId, level = 3, layout = 'stacked', class: className = '', children, actions }:
    { title?: string; hint?: string; titleId?: string; hintId?: string; level?: 2 | 3 | 4; layout?: 'stacked' | 'inline'; class?: string; children?: Snippet; actions?: Snippet } = $props()
</script>
<header class={`ui-card__heading ${className}`} data-layout={layout}>
  {#if title}<svelte:element this={`h${level}`} class="ui-card__title" id={titleId}>{title}</svelte:element>{/if}
  {#if hint}<p class="ui-card__hint" id={hintId}>{hint}</p>{/if}
  {@render children?.()}
  {#if actions}<div class="ui-card__actions">{@render actions()}</div>{/if}
</header>
