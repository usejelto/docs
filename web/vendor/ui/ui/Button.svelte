<script lang="ts">
  import LoaderCircle from '@lucide/svelte/icons/loader-circle'
  import { actionClass, type ButtonProps } from './types'
  let { variant = 'secondary', size = 'default', loading = false, static: stationary = false,
    disabled = false, pressed, layout = 'default', type = 'button', class: className = '', ref = $bindable(null),
    children, onclick, ...rest }: ButtonProps = $props()
</script>

<button {...rest} bind:this={ref} {type} disabled={disabled || loading}
  onclick={(event) => {
    if (disabled || loading) { event.preventDefault(); return }
    onclick?.(event)
  }}
  aria-pressed={pressed ?? rest['aria-pressed']} data-layout={layout} aria-busy={loading || undefined} data-static={stationary || undefined}
  class={`${actionClass(variant, size)} ${className}`}>
  {#if loading}<LoaderCircle class="ui-loading-icon" size={16} strokeWidth={2} aria-hidden="true" />{/if}
  {@render children?.()}
</button>
