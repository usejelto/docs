<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes, HTMLFormAttributes } from 'svelte/elements'
  import { focusInvalid } from './field'
  let { as = 'section', variant = 'plain', tone = 'neutral', class: className = '', children, ...rest }:
    Omit<HTMLAttributes<HTMLElement> & HTMLFormAttributes, 'class'> & { as?: 'section' | 'div' | 'form'; variant?: 'plain' | 'panel'; tone?: 'neutral' | 'danger'; class?: string; children: Snippet } = $props()
  function enhance(node: HTMLElement) {
    if (node instanceof HTMLFormElement) return focusInvalid(node)
  }
</script>
<svelte:element this={as} {...rest} use:enhance class={`ui-form-section ${className}`} data-variant={variant} data-tone={tone}>{@render children()}</svelte:element>
