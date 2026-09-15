<script lang="ts">
  import CircleCheck from '@lucide/svelte/icons/circle-check'
  import CircleAlert from '@lucide/svelte/icons/circle-alert'
  import TriangleAlert from '@lucide/svelte/icons/triangle-alert'
  import Info from '@lucide/svelte/icons/info'
  import X from '@lucide/svelte/icons/x'
  import IconButton from './IconButton.svelte'
  import { enterOneShot, exitFast, moveToast } from './motion'
  import { toast, toastLifetime, type ToastNotice, type ToastQueue } from './toast'

  let { queue = toast, label = 'Notifications', dismissLabel = 'Dismiss notification' }:
    { queue?: ToastQueue; label?: string; dismissLabel?: string } = $props()
  const visible = $derived($queue.slice(0, 3))
  const icons = { success: CircleCheck, danger: CircleAlert, warning: TriangleAlert, neutral: Info }
  let viewport: HTMLElement

  function dismiss(notice: ToastNotice, node: HTMLElement) {
    // Only restore focus when dismissal removes the focused control.
    if (node.contains(document.activeElement)) {
      const next = Array.from(viewport.querySelectorAll<HTMLButtonElement>('li:not([inert]) button')).find(button => !node.contains(button))
      if (next) next.focus()
      else {
        if (notice.returnFocus?.isConnected && !node.contains(notice.returnFocus)) notice.returnFocus.focus()
        if (node.contains(document.activeElement)) viewport.focus()
      }
    }
    queue.dismiss(notice.id)
  }

  function keyboard(node: HTMLElement, notice: ToastNotice) {
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault(); event.stopPropagation(); dismiss(notice, node)
    }
    node.addEventListener('keydown', keydown)
    return { update(next: ToastNotice) { notice = next }, destroy() { node.removeEventListener('keydown', keydown) } }
  }
</script>

<section bind:this={viewport} class="ui-toasts" aria-label={label} tabindex="-1">
  <div role="status" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
    <ol class="ui-toasts__list">
      {#each visible as notice (notice.id)}
        {@const Icon = icons[notice.tone]}
        <li class="ui-toast" data-tone={notice.tone} use:toastLifetime={{ notice, dismiss: queue.dismiss }} use:keyboard={notice}
          in:enterOneShot={{ y: 8 }} out:exitFast={{ y: 4 }} animate:moveToast>
          <span class="ui-toast__icon"><Icon size={20} aria-hidden="true" /></span>
          {#key notice.revision}<p class="ui-toast__message">{notice.message}</p>{/key}
          <IconButton label={dismissLabel} onclick={event => dismiss(notice, event.currentTarget.closest('li')!)}><X size={16} aria-hidden="true" /></IconButton>
        </li>
      {/each}
    </ol>
  </div>
</section>
