<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { StatusTone } from './types'
  import CircleCheck from '@lucide/svelte/icons/circle-check'
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert'
  import Info from '@lucide/svelte/icons/info'
  let { tone = 'neutral', class: className = '', live = 'off', icon, children }:
    { tone?: StatusTone; class?: string; live?: 'off' | 'polite' | 'assertive'; icon?: Snippet; children: Snippet } = $props()
  const icons = { neutral: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert }
  const ToneIcon = $derived(icons[tone])
</script>
<div class={`ui-callout ${className}`} data-tone={tone} role={live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined}>
  <span class="ui-callout__icon" aria-hidden="true">{#if icon}{@render icon()}{:else}<ToneIcon size={16} strokeWidth={1.5} />{/if}</span
  ><div class="ui-callout__content">{@render children()}</div>
</div>
