<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  let { chart, details, class: className = '', ...rest }:
    Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
      chart?: Snippet
      details: Snippet
      class?: string
    } = $props()
</script>

<div {...rest} class={`ui-chart-split ${className}`}>
  <div class="ui-chart-split__layout" data-split={chart ? '' : undefined}>
    {#if chart}<div class="ui-chart-split__chart">{@render chart()}</div>{/if}
    <div class="ui-chart-split__details">{@render details()}</div>
  </div>
</div>

<style>
  .ui-chart-split { container: chart-split / inline-size; min-inline-size: 0; }
  .ui-chart-split__layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-4); align-items: start; }
  .ui-chart-split__layout[data-split] { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
  .ui-chart-split__chart, .ui-chart-split__details { min-inline-size: 0; }
  @container chart-split (max-width: 720px) {
    .ui-chart-split__layout[data-split] { grid-template-columns: minmax(0, 1fr); }
  }
</style>
