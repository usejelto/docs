<script lang="ts">
  import ChevronDown from '@lucide/svelte/icons/chevron-down'
  import type { Snippet } from 'svelte'
  import type { HTMLDetailsAttributes } from 'svelte/elements'
  let { open = $bindable(false), label, openLabel = label, summary, icon, class: className = '', children, ...rest }:
    Omit<HTMLDetailsAttributes, 'class'> & { label?: string; openLabel?: string; summary?: Snippet; icon?: Snippet; class?: string; children: Snippet } = $props()
</script>
<details {...rest} bind:open class={`ui-data-details ${className}`}>
  <summary>{#if summary}{@render summary()}{:else}<ChevronDown size={15} strokeWidth={2} class="ui-data-details__chevron" aria-hidden="true" />{#if icon}<span class="ui-data-details__icon" aria-hidden="true">{@render icon()}</span>{/if}{open ? openLabel : label}{/if}</summary>
  {@render children()}
</details>

<style>
  .ui-data-details__icon { display: flex; flex: none; margin-inline-end: var(--space-1); }
</style>
