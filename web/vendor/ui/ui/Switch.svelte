<script lang="ts">
  // the dashboard specification §13 "Behaviour primitives" (v1.40): a boolean setting as
  // a real switch — Bits UI's Switch renders <button role="switch"
  // aria-checked> with roving keyboard support and a hidden input for forms;
  // the look is app.css's .ui-switch, drawn from §13's tokens through the
  // data-state attribute the primitive sets. The label and hint are ours, so
  // the control's accessible name is the label text (label for= id).
  import { Switch } from 'bits-ui'

  let {
    id,
    checked = $bindable(false),
    disabled = false,
    label,
    hint = undefined,
    describedby = undefined,
    name = undefined,
  }: {
    id: string
    checked?: boolean
    disabled?: boolean
    label: string
    hint?: string
    describedby?: string
    name?: string
  } = $props()
  const descriptionIds = $derived([...new Set(`${describedby ?? ''} ${hint ? `${id}-hint` : ''}`.split(/\s+/).filter(Boolean))].join(' ') || undefined)
</script>

<div class="ui-switch-row">
  <Switch.Root {id} {name} bind:checked {disabled} class="ui-switch" aria-labelledby={`${id}-label`} aria-describedby={descriptionIds}>
    <Switch.Thumb class="ui-switch__thumb" />
  </Switch.Root>
  <label class="ui-switch-row__text" for={id}>
    <strong id={`${id}-label`}>{label}</strong>
    {#if hint}<span id="{id}-hint">{hint}</span>{/if}
  </label>
</div>
