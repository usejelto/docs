<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  let { href, current = false, variant = 'default', class: className = '', children, ...rest }:
    Omit<HTMLAnchorAttributes, 'class' | 'href'> & { href: string; current?: boolean; variant?: 'default' | 'sidebar' | 'secondary' | 'list'; class?: string; children: Snippet } = $props()
</script>
<a {...rest} data-variant={variant} {href} class={`ui-pill ${className}`} aria-current={current ? 'page' : rest['aria-current']}>{@render children()}</a>
