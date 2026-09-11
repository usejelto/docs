<script lang="ts">
  import { Tooltip } from 'bits-ui'
  import type { Snippet } from 'svelte'
  import { actionClass } from './types'

  let { label, heading, hint, children, pressed, onclick, ...rest }: {
    label: string; heading: string; hint: string; children: Snippet; pressed: boolean; onclick: () => void;
    [key: `data-${string}`]: string | undefined
  } = $props()
</script>

<Tooltip.Provider delayDuration={0}>
  <Tooltip.Root>
    <Tooltip.Trigger {...rest} {onclick} aria-label={label} aria-pressed={pressed} class={`${actionClass('secondary', 'compact')} ui-icon-btn`}>
      {@render children()}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content role="tooltip" side="top" sideOffset={10} collisionPadding={12} class="tooltip-toggle">
        <strong>{heading}</strong>
        <span>{hint}</span>
        <Tooltip.Arrow class="tooltip-toggle__arrow" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>

<style>
  :global(.tooltip-toggle) { z-index: var(--layer-tooltip); display: grid; gap: var(--space-1); max-width: min(18rem, calc(100vw - 24px)); padding: var(--space-2) var(--space-3); border-radius: var(--radius-control); background: color-mix(in srgb, var(--surface) 82%, var(--ink)); color: var(--ink); box-shadow: var(--shadow-pop); font-size: var(--text-xs); line-height: 1.5; }
  :global(.tooltip-toggle strong) { font-weight: 600; }
  :global(.tooltip-toggle span:not(.tooltip-toggle__arrow)) { color: color-mix(in srgb, var(--ink) 85%, var(--surface)); }
  :global(.tooltip-toggle__arrow) { color: color-mix(in srgb, var(--surface) 82%, var(--ink)); }
</style>
