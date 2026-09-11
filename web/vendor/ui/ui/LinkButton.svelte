<script lang="ts">
  import { actionClass, type LinkButtonProps } from './types'
  let { href, disabled = false, variant = 'secondary', size = 'default', class: className = '', ref = $bindable(null), children, ...rest }:
    LinkButtonProps = $props()
  const disabledProps = $derived(Object.fromEntries(Object.entries(rest).filter(([key]) => /^(aria-|data-)/.test(key) || ['id', 'title'].includes(key))))
</script>
{#if disabled}
  <span {...disabledProps} class={`${actionClass(variant, size)} ${className}`} aria-disabled="true">{@render children?.()}</span>
{:else}
<a {...rest} {href} bind:this={ref} class={`${actionClass(variant, size)} ${className}`}>{@render children?.()}</a>

{/if}
