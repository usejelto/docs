<script lang="ts">
  import type { Snippet } from 'svelte'
  let { label, class: className = '', children }:
    { label: string; class?: string; children: Snippet } = $props()
</script>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (A named scrolling region needs keyboard access.) -->
<div class={`ui-table-container ${className}`} role="region" aria-label={label} tabindex="0">
  {@render children()}
</div>
