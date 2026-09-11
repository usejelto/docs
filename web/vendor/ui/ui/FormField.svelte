<script lang="ts">
  import { setContext, type Snippet } from 'svelte'
  import { FIELD, type FieldContext } from './field'
  const generatedId = $props.id()
  let { id = generatedId, label, hint, error, hintId, errorId, required = false, class: className = '', children }:
    { id?: string; label: string; hintId?: string; errorId?: string; hint?: string; error?: string; required?: boolean; class?: string; children: Snippet<[FieldContext]> } = $props()
  const field: FieldContext = {
    get id() { return id },
    get describedby() { return [hint && (hintId ?? `${id}-hint`), error && (errorId ?? `${id}-error`)].filter(Boolean).join(' ') || undefined },
    get invalid() { return Boolean(error) },
  }
  setContext(FIELD, field)
</script>
<div class={`ui-form-field ${className}`}>
  <label class="ui-label" for={id}>{label}{#if required}<span aria-hidden="true"> *</span>{/if}</label>
  {@render children(field)}
  {#if hint}<p class="ui-hint" id={hintId ?? `${id}-hint`}>{hint}</p>{/if}
  {#if error}<p class="ui-error" id={errorId ?? `${id}-error`}>{error}</p>{/if}
</div>
