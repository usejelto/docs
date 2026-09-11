<script lang="ts">
  import { getContext } from 'svelte'
  import type { HTMLTextareaAttributes } from 'svelte/elements'
  import { FIELD, type FieldContext } from './field'
  let { value = $bindable(''), id, rows = 4, class: className = '', ref = $bindable(null), ...rest }:
    Omit<HTMLTextareaAttributes, 'class'> & { class?: string; ref?: HTMLTextAreaElement | null } = $props()
  const field = getContext<FieldContext | undefined>(FIELD)
</script>
<textarea {...rest} id={id ?? field?.id} {rows} bind:value bind:this={ref} class={`ui-field ui-textarea ${className}`}
  aria-invalid={rest['aria-invalid'] ?? (field?.invalid || undefined)} aria-describedby={rest['aria-describedby'] ?? field?.describedby}></textarea>
