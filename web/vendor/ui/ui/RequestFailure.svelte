<script lang="ts">
  import type { Snippet } from 'svelte'
  import RefreshCw from '@lucide/svelte/icons/refresh-cw'
  import Button from './Button.svelte'
  import Callout from './Callout.svelte'
  /**
   * Design system §10: a request that failed on a page — a danger Callout with
   * the message and, when the reader can do something, one compact retry
   * beside it. It replaces hand-built StatusMessage + full-width Button pairs.
   */
  let { message, retryLabel, onretry, busy = false, live = 'assertive', class: className = '', children }:
    { message: string; retryLabel?: string; onretry?: () => void; busy?: boolean; live?: 'off' | 'polite' | 'assertive'; class?: string; children?: Snippet } = $props()
</script>
<Callout tone="danger" {live} class={`ui-request-failure ${className}`}>
  <p class="ui-request-failure__message">{message}</p>
  {@render children?.()}
  {#if onretry && retryLabel}<Button size="compact" loading={busy} onclick={onretry}>{#if !busy}<RefreshCw size={14} aria-hidden="true" />{/if}{retryLabel}</Button>{/if}
</Callout>
