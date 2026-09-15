import { get, writable } from 'svelte/store'
import type { StatusTone } from './types'

export interface ToastOptions {
  tone?: StatusTone
  /** Milliseconds of visible reading time. Zero keeps the toast until dismissed. */
  duration?: number
}

export interface ToastNotice {
  id: number
  message: string
  tone: StatusTone
  duration: number
  revision: number
  returnFocus: HTMLElement | null
}

/** One queue per application; isolated queues are useful for previews and tests. */
export function createToastQueue() {
  const notices = writable<ToastNotice[]>([])
  let sequence = 0
  function show(message: string, { tone = 'neutral', duration = tone === 'danger' || tone === 'warning' ? 0 : 5000 }: ToastOptions = {}) {
    if (!message.trim()) return undefined
    const existing = get(notices).find(notice => notice.message === message && notice.tone === tone)
    const id = existing?.id ?? ++sequence
    const notice: ToastNotice = {
      id, message, tone, duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
      revision: (existing?.revision ?? 0) + 1,
      returnFocus: existing?.returnFocus ?? (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null),
    }
    notices.update(items => existing ? items.map(item => item.id === id ? notice : item) : [...items, notice])
    return id
  }
  return {
    subscribe: notices.subscribe,
    show,
    success: (message: string, options: Omit<ToastOptions, 'tone'> = {}) => show(message, { ...options, tone: 'success' }),
    dismiss: (id: number) => notices.update(items => items.filter(item => item.id !== id)),
    clear: () => notices.set([]),
  }
}

export type ToastQueue = ReturnType<typeof createToastQueue>
export const toast = createToastQueue()

/** Timers only exist while a notice is rendered, so queued notices never expire. */
export function toastLifetime(node: HTMLElement, options: { notice: ToastNotice; dismiss: (id: number) => void }) {
  let remaining = options.notice.duration
  let started = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let hovered = false
  let focused = false
  function pause() {
    if (timer === undefined) return
    clearTimeout(timer)
    timer = undefined
    remaining = Math.max(0, remaining - (Date.now() - started))
  }
  function resume() {
    if (timer !== undefined || options.notice.duration === 0 || hovered || focused || document.hidden) return
    started = Date.now()
    timer = setTimeout(() => { timer = undefined; options.dismiss(options.notice.id) }, remaining)
  }
  const enter = () => { hovered = true; pause() }
  const leave = () => { hovered = false; resume() }
  const focus = () => { focused = true; pause() }
  const blur = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return
    focused = false; resume()
  }
  const visibility = () => document.hidden ? pause() : resume()
  node.addEventListener('mouseenter', enter)
  node.addEventListener('mouseleave', leave)
  node.addEventListener('focusin', focus)
  node.addEventListener('focusout', blur)
  document.addEventListener('visibilitychange', visibility)
  resume()
  return {
    update(next: typeof options) {
      if (next.notice === options.notice) return
      pause(); options = next; remaining = next.notice.duration; resume()
    },
    destroy() {
      pause()
      node.removeEventListener('mouseenter', enter)
      node.removeEventListener('mouseleave', leave)
      node.removeEventListener('focusin', focus)
      node.removeEventListener('focusout', blur)
      document.removeEventListener('visibilitychange', visibility)
    },
  }
}
