<script lang="ts">
  import { onDestroy, tick } from 'svelte'
  import type { Snippet } from 'svelte'
  import X from '@lucide/svelte/icons/x'
  import IconButton from './IconButton.svelte'

  let { open = $bindable(false), title, hideTitle = false, headerActions, size = 'default', dismissOnBackdrop = false, children }:
    { open?: boolean; title: string; hideTitle?: boolean; headerActions?: Snippet; size?: 'default' | 'compact' | 'image'; dismissOnBackdrop?: boolean; children: Snippet } = $props()
  const id = $props.id()
  let element: HTMLDialogElement
  let opener: HTMLElement | null = null
  let pointerStartedOutside = false
  function outside(event: MouseEvent) {
    const bounds = element.getBoundingClientRect()
    return event.target === element && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)
  }
  function containFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') return
    const focusable = [...element.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]')]
      .filter((target) => target.tabIndex >= 0 && !target.matches(':disabled') && target.getClientRects().length > 0)
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
  $effect(() => {
    if (open && !element.open) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
      element.showModal()
      void tick().then(() => { if (element.open) element.querySelector<HTMLInputElement>('input')?.focus() })
    } else if (!open && element.open) element.close()
  })
  function closed() {
    open = false
    opener?.focus()
  }
  onDestroy(() => { if (element?.open) { element.close(); opener?.focus() } })
</script>
<dialog bind:this={element} class="ui-modal" data-size={size} aria-labelledby={`${id}-title`} onclose={closed} oncancel={() => { open = false }}
  onkeydown={containFocus}
  onpointerdown={(event) => { pointerStartedOutside = event.button === 0 && outside(event) }}
  onclick={(event) => { if (dismissOnBackdrop && pointerStartedOutside && outside(event)) open = false; pointerStartedOutside = false }}>
  <div class="ui-modal__header"><h2 id={`${id}-title`} class:sr-only={hideTitle}>{title}</h2>{@render headerActions?.()}<IconButton label="Close dialog" onclick={() => { open = false }}><X size={18} aria-hidden="true" /></IconButton></div>
  {@render children()}
</dialog>
