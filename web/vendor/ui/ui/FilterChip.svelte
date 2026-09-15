<script lang="ts">
  import type { Snippet } from 'svelte'
  import X from '@lucide/svelte/icons/x'
  import Tooltip from './Tooltip.svelte'
  let { label, removeLabel, onremove, children }:
    { label?: string; removeLabel: string; onremove: () => void; children?: Snippet } = $props()
</script>
<span class="ui-filter-chip">
  <span class="ui-filter-chip__label">{label}{@render children?.()}</span>
  <Tooltip label={removeLabel} triggerProps={{ 'aria-label': removeLabel, onclick: onremove }}>
    {#snippet children({ props })}
      <button {...props} type="button" class="ui-filter-chip__remove"><X size={14} strokeWidth={2} aria-hidden="true" /></button>
    {/snippet}
  </Tooltip>
</span>
