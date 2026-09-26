<script lang="ts">
  // §13 v1.133: inline content — an add form, a custom range — grows into place
  // and folds away. The {#if} lives here, so the transition is local: content
  // that is already open when its owner renders never animates.
  import type { Snippet } from 'svelte'
  import { revealHeight } from './motion'

  let { open, class: className = '', children }: { open: boolean; class?: string; children: Snippet } = $props()
</script>

{#if open}
  <div class={`ui-reveal ${className}`.trim()} in:revealHeight out:revealHeight>{@render children()}</div>
{/if}
