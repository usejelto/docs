<script lang="ts">
  import { Tabs } from 'bits-ui'
  let { class: className = '', ref = $bindable(null), variant = 'plain', children, ...rest }: Tabs.ListProps & { variant?: 'plain' | 'segmented' } = $props()
  type Indicator = { x: number; y: number; width: number; height: number }
  let indicator = $state<Indicator | null>(null)
  let moving = $state(false)

  // One selected surface for every segmented tab list. DOM observation also
  // covers controlled selections, dynamic tabs and labels with changing counts.
  $effect(() => {
    const element = ref
    indicator = null
    moving = false
    if (!element || variant !== 'segmented') return
    const list = element
    let frame = 0
    let previousTab: HTMLElement | null = null
    let previousBox: Indicator | null = null
    const observed = new Set<Element>()
    function measure() {
      const active = list.querySelector<HTMLElement>(':scope > [role="tab"][data-state="active"]')
      const box = active?.getBoundingClientRect()
      if (!box?.width || !box.height) {
        indicator = null
        moving = false
        previousTab = null
        previousBox = null
        return
      }
      const parent = list.getBoundingClientRect()
      const next = {
        x: box.left - parent.left + list.scrollLeft - list.clientLeft,
        y: box.top - parent.top + list.scrollTop - list.clientTop,
        width: box.width,
        height: box.height,
      }
      // Repeated observer/scroll notifications must not interrupt a transition
      // that already has the right target. Reflow itself snaps to the new box.
      if (active === previousTab && previousBox?.x === next.x && previousBox.y === next.y
        && previousBox.width === next.width && previousBox.height === next.height) return
      moving = previousBox !== null && active !== previousTab
      indicator = next
      previousTab = active
      previousBox = next
    }
    function schedule() {
      if (frame !== 0) return
      frame = requestAnimationFrame(() => {
        frame = 0
        measure()
      })
    }
    const resize = new ResizeObserver(schedule)
    resize.observe(list)
    function observeTabs() {
      const tabs = new Set(list.querySelectorAll(':scope > [role="tab"]'))
      for (const tab of observed) if (!tabs.has(tab)) { resize.unobserve(tab); observed.delete(tab) }
      for (const tab of tabs) if (!observed.has(tab)) { resize.observe(tab); observed.add(tab) }
      schedule()
    }
    const mutation = new MutationObserver(observeTabs)
    mutation.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-state'] })
    list.addEventListener('scroll', schedule, { passive: true })
    observeTabs()
    // Place the first surface before paint, without animating from a 0 × 0 box.
    measure()
    return () => {
      cancelAnimationFrame(frame)
      mutation.disconnect()
      resize.disconnect()
      list.removeEventListener('scroll', schedule)
    }
  })
</script>
<Tabs.List {...rest} bind:ref class={`ui-tabs ui-pill-group${variant === 'segmented' ? ' ui-pill-group--seg' : ''} ${className}`} data-indicator-ready={indicator !== null || undefined} data-indicator-motion={moving || undefined}>
  {#if variant === 'segmented'}
    <span class="ui-tabs__indicator" aria-hidden="true"
      style:transform={`translate(${indicator?.x ?? 0}px, ${indicator?.y ?? 0}px)`}
      style:width={`${indicator?.width ?? 0}px`} style:height={`${indicator?.height ?? 0}px`}></span>
  {/if}
  {@render children?.()}
</Tabs.List>
