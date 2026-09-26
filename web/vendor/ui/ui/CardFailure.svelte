<script lang="ts">
  import type { Snippet } from 'svelte'
  import Button from './Button.svelte'
  /**
   * Design system §10: a card whose request failed. §5 renders `query_failed`
   * muted rather than as an alarm, so a card keeps that tone — the message (or
   * the failed envelope, as children), then one compact retry.
   */
  let { message, retryLabel, onretry, busy = false, live = 'polite', class: className = '', children }:
    { message?: string; retryLabel?: string; onretry?: () => void; busy?: boolean; live?: 'off' | 'polite' | 'assertive'; class?: string; children?: Snippet } = $props()
</script>
<div class={`ui-card-failure ${className}`} role={live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined}>
  {#if message}<p class="ui-card-failure__message">{message}</p>{/if}
  {@render children?.()}
  {#if onretry && retryLabel}<Button size="compact" loading={busy} onclick={onretry}>{retryLabel}</Button>{/if}
</div>
