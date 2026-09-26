<script module lang="ts">
  // The resting mouse position. A trigger that mounts under it — the header a
  // click navigation remounts — was not hovered on purpose, so it waits for the
  // pointer to leave before hovering can open it again (dashboard §13 v1.133).
  let pointer: { x: number; y: number } | null = null
  if (typeof document !== 'undefined') {
    const rest = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') pointer = { x: event.clientX, y: event.clientY }
    }
    // A click marks the spot even when no move preceded it.
    document.addEventListener('pointermove', rest, { capture: true, passive: true })
    document.addEventListener('pointerdown', rest, { capture: true, passive: true })
  }
  function underRestingPointer(node: HTMLElement): boolean {
    if (!pointer) return false
    const bounds = node.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return false
    return pointer.x >= bounds.left && pointer.x <= bounds.right && pointer.y >= bounds.top && pointer.y <= bounds.bottom
  }
</script>

<script lang="ts">
  import { Tooltip as Primitive } from 'bits-ui'
  const contentId = $props.id()

  let { label, hint, shortcut = [], disabled = false, delayDuration = 350, side = 'bottom',
    triggerProps = {}, triggerRef = $bindable(null), children }: {
    label: string
    hint?: string
    shortcut?: readonly string[]
    disabled?: boolean
    delayDuration?: number
    side?: 'top' | 'right' | 'bottom' | 'left'
    triggerProps?: Omit<Primitive.TriggerProps, 'child' | 'children'>
    triggerRef?: HTMLElement | null
    children: NonNullable<Primitive.TriggerProps['child']>
  } = $props()

  let portalTarget = $state<HTMLElement | undefined>()
  let resting = $state(false)
  let checked: HTMLElement | null = null
  $effect(() => {
    if (!triggerRef || triggerRef === checked) return
    checked = triggerRef
    resting = underRestingPointer(triggerRef)
  })
  function ignore() {}
  type TriggerChildProps = Parameters<NonNullable<Primitive.TriggerProps['child']>>[0]['props']
  function hoverProps(props: TriggerChildProps): TriggerChildProps {
    if (!resting) return props
    const leave = props.onpointerleave as ((event: PointerEvent) => void) | undefined
    // Keep every handler key: a spread listener must not become undefined.
    return {
      ...props,
      onpointerenter: ignore,
      onpointermove: ignore,
      onpointerleave: (event: PointerEvent) => {
        resting = false
        leave?.(event)
      },
    }
  }
  function onOpenChange(open: boolean) {
    if (!open || !triggerRef) return
    // Recheck on opening: a map can enter fullscreen after this control mounts.
    const fullscreen = triggerRef.ownerDocument.fullscreenElement
    portalTarget = triggerRef.closest('dialog') ??
      (fullscreen instanceof HTMLElement && fullscreen.contains(triggerRef) ? fullscreen : undefined)
  }
</script>

<Primitive.Provider {delayDuration} ignoreNonKeyboardFocus>
  <Primitive.Root {disabled} {onOpenChange}>
    <Primitive.Trigger {...triggerProps} bind:ref={triggerRef}>
      {#snippet child({ props })}
        {@render children({ props: { ...hoverProps(props), 'aria-describedby': [...new Set([
          triggerProps['aria-describedby'], props['aria-describedby'],
        ].filter(Boolean))].join(' ') || undefined } })}
      {/snippet}
    </Primitive.Trigger>
    <Primitive.Portal to={portalTarget}>
      <Primitive.Content id={contentId} role="tooltip" {side} align="center" sideOffset={6} collisionPadding={12} class="ui-tooltip">
        {#snippet child({ props, wrapperProps })}
          <div {...wrapperProps}>
            <div {...props} id={contentId}>
              <span class="ui-tooltip__row">
                <span>{label}</span>
                {#if shortcut.length}
                  <span class="ui-tooltip__shortcut" aria-hidden="true">{#each shortcut as key}<kbd>{key}</kbd>{/each}</span>
                {/if}
              </span>
              {#if hint}<span class="ui-tooltip__hint">{hint}</span>{/if}
            </div>
          </div>
        {/snippet}
      </Primitive.Content>
    </Primitive.Portal>
  </Primitive.Root>
</Primitive.Provider>
