<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { StatusTone } from './types'
  let { tone = 'neutral', class: className = '', children, ...rest }:
    Omit<HTMLAttributes<HTMLSpanElement>, 'class'> & { tone?: StatusTone; class?: string; children: Snippet } = $props()
</script>
<span {...rest} class={`ui-badge ${className}`} data-tone={tone}>{@render children()}</span>
