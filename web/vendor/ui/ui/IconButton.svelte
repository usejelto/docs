<script lang="ts">
  import Button from './Button.svelte'
  import Tooltip from './Tooltip.svelte'
  import type { ButtonProps } from './types'
  let { label, title, hint, shortcut, children: icon, size = 'compact', variant = 'ghost', class: className = '', ref = $bindable(null), ...rest }:
    ButtonProps & { label: string; hint?: string; shortcut?: readonly string[] } = $props()
</script>
<Tooltip label={title ?? label} {hint} {shortcut} disabled={rest.disabled || rest.loading}
  triggerProps={{ ...rest, id: rest.id ?? undefined, disabled: rest.disabled || rest.loading, 'aria-label': label }}>
  {#snippet children({ props })}
    <Button {...props} bind:ref {size} {variant} class={`ui-icon-btn ${className}`}>
      {@render icon?.()}
    </Button>
  {/snippet}
</Tooltip>
