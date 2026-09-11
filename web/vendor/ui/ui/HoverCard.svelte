<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HoverCardSide } from './hoverCard'

  interface Props {
    /** Keep the surface mounted so enter/exit motion is interruptible. */
    open?: boolean
    /** A caller-owned hook for content-specific layout or tests. */
    class?: string
    /** Exposes the surface for viewport-aware positioning measurements. */
    element?: HTMLDivElement | null
    minWidth?: string
    maxWidth?: string
    /** Visual-only charts already expose the same values in their details view. */
    decorative?: boolean
    /** Associates a semantic tooltip with its keyboard/pointer trigger. */
    id?: string
    /** The placement utility feeds the entrance direction back to the surface. */
    side?: HoverCardSide
    /** LayerChart owns position motion; `none` avoids a second moving transform. */
    motion?: 'surface' | 'none'
    children: Snippet
  }

  let {
    open = false,
    class: className = '',
    element = $bindable(null),
    minWidth = '12rem',
    maxWidth = 'min(18rem, calc(100vw - 1rem))',
    decorative = false,
    id = undefined,
    side = 'top',
    motion = 'surface',
    children,
  }: Props = $props()
</script>

<div
  bind:this={element}
  class={className === '' ? 'hover-card' : `hover-card ${className}`}
  class:hover-card--open={open}
  class:hover-card--below={side === 'bottom'}
  class:hover-card--still={motion === 'none'}
  data-hover-card
  data-state={open ? 'open' : 'closed'}
  data-side={side}
  {id}
  role={decorative ? undefined : 'tooltip'}
  aria-hidden={decorative || !open}
  style:min-width={minWidth}
  style:max-width={maxWidth}
>
  {@render children()}
</div>

<style>
  .hover-card {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-control);
    background: var(--surface);
    box-shadow: var(--shadow-pop);
    color: var(--ink);
    font-size: var(--text-sm);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translate3d(0, 8px, 0);
    transition:
      opacity var(--motion-fast) var(--ease),
      transform var(--motion-fast) var(--ease),
      visibility 0s linear var(--motion-fast);
  }

  .hover-card--below {
    transform: translate3d(0, -8px, 0);
  }

  .hover-card--open {
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, 0, 0);
    transition: none;
  }

  .hover-card--still {
    transform: none;
    transition: opacity var(--motion-fast) var(--ease), visibility 0s linear var(--motion-fast);
  }

  .hover-card--still.hover-card--open {
    transition: none;
  }

  .hover-card :global(.hover-card__title) {
    margin: 0;
    font-weight: var(--weight-emphasis);
    line-height: var(--leading-readout);
    overflow-wrap: anywhere;
  }

  .hover-card :global(.hover-card__eyebrow) {
    margin: 0 0 var(--space-1);
    color: var(--muted);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }

  .hover-card :global(.hover-card__rows) {
    display: flex;
    flex-direction: column;
    gap: var(--space-half);
    margin: var(--space-1) 0 0;
    padding: 0;
    list-style: none;
  }

  .hover-card :global(.hover-card__row) {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    min-width: 0;
  }

  .hover-card :global(.hover-card__label) {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--muted);
    overflow-wrap: anywhere;
  }

  .hover-card :global(.hover-card__value) {
    flex: none;
    margin-inline-start: auto;
    font-weight: var(--weight-emphasis);
    font-variant-numeric: tabular-nums;
  }

  .hover-card :global(.hover-card__divider) {
    margin-top: var(--space-1);
    padding-top: var(--space-1);
    border-top: 1px solid var(--rule);
  }

  @media (prefers-reduced-motion: reduce) {
    .hover-card {
      transform: none;
      transition: opacity var(--motion-fast) var(--ease), visibility 0s linear var(--motion-fast) !important;
    }

    .hover-card--open {
      transition: none !important;
    }
  }
</style>
