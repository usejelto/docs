<script module lang="ts">
  export interface SelectOption {
    value: string
    label: string
  }
</script>

<script lang="ts" generics="T extends string = string">
  import { Select } from 'bits-ui'
  import './selection.css'
  import Check from '@lucide/svelte/icons/check'
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  import ChevronUp from '@lucide/svelte/icons/chevron-up'
  import { getContext, type Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { FIELD, type FieldContext } from './field'
  import SelectionInput from './SelectionInput.svelte'

  let {
    options,
    value = $bindable('' as T),
    label,
    labelledby,
    placeholder = '',
    displayLabel,
    appearance = 'field',
    icon,
    optionIcon,
    align = 'start',
    disabled = false,
    required = false,
    name,
    id,
    triggerProps = {},
    ref = $bindable(null),
    onValueChange,
  }: {
    options: readonly SelectOption[]
    value?: T
    label: string
    labelledby?: string
    placeholder?: string
    /** Optional compact trigger label; the menu retains each complete option. */
    displayLabel?: string
    appearance?: 'field' | 'compact' | 'pill' | 'quiet'
    optionIcon?: Snippet<[SelectOption]>
    icon?: Snippet
    align?: 'start' | 'end'
    disabled?: boolean
    required?: boolean
    name?: string
    id?: string
    ref?: HTMLButtonElement | null
    triggerProps?: HTMLButtonAttributes
    onValueChange?: (value: T) => void
  } = $props()

  const field = getContext<FieldContext | undefined>(FIELD)
  const uid = $props.id()
  let missingRequired = $state(false)
  $effect(() => { if (value || disabled || !required) missingRequired = false })

  // Bits reserves the empty string for no selection. Encode every option so
  // Pages' real "All" choice (value="") still gets a selected checkmark.
  const items = $derived(options.map((option) => ({ ...option, value: `option:${option.value}` })))
  const selected = $derived(options.find((option) => option.value === value))
  const selection = $derived(selected ? `option:${selected.value}` : '')
  const text = $derived(displayLabel ?? selected?.label ?? placeholder)
</script>

<Select.Root
  type="single"
  bind:value={() => selection, (next) => {
    if (!next.startsWith('option:')) return
    const nextValue = next.slice('option:'.length) as T
    value = nextValue
    onValueChange?.(nextValue)
  }}
  {items}
  {disabled}
  allowDeselect={false}
>
  <Select.Trigger
    {...triggerProps}
    bind:ref
    id={id ?? field?.id}
    class={`card-select__trigger ${triggerProps.class ?? ''}`}
    aria-label={labelledby ? undefined : label}
    aria-labelledby={labelledby}
    aria-describedby={[triggerProps['aria-describedby'] ?? field?.describedby, required ? `${uid}-required` : undefined].filter(Boolean).join(' ') || undefined}
    aria-invalid={triggerProps['aria-invalid'] ?? (field?.invalid || missingRequired || undefined)}
    title={triggerProps.title ?? text}
    data-appearance={appearance}
    data-value={value}
  >
    {#if icon}<span class="card-select__icon" aria-hidden="true">{@render icon()}</span>{/if}
    <span class="card-select__value">{text}</span>
    <ChevronDown size={14} strokeWidth={1.5} class="card-select__chevron" aria-hidden="true" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content
      class="card-select__menu"
      sideOffset={6}
      {align}
      collisionPadding={12}
      preventScroll={false}
      aria-label={label}
    >
      <Select.ScrollUpButton class="card-select__scroll" aria-hidden="true">
        <ChevronUp size={14} />
      </Select.ScrollUpButton>
      <Select.Viewport class="card-select__viewport">
        <Select.Group>
          <Select.GroupHeading class="card-select__heading">{label}</Select.GroupHeading>
          {#each options as item (item.value)}
            <Select.Item class="card-select__option" value={`option:${item.value}`} label={item.label}>
              {#snippet children({ selected })}
                <span class="card-select__option-label" class:card-select__option-label--icon={!!optionIcon}>
                  {#if optionIcon}<span class="card-select__icon" aria-hidden="true">{@render optionIcon(item)}</span>{/if}
                  {item.label}
                </span>
                <span class="card-select__check" aria-hidden="true">
                  {#if selected}<Check size={16} strokeWidth={2} />{/if}
                </span>
              {/snippet}
            </Select.Item>
          {/each}
        </Select.Group>
      </Select.Viewport>
      <Select.ScrollDownButton class="card-select__scroll" aria-hidden="true">
        <ChevronDown size={14} />
      </Select.ScrollDownButton>
    </Select.Content>
  </Select.Portal>
</Select.Root>
{#if required}<span class="sr-only" id={`${uid}-required`}>Required</span>{/if}
<SelectionInput {name} {value} {disabled} {required} trigger={ref} oninvalid={() => missingRequired = true} />
