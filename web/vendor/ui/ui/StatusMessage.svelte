<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { StatusTone } from './types'
  let { as = 'p', tone = 'neutral', live = 'off', class: className = '', children, ...rest }:
    Omit<HTMLAttributes<HTMLElement>, 'class'> & { as?: 'p' | 'span' | 'div'; tone?: StatusTone; live?: 'off' | 'polite' | 'assertive'; class?: string; children: Snippet } = $props()
</script>
<svelte:element this={as} {...rest} class={`ui-status-message ${className}`} data-tone={tone}
  role={rest.role ?? (live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined)}>{@render children()}</svelte:element>
