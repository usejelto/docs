<script module lang="ts">
  export interface ComboboxOption {
    value: string
    label: string
    description?: string
    trailingText?: string
    keywords?: readonly string[]
  }

  export interface ComboboxCreateAction {
    label: string
    href: string
    onclick?: (event: MouseEvent) => void
  }
</script>

<script lang="ts" generics="T extends string = string">
  import { Combobox, Popover } from 'bits-ui'
  import { flushSync, getContext } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import Check from '@lucide/svelte/icons/check'
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  import Plus from '@lucide/svelte/icons/plus'
  import Search from '@lucide/svelte/icons/search'
  import LinkButton from './LinkButton.svelte'
  import { FIELD, type FieldContext } from './field'
  import SelectionInput from './SelectionInput.svelte'
  import './selection.css'

  let {
    options, value = $bindable('' as T), label, searchPlaceholder, emptyLabel,
    placeholder = '', appearance = 'field', disabled = false, createAction,
    name, id, triggerProps = {}, ref = $bindable(null), onValueChange, required = false,
  }: {
    options: readonly ComboboxOption[]
    value?: T
    label: string
    searchPlaceholder: string
    emptyLabel: string
    placeholder?: string
    appearance?: 'field' | 'compact' | 'quiet'
    disabled?: boolean
    required?: boolean
    createAction?: ComboboxCreateAction
    name?: string
    id?: string
    triggerProps?: HTMLButtonAttributes
    ref?: HTMLButtonElement | null
    onValueChange?: (value: T) => void
  } = $props()

  const field = getContext<FieldContext | undefined>(FIELD)
  let missingRequired = $state(false)
  $effect(() => { if (value || disabled || !required) missingRequired = false })
  const uid = $props.id()
  const listId = `${uid}-options`
  let open = $state(false)
  $effect(() => { if (disabled) open = false })
  let search = $state('')
  let input = $state<HTMLInputElement | null>(null)
  let action = $state<HTMLAnchorElement | null>(null)
  let panel = $state<HTMLDivElement | null>(null)
  const selected = $derived(options.find((option) => option.value === value))
  const text = $derived(selected?.label ?? placeholder)
  // Keep empty-string options distinct from Bits' unselected value.
  const items = $derived(options.map((option) => ({ ...option, value: `option:${option.value}` })))
  const selection = $derived(selected ? `option:${selected.value}` : '')
  const searchTerms = $derived(normalizeSearch(search).split(/\s+/).filter(Boolean))
  const matches = $derived(items.filter((option) => {
    const haystack = normalizeSearch([option.label, option.description, ...(option.keywords ?? [])].filter(Boolean).join(' '))
    return searchTerms.every(term => haystack.includes(term))
  }))

  function normalizeSearch(value: string) {
    return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[_/]+/g, ' ').trim()
  }

  function inputKeydown(event: KeyboardEvent) {
    // The creation link sits outside the listbox; Tab moves to it without
    // interpreting it as a value or letting the inner combobox close first.
    if (event.key === 'Tab' && !event.shiftKey && action) {
      event.preventDefault()
      action.focus()
    }
  }

  function actionKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault()
      input?.focus()
    }
  }
</script>

