<script lang="ts">
  import type { Snippet } from 'svelte'
  let { title, hint, level = 1, class: className = '', children, actions }:
    { title?: string; hint?: string; level?: 1 | 2 | 3; class?: string; children?: Snippet; actions?: Snippet } = $props()
</script>
<header class={`ui-page-header ${className}`}>
  <div class="ui-page-header__text">
    {#if title}<svelte:element this={`h${level}`}>{title}</svelte:element>{/if}
    {#if hint}<p class="ui-hint">{hint}</p>{/if}
    {@render children?.()}
  </div>
  {#if actions}<div class="ui-page-header__actions">{@render actions()}</div>{/if}
</header>
