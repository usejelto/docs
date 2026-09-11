<script lang="ts">
  import { onDestroy } from 'svelte'
  import Copy from '@lucide/svelte/icons/copy'
  import Check from '@lucide/svelte/icons/check'
  import Button from './Button.svelte'
  import StatusMessage from './StatusMessage.svelte'
  import type { ButtonProps } from './types'
  let { text, label, copiedLabel, failureLabel, resetAfter = 0, disabled = false, variant = 'secondary', onfailure, class: className = '' }:
    { text: string; label: string; copiedLabel: string; failureLabel: string; resetAfter?: number; disabled?: boolean; variant?: ButtonProps['variant']; onfailure?: () => void; class?: string } = $props()
  let outcome = $state<'copied' | 'failed' | null>(null)
  let pending = $state(false)
  let version = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  $effect(() => { text; version++; outcome = null; pending = false; clearTimeout(timer) })
  onDestroy(() => { version++; clearTimeout(timer) })
  async function copy() {
    if (disabled || pending) return
    const request = ++version
    pending = true
    outcome = null
    clearTimeout(timer)
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(text)
      if (request !== version) return
      outcome = 'copied'
      if (resetAfter > 0) timer = setTimeout(() => { outcome = null }, resetAfter)
    } catch {
      if (request === version) { outcome = 'failed'; onfailure?.() }
    } finally {
      if (request === version) pending = false
    }
  }
</script>
<div class={`ui-copy-action ${className}`}>
  <Button size="compact" {variant} {disabled} loading={pending} onclick={copy}>
    {#if outcome === 'copied'}<Check size={14} aria-hidden="true" />{:else}<Copy size={14} aria-hidden="true" />{/if}
    {outcome === 'copied' ? copiedLabel : label}
  </Button>
  <StatusMessage live="polite" tone={outcome === 'failed' ? 'danger' : 'neutral'} class={outcome === 'failed' ? '' : 'sr-only'}>{outcome === 'failed' ? failureLabel : outcome === 'copied' ? copiedLabel : ''}</StatusMessage>
</div>
