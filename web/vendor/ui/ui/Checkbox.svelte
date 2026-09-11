<script lang="ts">
  // spec/dashboard.md §13 "Behaviour primitives" (v1.40): Bits UI's Checkbox —
  // <button role="checkbox" aria-checked> with a hidden input for forms — drawn
  // as app.css's .ui-checkbox. The indicator is a lucide check, shown from the
  // primitive's own `checked` snippet prop, never from a second copy of state.
  import type { Snippet } from 'svelte'
  import { Checkbox } from 'bits-ui'
  import Check from '@lucide/svelte/icons/check'

  let {
    id,
    checked = $bindable(false),
    disabled = false,
    label,
    hint = undefined,
    name = undefined,
    leading,
    metadata,
    onCheckedChange,
    compact = false,
  }: {
    id: string
    checked?: boolean
    disabled?: boolean
    label: string
    hint?: string
    name?: string
    leading?: Snippet
    metadata?: Snippet
    onCheckedChange?: (checked: boolean) => void
    compact?: boolean
  } = $props()
</script>

<div class="ui-check-row" data-compact={compact || undefined}>
  <Checkbox.Root {id} {name} bind:checked {disabled} {onCheckedChange} class="ui-checkbox" aria-labelledby={`${id}-label`} aria-describedby={hint ? `${id}-hint` : undefined}>
    {#snippet children({ checked: isChecked })}
      {#if isChecked}<Check size={12} strokeWidth={3} />{/if}
    {/snippet}
  </Checkbox.Root>
  <label class="ui-check-row__text" for={id}>
    <span class="ui-check-row__label" id={`${id}-label`}>{@render leading?.()}<strong>{label}</strong>{#if metadata}<span class="ui-check-row__metadata">{@render metadata()}</span>{/if}</span>
    {#if hint}<span id="{id}-hint">{hint}</span>{/if}
  </label>
</div>
