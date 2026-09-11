<script lang="ts" generics="T extends string = string">
  import { getContext, type Snippet } from 'svelte'
  import type { HTMLSelectAttributes } from 'svelte/elements'
  import { FIELD, type FieldContext } from './field'
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  let { value = $bindable('' as T), id, class: className = '', size = 'default', appearance = 'default', ref = $bindable(null), children, ...rest }:
    Omit<HTMLSelectAttributes, 'value' | 'size' | 'multiple' | 'class'> & {
      value?: T; class?: string; appearance?: 'default' | 'quiet'; size?: 'compact' | 'default'; ref?: HTMLSelectElement | null; children: Snippet
    } = $props()
  const field = getContext<FieldContext | undefined>(FIELD)
</script>
<span class="ui-native-select-wrap" data-inline={size === 'compact' || appearance === 'quiet' || undefined}>
  <select {...rest} data-appearance={appearance} id={id ?? field?.id} bind:value bind:this={ref}
    class={`ui-field ui-native-select${size === 'compact' ? ' ui-native-select--compact' : ''} ${className}`}
    aria-invalid={rest['aria-invalid'] ?? (field?.invalid || undefined)} aria-describedby={rest['aria-describedby'] ?? field?.describedby}>
    {@render children()}
  </select>
  <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" />
</span>
