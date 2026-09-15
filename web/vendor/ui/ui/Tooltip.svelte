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
        {@render children({ props: { ...props, 'aria-describedby': [...new Set([
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
