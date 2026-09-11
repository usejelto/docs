<script lang="ts" generics="T extends string | number | undefined = string">
  import { getContext } from 'svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { FIELD, type FieldContext } from './field'
  let { value = $bindable('' as T), type = 'text', id, class: className = '', data = false,
    ref = $bindable(null), ...rest }:
    Omit<HTMLInputAttributes, 'value' | 'class'> & { value?: T; class?: string; data?: boolean; ref?: HTMLInputElement | null } = $props()
  const field = getContext<FieldContext | undefined>(FIELD)
</script>
<input {...rest} id={id ?? field?.id} {type} bind:value bind:this={ref}
  class={`ui-field${data ? ' ui-field--data' : ''} ${className}`}
  aria-invalid={rest['aria-invalid'] ?? (field?.invalid || undefined)}
  aria-describedby={rest['aria-describedby'] ?? field?.describedby} />
