<script lang="ts">
  import { animateHeight } from './motion'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  let { as = 'section', density = 'default', class: className = '', ref = $bindable(null), header, footer, children, ...rest }:
    Omit<HTMLAttributes<HTMLElement>, 'class'> & { as?: 'section' | 'article' | 'div' | 'a'; density?: 'compact' | 'default'; href?: string; class?: string; ref?: HTMLElement | null; header?: Snippet; footer?: Snippet; children?: Snippet } = $props()
</script>
<svelte:element use:animateHeight this={as} {...rest} bind:this={ref} class={`ui-card ${className}`} data-density={density}>
  {#if header}<header class="ui-card__heading">{@render header()}</header>{/if}
  {@render children?.()}
  {#if footer}<footer class="ui-card__footer">{@render footer()}</footer>{/if}
</svelte:element>
