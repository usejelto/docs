/**
 * Design system §10: a menu's highlighted option shows the focus ring only while
 * the reader is using the keyboard. Bits UI marks keyboard and pointer
 * highlights with the same `data-highlighted`, and focus stays on the trigger or
 * search input (`aria-activedescendant`), so `:focus-visible` cannot tell them
 * apart. The document records the last input modality instead; CSS keys the
 * ring to `:root[data-modality='keyboard']`.
 */
let installed = false

export type InputModality = 'keyboard' | 'pointer'

export function trackInputModality(root: HTMLElement | null = typeof document === 'undefined' ? null : document.documentElement): void {
  if (installed || root === null) return
  installed = true
  const doc = root.ownerDocument
  const set = (modality: InputModality) => { if (root.dataset.modality !== modality) root.dataset.modality = modality }
  doc.addEventListener('keydown', (event) => { if (!event.metaKey && !event.ctrlKey && !event.altKey) set('keyboard') }, true)
  doc.addEventListener('pointerdown', () => set('pointer'), true)
  doc.addEventListener('pointermove', () => set('pointer'), { capture: true, passive: true })
}
