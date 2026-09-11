<script lang="ts">
  import Button from './Button.svelte'
  import type { ButtonProps } from './types'
  let { label, size = 'compact', variant = 'ghost', class: className = '', ref = $bindable(null), ...rest }:
    ButtonProps & { label: string } = $props()
</script>
<Button {...rest} bind:ref {size} {variant} aria-label={label} title={rest.title ?? label} class={`ui-icon-btn ${className}`} />
