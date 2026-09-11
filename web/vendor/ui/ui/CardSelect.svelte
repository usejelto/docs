<script module lang="ts">
  export type { SelectOption as CardSelectOption } from './Select.svelte'
</script>
<script lang="ts">
  import Select, { type SelectOption } from './Select.svelte'
  import Globe from '@lucide/svelte/icons/globe'
  import Layers from '@lucide/svelte/icons/layers'
  import ArrowDownWideNarrow from '@lucide/svelte/icons/arrow-down-wide-narrow'
  let { options, value, label, labelledby, placeholder = '', variant = 'metric', onValueChange }:
    { options: readonly SelectOption[]; value: string; label: string; labelledby?: string; placeholder?: string;
      variant?: 'view' | 'metric' | 'host' | 'more'; onValueChange: (value: string) => void } = $props()
</script>
<Select {options} {value} {label} {labelledby} {placeholder} {onValueChange}
  appearance={variant === 'more' ? 'pill' : 'compact'} align={variant === 'metric' || variant === 'host' ? 'end' : 'start'}
  triggerProps={{
    'data-variant': variant,
    'data-active': variant === 'more' && options.some((option) => option.value === value) ? '' : undefined,
    'data-view-select': variant === 'view' ? '' : undefined,
    'data-metric-select': variant === 'metric' ? '' : undefined,
    'data-tabs-more': variant === 'more' ? '' : undefined,
    'data-host-select': variant === 'host' ? '' : undefined,
    'data-card-filter': variant === 'host' ? '' : undefined,
  }}>
  {#snippet icon()}
    {#if variant === 'host'}<Globe size={15} strokeWidth={1.5} />
    {:else if variant === 'view'}<Layers size={15} strokeWidth={2} />
    {:else if variant === 'metric'}<ArrowDownWideNarrow size={15} strokeWidth={1.5} />{/if}
  {/snippet}
</Select>