{#snippet richOption(option: ComboboxOption)}
  <span class="ui-combobox__summary">
    <span class="ui-combobox__copy">
      <span>{option.label}</span>
      {#if option.description}<span class="ui-combobox__description">{option.description}</span>{/if}
    </span>
    {#if option.trailingText}<bdi class="ui-combobox__trailing">{option.trailingText}</bdi>{/if}
  </span>
{/snippet}

<Popover.Root bind:open onOpenChange={() => { search = '' }}>
  <Popover.Trigger
    {...triggerProps}
    bind:ref
    id={id ?? field?.id}
    {disabled}
    class={`card-select__trigger ui-combobox__trigger ${triggerProps.class ?? ''}`}
    aria-label={label}
    aria-describedby={[triggerProps['aria-describedby'] ?? field?.describedby, selected ? `${uid}-value` : undefined, required ? `${uid}-required` : undefined].filter(Boolean).join(' ') || undefined}
    aria-invalid={triggerProps['aria-invalid'] ?? (field?.invalid || missingRequired || undefined)}
    title={[text, selected?.description, selected?.trailingText].filter(Boolean).join(' · ')}
    data-appearance={appearance}
    data-value={value}
    onkeydown={(event) => {
      triggerProps.onkeydown?.(event)
      if (!disabled && !event.defaultPrevented && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        open = true
        search = ''
      }
    }}
  >
    {#if selected && (selected.description || selected.trailingText)}
      <span id={`${uid}-value`} class="ui-combobox__rich-value">{@render richOption(selected)}</span>
    {:else}
      <span id={`${uid}-value`} class="card-select__value">{text}</span>
    {/if}
    <ChevronDown size={14} strokeWidth={1.5} class="card-select__chevron" aria-hidden="true" />
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content
      bind:ref={panel}
      class="card-select__menu ui-combobox__menu"
      data-appearance={appearance}
      role="dialog"
      aria-label={label}
      align="start"
      sideOffset={6}
      collisionPadding={12}
      trapFocus={false}
      onOpenAutoFocus={(event) => { event.preventDefault(); input?.focus() }}
    >
      <Combobox.Root
        type="single"
        {disabled}
        open={true}
        bind:value={() => selection, (next) => {
          if (disabled || !next.startsWith('option:')) return
          const nextValue = next.slice('option:'.length) as T
          value = nextValue
          onValueChange?.(nextValue)
        }}
        inputValue={search}
        {items}
        allowDeselect={false}
        onOpenChange={(next) => { if (!next) open = false }}
      >
        <div class="ui-combobox__search">
          <Search size={16} strokeWidth={1.5} aria-hidden="true" />
          <Combobox.Input
            bind:ref={input}
            class="ui-combobox__input"
            aria-label={searchPlaceholder}
            aria-required={required || undefined}
            aria-controls={listId}
            placeholder={searchPlaceholder}
            autocomplete="off"
            oninput={(event) => {
              // Bits highlights the first candidate in its input handler.
              // Filter the DOM first so it cannot retain a removed option.
              const query = event.currentTarget.value
              flushSync(() => { search = query })
            }}
            onkeydown={inputKeydown}
          />
        </div>
        <Combobox.ContentStatic
          id={listId}
          class="ui-combobox__list"
          aria-label={label}
          onInteractOutside={(event) => {
            if (event.target instanceof Node && panel?.contains(event.target)) event.preventDefault()
          }}
        >
          {#snippet child({ props })}
            <div {...props} id={listId}>
              <Combobox.Viewport class="card-select__viewport">
                {#each matches as item (item.value)}
                  <Combobox.Item class="card-select__option" value={item.value} label={item.label}>
                    {#snippet children({ selected })}
                      {#if item.description || item.trailingText}
                        {@render richOption(item)}
                      {:else}
                        <span class="card-select__option-label">{item.label}</span>
                      {/if}
                      <span class="card-select__check" aria-hidden="true">
                        {#if selected}<Check size={16} strokeWidth={2} />{/if}
                      </span>
                    {/snippet}
                  </Combobox.Item>
                {/each}
              </Combobox.Viewport>
            </div>
          {/snippet}
        </Combobox.ContentStatic>
        {#if matches.length === 0}<p class="ui-combobox__empty" role="status">{emptyLabel}</p>{/if}
      </Combobox.Root>
      {#if createAction}
        <div class="ui-combobox__footer">
          <LinkButton
            bind:ref={action}
            href={createAction.href}
            variant="ghost"
            size="compact"
            class="ui-combobox__create"
            onkeydown={actionKeydown}
            onclick={(event) => {
              createAction?.onclick?.(event)
              if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) open = false
            }}
          ><Plus size={16} strokeWidth={1.5} aria-hidden="true" /><span>{createAction.label}</span></LinkButton>
        </div>
      {/if}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
{#if required}<span class="sr-only" id={`${uid}-required`}>Required</span>{/if}
<SelectionInput {name} {value} {disabled} {required} trigger={ref} oninvalid={() => missingRequired = true} />

<style>
  :global(.ui-combobox__trigger[data-appearance='quiet']) {
    background: transparent;
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
  }
  :global(.ui-combobox__trigger:not([data-appearance='field']) .card-select__value) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :global(.ui-combobox__menu) {
    inline-size: max(16rem, var(--bits-popover-anchor-width));
    min-inline-size: 0;
    max-inline-size: min(24rem, var(--bits-popover-content-available-width));
    max-block-size: min(24rem, var(--bits-popover-content-available-height));
  }
  :global(.ui-combobox__menu[data-appearance='field']) {
    inline-size: var(--bits-popover-anchor-width);
    max-inline-size: var(--bits-popover-content-available-width);
  }
  .ui-combobox__rich-value { flex: 1; min-inline-size: 0; }
  .ui-combobox__summary { display: flex; flex: 1; align-items: center; gap: var(--space-3); min-inline-size: 0; }
  .ui-combobox__copy { display: grid; flex: 1; gap: var(--space-half); min-inline-size: 0; overflow-wrap: anywhere; text-align: start; font-size: var(--text-base); }
  .ui-combobox__description { color: var(--muted); font-size: var(--text-sm); font-weight: 400; line-height: 1.4; }
  .ui-combobox__trailing { flex: none; color: var(--muted); font-size: var(--text-sm); font-weight: 400; font-variant-numeric: tabular-nums; white-space: nowrap; }
  :global(.ui-combobox__trigger[data-state='open']) .ui-combobox__description,
  :global(.ui-combobox__trigger[data-state='open']) .ui-combobox__trailing,
  :global(.ui-combobox__menu [data-selected]) .ui-combobox__description,
  :global(.ui-combobox__menu [data-selected]) .ui-combobox__trailing { color: var(--ink); }
  .ui-combobox__search {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: var(--space-1) var(--space-1) var(--space-2);
    padding-inline: var(--space-2);
    border-radius: var(--radius-control);
    background: var(--control-fill);
    color: var(--muted);
  }
  .ui-combobox__search :global(svg) { flex: none; }
  :global(.ui-combobox__input) {
    inline-size: 100%;
    min-inline-size: 0;
    min-block-size: var(--control-select);
    padding: var(--space-2) 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--ink);
    font-size: var(--text-sm);
    line-height: 1.4;
  }
  :global(.ui-combobox__input::placeholder) { color: var(--muted); }
  :global(.ui-combobox__input:focus-visible) { outline: none; }
  .ui-combobox__search:has(:global(input:focus-visible)) { outline: 2px solid var(--accent); outline-offset: 0; }
  :global(.ui-combobox__list) { min-block-size: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; scroll-padding-block: var(--space-1); }
  .ui-combobox__empty { margin: 0; padding: var(--space-4) var(--space-2); color: var(--muted); font-size: var(--text-sm); }
  .ui-combobox__footer { flex: none; margin-block-start: var(--space-1); padding-block-start: var(--space-1); border-block-start: 1px solid var(--rule); }
  :global(.ui-combobox__create) { inline-size: 100%; min-block-size: var(--control-select); justify-content: flex-start; font-size: var(--text-sm); font-weight: 500; color: var(--ink); }
  @media (hover: hover) {
    :global(.ui-combobox__trigger[data-appearance='quiet']:hover:not(:disabled)) { background: var(--hover); }
  }
  @media (pointer: coarse) {
    :global(.ui-combobox__input), :global(.ui-combobox__create) { min-block-size: var(--control-touch); }
  }
  @media (max-width: 639px) {
    :global(.ui-combobox__input) { font-size: var(--text-input-mobile); }
  }
  @media (forced-colors: active) {
    .ui-combobox__footer { border-color: CanvasText; }
    .ui-combobox__search:has(:global(input:focus-visible)) { outline-color: Highlight; }
  }
</style>
