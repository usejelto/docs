<script lang="ts">
  import { Popover } from 'bits-ui'
  import type { Snippet } from 'svelte'
  import { actionClass } from './types'
  const generatedId = $props.id()
  let { open = $bindable(false), label, trigger, children, align = 'start', class: className = '',
    triggerRef = $bindable(null), triggerProps = {}, contentId = generatedId }:
    { open?: boolean; label: string; trigger?: Snippet; children: Snippet; align?: 'start' | 'center' | 'end'; class?: string;
      triggerRef?: HTMLButtonElement | null; triggerProps?: Omit<Popover.TriggerProps, 'child' | 'children'>; contentId?: string } = $props()
</script>
<Popover.Root bind:open>
  <Popover.Trigger {...triggerProps} bind:ref={triggerRef} class={`${actionClass('secondary', 'compact')} ${triggerProps.class ?? ''}`}>
    {#if trigger}{@render trigger()}{:else}{label}{/if}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content id={contentId} role="dialog" trapFocus={false} class={`ui-popover ${className}`} aria-label={label} {align} sideOffset={8} collisionPadding={12}>
      {#snippet child({ props, wrapperProps })}
        <div {...wrapperProps}>
          <div {...props} id={contentId}>{@render children()}</div>
        </div>
      {/snippet}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
