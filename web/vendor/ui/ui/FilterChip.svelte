<script lang="ts">
  import type { Snippet } from 'svelte'
  import X from '@lucide/svelte/icons/x'
  let { label, removeLabel, onremove, children }:
    { label?: string; removeLabel: string; onremove: () => void; children?: Snippet } = $props()
</script>
<span class="ui-filter-chip">
  <span class="ui-filter-chip__label">{label}{@render children?.()}</span>
  <button type="button" class="ui-filter-chip__remove" aria-label={removeLabel} onclick={onremove}><X size={14} strokeWidth={2} aria-hidden="true" /></button>
</span>
