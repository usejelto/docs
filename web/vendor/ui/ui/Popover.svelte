<script lang="ts">
  import { Popover } from 'bits-ui'
  import type { Snippet } from 'svelte'
  import { actionClass } from './types'
  import Tooltip from './Tooltip.svelte'
  const generatedId = $props.id()
  let { open = $bindable(false), label, trigger, children, align = 'start', class: className = '',
    triggerRef = $bindable(null), triggerProps = {}, contentId = generatedId, tooltip }:
    { open?: boolean; label: string; trigger?: Snippet; children: Snippet; align?: 'start' | 'center' | 'end'; class?: string;
      triggerRef?: HTMLButtonElement | null; triggerProps?: Omit<Popover.TriggerProps, 'child' | 'children'>; contentId?: string; tooltip?: string } = $props()
</script>
<Popover.Root bind:open>
  <Popover.Trigger {...triggerProps} bind:ref={triggerRef} class={`${actionClass('secondary', 'compact')} ${triggerProps.class ?? ''}`}>
    {#snippet child({ props: popoverProps })}
      {#if tooltip}
        <Tooltip label={tooltip} disabled={open} triggerProps={popoverProps}>
          {#snippet children({ props })}
            <button {...props} data-state={popoverProps['data-state']}>
              {#if trigger}{@render trigger()}{:else}{label}{/if}
            </button>
          {/snippet}
        </Tooltip>
      {:else}
        <button {...popoverProps}>{#if trigger}{@render trigger()}{:else}{label}{/if}</button>
      {/if}
    {/snippet}
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
