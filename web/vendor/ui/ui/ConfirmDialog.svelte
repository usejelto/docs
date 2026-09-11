<script lang="ts">
  // spec/dashboard.md §13 "Behaviour primitives" and §7 (v1.40): every
  // destructive confirm is an AlertDialog — focus moves into it, Tab is trapped,
  // Escape and Cancel close it, the action carries `bad`. Bits UI's AlertDialog
  // renders role="alertdialog" with aria-labelledby / aria-describedby wired to
  // the title and description; the Portal puts it at the end of <body>, so
  // its look is app.css's global .ui-dialog* classes, not a scoped style.
  //
  // `open` is bindable so the caller decides when the question is asked and
  // learns when it was dismissed; `onconfirm` fires only from the action.
  import { AlertDialog } from 'bits-ui'
  import { onDestroy, type Snippet } from 'svelte'
  import LoaderCircle from '@lucide/svelte/icons/loader-circle'
  import { actionClass } from './types'

  let returnFocus: HTMLElement | null = null
  let content = $state<HTMLElement | null>(null)
  let focusTimer: ReturnType<typeof setTimeout> | undefined

  function cancelFocus() {
    clearTimeout(focusTimer)
    focusTimer = undefined
  }

  function focusContent(event: Event) {
    // Bits UI 2.19's default timer reads its reactive ref after unmount. Own the
    // timer and capture the DOM node while alive, retaining the deferred focus.
    event.preventDefault()
    cancelFocus()
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const target = content
    focusTimer = setTimeout(() => {
      focusTimer = undefined
      if (target?.isConnected) target.focus()
    }, 0)
  }

  function restoreFocus(event: Event) {
    cancelFocus()
    if (returnFocus?.isConnected) {
      event.preventDefault()
      returnFocus.focus()
    }
  }

  onDestroy(cancelFocus)

  let {
    open = $bindable(false),
    title,
    description,
    confirmLabel,
    cancelLabel,
    busy = false,
    onconfirm,
    children = undefined,
  }: {
    open?: boolean
    title: string
    description: string
    confirmLabel: string
    cancelLabel: string
    busy?: boolean
    onconfirm: () => void
    children?: Snippet
  } = $props()
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <AlertDialog.Overlay class="ui-dialog__overlay" />
    <AlertDialog.Content class="ui-dialog ui-card" data-confirm bind:ref={content}
      onOpenAutoFocus={focusContent} onCloseAutoFocus={restoreFocus}>
      <AlertDialog.Title class="ui-dialog__title" level={2}>{title}</AlertDialog.Title>
      <div class="ui-dialog__body">
        <AlertDialog.Description class="ui-dialog__description">{description}</AlertDialog.Description>
        {#if children}{@render children()}{/if}
      </div>
      <div class="ui-dialog__actions">
        <AlertDialog.Cancel class={actionClass('secondary', 'default')} disabled={busy}>{cancelLabel}</AlertDialog.Cancel>
        <AlertDialog.Action class={actionClass('danger', 'default')} disabled={busy} aria-busy={busy || undefined} onclick={() => { if (!busy) onconfirm() }}>
          {#if busy}<LoaderCircle class="ui-loading-icon" size={16} strokeWidth={2} aria-hidden="true" />{/if}
          {confirmLabel}
        </AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
