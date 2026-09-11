<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import Search from '@lucide/svelte/icons/search'
  import TextInput from './TextInput.svelte'
  let { label, value = $bindable(''), ref = $bindable(null), class: className = '', ...rest }:
    Omit<HTMLInputAttributes, 'type' | 'value' | 'class'> & { label: string; value?: string; ref?: HTMLInputElement | null; class?: string } = $props()
</script>
<div class={`ui-search-field ${className}`}>
  <Search size={14} aria-hidden="true" />
  <TextInput {...rest} type="search" aria-label={label} bind:value bind:ref />
</div>
