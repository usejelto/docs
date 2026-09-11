<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  let { class: className = '', children, ...rest }:
    Omit<HTMLAttributes<HTMLDivElement>, 'class'> & { class?: string; children: Snippet } = $props()
</script>
<!-- A wrapping layout, not an ARIA toolbar: each child keeps normal Tab order. -->
<div {...rest} class={`ui-toolbar ${className}`}>{@render children()}</div>
