<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  let { title, description, children, density = 'default', class: className = '', ...rest }:
    Omit<HTMLAttributes<HTMLDivElement>, 'class'> & { title?: string; description?: string; children?: Snippet; density?: 'compact' | 'default'; class?: string } = $props()
</script>
<div {...rest} class={`ui-empty-state ${className}`} data-density={density}>{#if title}<p class="ui-empty-state__title">{title}</p>{/if}{#if description}<p class="ui-hint">{description}</p>{/if}{@render children?.()}</div>
