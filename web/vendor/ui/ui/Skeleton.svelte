<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  let { as = 'div', radius = 'control', pulse = false, shimmer = false, tone = 'ground', shape = 'block', class: className = '', children, ...rest }:
    Omit<HTMLAttributes<HTMLElement>, 'class'> & { as?: 'div' | 'span'; tone?: 'ground' | 'muted'; shape?: 'block' | 'ring'; radius?: 'small' | 'control' | 'card' | 'pill'; pulse?: boolean; shimmer?: boolean; class?: string; children?: Snippet } = $props()
</script>
<svelte:element this={as} {...rest} class={`ui-skeleton ${className}`} data-tone={tone} data-shape={shape} data-radius={radius} data-pulse={(pulse && !shimmer) || undefined} data-shimmer={shimmer || undefined}>{@render children?.()}</svelte:element>
