import type { TransitionConfig } from 'svelte/transition'
import { flip } from 'svelte/animate'
import { BASE_MS, EASE, ENTER_MS, FAST_MS } from './motionTokens'

// JavaScript transitions mirror styles.css's motion tokens through
// motionTokens.ts. CSS custom properties cannot supply Svelte's numeric
// duration or easing function.

interface BoundaryParams {
  y?: number
}

function sampleCurve(t: number, p1: number, p2: number): number {
  const c = 3 * p1
  const b = 3 * (p2 - p1) - c
  const a = 1 - c - b
  return ((a * t + b) * t + c) * t
}

function sampleCurveSlope(t: number, p1: number, p2: number): number {
  const c = 3 * p1
  const b = 3 * (p2 - p1) - c
  const a = 1 - c - b
  return (3 * a * t + 2 * b) * t + c
}

/** A CSS `cubic-bezier()` as a Svelte easing function. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (value: number) => number {
  return (value) => {
    if (value <= 0 || value >= 1) return value

    let low = 0
    let high = 1
    let t = value
    for (let i = 0; i < 12; i += 1) {
      const x = sampleCurve(t, x1, x2)
      const delta = x - value
      if (Math.abs(delta) < 0.00001) break
      if (delta < 0) low = t
      else high = t

      const slope = sampleCurveSlope(t, x1, x2)
      const candidate = slope > 0.000001 ? t - delta / slope : (low + high) / 2
      t = candidate > low && candidate < high ? candidate : (low + high) / 2
    }
    return sampleCurve(t, y1, y2)
  }
}

/** styles.css's `--ease: cubic-bezier(0.2, 0, 0, 1)` as a Svelte easing. */
export const uiEase = cubicBezier(0.2, 0, 0, 1)

/** styles.css's `--ease-exit: cubic-bezier(0.3, 0, 1, 1)`. Svelte plays an outro
 * as `1 - easing(progress)`, so an exit needs its own accelerating curve. */
export const uiEaseExit = cubicBezier(0.3, 0, 1, 1)

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

function restingStyles(node: Element) {
  const css = getComputedStyle(node)
  const opacity = Number.parseFloat(css.opacity)
  return {
    opacity: Number.isNaN(opacity) ? 1 : opacity,
    transform: css.transform && css.transform !== 'none' ? css.transform : '',
  }
}

function translated(transform: string, y: number): string {
  return `${transform ? `${transform} ` : ''}translateY(${y}px)`
}

function boundary(node: Element, duration: number, y: number, easing = uiEase): TransitionConfig {
  const reduced = prefersReducedMotion()
  const { opacity, transform } = restingStyles(node)
  return {
    duration: reduced ? FAST_MS : duration,
    easing,
    css: (t, u) => `opacity: ${t * opacity}; transform: ${reduced ? transform || 'none' : translated(transform, u * y)}`,
  }
}

/** A rare, one-shot result entering on the `--motion-enter` tier. */
export function enterOneShot(node: Element, { y = 1 }: BoundaryParams = {}): TransitionConfig {
  return boundary(node, ENTER_MS, y)
}

/** An occasional surface entering on the `--motion-base` tier. */
export function enterSurface(node: Element, { y = 1 }: BoundaryParams = {}): TransitionConfig {
  return boundary(node, BASE_MS, y)
}

/** The symmetric return path, always on the `--motion-fast` tier. */
export function exitFast(node: Element, { y = 1 }: BoundaryParams = {}): TransitionConfig {
  return boundary(node, FAST_MS, y, uiEaseExit)
}

/** §13 v1.133: inline content grows into place over `--motion-enter` and folds
 * away over `--motion-fast` on the exit easing, animating height and opacity.
 * An in-flow element in a flex column or grid also takes back the row gap it
 * occupies, so the neighbours below slide rather than jump by the gap. Reduced
 * motion keeps a fast opacity change. */
export function revealHeight(
  node: Element,
  _params: Record<string, never> = {},
  { direction = 'both' }: { direction?: 'in' | 'out' | 'both' } = {},
): TransitionConfig {
  const exit = direction === 'out'
  const easing = exit ? uiEaseExit : uiEase
  const style = getComputedStyle(node)
  const opacity = Number.parseFloat(style.opacity)
  const resting = Number.isNaN(opacity) ? 1 : opacity
  if (prefersReducedMotion()) return { duration: FAST_MS, easing, css: (t) => `opacity: ${t * resting}` }

  const px = (value: string) => Number.parseFloat(value) || 0
  const height = px(style.height)
  const padding = [px(style.paddingTop), px(style.paddingBottom)]
  const border = [px(style.borderTopWidth), px(style.borderBottomWidth)]
  const margin = [px(style.marginTop), px(style.marginBottom)]
  const parent = node.parentElement
  const layout = parent ? getComputedStyle(parent) : null
  const stacked = layout !== null && (layout.display.includes('grid') || (layout.display.includes('flex') && layout.flexDirection.startsWith('column')))
  const inFlow = style.position !== 'absolute' && style.position !== 'fixed'
  const gap = stacked && inFlow && (parent?.childElementCount ?? 0) > 1 ? px(layout.rowGap) : 0
  return {
    duration: exit ? FAST_MS : ENTER_MS,
    easing,
    css: (t, u) => `overflow: clip; opacity: ${t * resting}; min-height: 0; height: ${t * height}px; ` +
      `padding-top: ${t * padding[0]!}px; padding-bottom: ${t * padding[1]!}px; ` +
      `border-top-width: ${t * border[0]!}px; border-bottom-width: ${t * border[1]!}px; ` +
      `margin-top: ${t * margin[0]!}px; margin-bottom: ${t * margin[1]! - u * gap}px`,
  }
}

/** Move a keyed item to its new place as its neighbours arrive and leave. */
export function moveItem(node: Element, positions: { from: DOMRect; to: DOMRect }) {
  return flip(node, positions, { duration: prefersReducedMotion() ? 0 : BASE_MS, easing: uiEase })
}

/** Keep the notification stack together as its visible items change. */
export const moveToast = moveItem

/** Shared, interruptible dashboard motion. No animation owns persistent styles. */
const timing = { duration: ENTER_MS, easing: EASE }

export function animatePanel(node: HTMLElement): Animation | undefined {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (preference.matches || !node.animate) return
  const { transform } = restingStyles(node)
  const animation = node.animate([
    { transform: translated(transform, 2) },
    { transform: translated(transform, 0) },
  ], { ...timing, duration: FAST_MS })
  function stop() { if (preference.matches) animation.cancel() }
  function cleanup() {
    preference.removeEventListener('change', stop)
    animation.removeEventListener('finish', cleanup)
    animation.removeEventListener('cancel', cleanup)
  }
  preference.addEventListener('change', stop)
  animation.addEventListener('finish', cleanup)
  animation.addEventListener('cancel', cleanup)
  return animation
}

/** Animate content changes, never observer-generated layout changes. Grid cards
 * stretch to their neighbours: animating ResizeObserver notifications would make
 * each card chase the other's temporary height indefinitely. Content changes are
 * measured in the mutation callback, a microtask before the next paint, so the
 * new layout is never painted at its final height ahead of the animation. */
export function animateHeight(node: HTMLElement) {
  let height = node.getBoundingClientRect().height
  let animation: Animation | undefined
  let frame = 0
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  function measure() {
    frame = 0
    const running = animation
    const elapsed = running?.currentTime ?? 0
    const from = running ? node.getBoundingClientRect().height : height
    running?.cancel()
    animation = undefined
    const next = node.getBoundingClientRect().height
    const previous = height
    height = next
    // Tooltip/text mutations can leave the target size unchanged. Continue the
    // existing timeline instead of restarting its easing on every notification.
    if (running && !preference.matches && Math.abs(next - previous) < 1) {
      animation = running
      running.play()
      running.currentTime = elapsed
      return
    }
    if (preference.matches || !node.animate || !previous || Math.abs(from - next) < 1) return
    const css = getComputedStyle(node)
    const inset = css.boxSizing === 'border-box' ? 0 :
      parseFloat(css.paddingTop) + parseFloat(css.paddingBottom) + parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth)
    const nextAnimation = node.animate([
      { height: `${Math.max(0, from - inset)}px`, overflow: 'clip' },
      { height: `${Math.max(0, next - inset)}px`, overflow: 'clip' },
    ], timing)
    animation = nextAnimation
    nextAnimation.onfinish = () => {
      if (animation !== nextAnimation) return
      animation = undefined
      // Returning to auto can change a stretched grid row. Accept its settled
      // size; do not feed it back into another height animation.
      height = node.getBoundingClientRect().height
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(measure)
  }
  const resize = new ResizeObserver(() => {
    // Keep the baseline current for responsive reflow and neighbouring cards.
    // A pending content change still needs its pre-change height for animation.
    if (!animation && !frame) height = node.getBoundingClientRect().height
  })
  resize.observe(node)
  const mutation = new MutationObserver(() => {
    cancelAnimationFrame(frame)
    measure()
  })
  mutation.observe(node, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'open', 'data-state'] })
  preference.addEventListener('change', schedule)
  return { destroy() {
    cancelAnimationFrame(frame)
    animation?.cancel()
    resize.disconnect()
    mutation.disconnect()
    preference.removeEventListener('change', schedule)
  } }
}

const PLACEHOLDER = '.ui-skeleton, .ui-loading-state'
const REVEAL = 'ui-reveal'

/** §13 v1.133: content that replaces a skeleton or loading indicator fades in
 * over `--motion-fast` without travel, so an answer never pops in. Only a
 * direct replacement fades — an element added where a placeholder was just
 * removed — and a skeleton-to-skeleton swap stays still. */
export function revealContent(node: HTMLElement) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const observer = new MutationObserver((records) => {
    if (preference.matches) return
    const replaced = new Set<Node>()
    for (const record of records) {
      for (const removed of record.removedNodes) {
        if (removed instanceof Element && (removed.matches(PLACEHOLDER) || removed.querySelector(PLACEHOLDER))) {
          replaced.add(record.target)
          break
        }
      }
    }
    if (!replaced.size) return
    for (const record of records) {
      if (!replaced.has(record.target)) continue
      for (const added of record.addedNodes) {
        if (!(added instanceof HTMLElement) || !added.isConnected || typeof added.animate !== 'function') continue
        if (added.matches(PLACEHOLDER) || added.querySelector(PLACEHOLDER)) continue
        // Nested cards observe the same mutation; one fade is enough.
        if (added.getAnimations().some((animation) => animation.id === REVEAL)) continue
        const animation = added.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FAST_MS, easing: EASE })
        animation.id = REVEAL
      }
    }
  })
  observer.observe(node, { childList: true, subtree: true })
  return { destroy() { observer.disconnect() } }
}

/** Degrees of soft edge on the sweep, so its leading line is not a hard cut. */
const SWEEP_FEATHER = 12

function canSweep(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.registerProperty === 'function'
    && CSS.supports('mask-image', 'conic-gradient(#000, #0000)')
}

/** §13 v1.134: a radial chart opens with one clockwise sweep from twelve
 * o'clock over `--motion-enter`. Slices, callouts and marks appear in place, in
 * the order the eye reads them around the ring, and nothing moves. The sweep
 * runs once, when the first marks are drawn; later data changes resize the
 * slices instead. Reduced motion shows the chart at once. */
export function sweepChart(node: HTMLElement, selector: string) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  let frame = 0
  let animation: Animation | undefined
  const enabled = !preference.matches && typeof node.animate === 'function' && canSweep()
  function end() {
    delete node.dataset.sweeping
    node.style.removeProperty('--ui-sweep')
    node.style.removeProperty('--ui-sweep-at')
  }
  // Hidden from the first paint: a frame of the finished chart before the
  // sweep would read as a flash.
  if (enabled) {
    node.dataset.sweeping = ''
    node.style.setProperty('--ui-sweep', '0deg')
  }
  function start() {
    frame = 0
    const drawn = [...node.querySelectorAll(selector)].some((mark) => (mark.getAttribute('d') ?? '') !== '')
    if (!drawn) return
    observer.disconnect()
    if (!enabled || preference.matches) {
      end()
      return
    }
    const plot = node.querySelector('svg')?.getBoundingClientRect()
    const box = node.getBoundingClientRect()
    if (plot && plot.width && plot.height) {
      node.style.setProperty('--ui-sweep-at', `${plot.left - box.left + plot.width / 2}px ${plot.top - box.top + plot.height / 2}px`)
    }
    animation = node.animate([
      { '--ui-sweep': '0deg' },
      { '--ui-sweep': `${360 + SWEEP_FEATHER}deg` },
    ], { duration: ENTER_MS, easing: EASE })
    animation.onfinish = end
    animation.oncancel = end
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(start) }
  const observer = new MutationObserver(schedule)
  observer.observe(node, { subtree: true, childList: true, attributes: true, attributeFilter: ['d'] })
  schedule()
  // Never leave a chart hidden: marks that do not arrive promptly show at once.
  const fallback = setTimeout(() => {
    if (animation) return
    observer.disconnect()
    end()
  }, 1000)
  return { destroy() {
    cancelAnimationFrame(frame)
    clearTimeout(fallback)
    observer.disconnect()
    animation?.cancel()
    end()
  } }
}

/** Watch only mark geometry: pointer highlights and tooltip text never redraw
 * a chart. Clip reveals preserve dashed lines, gaps and the original geometry. */
export function drawChart(node: HTMLElement | SVGElement, selector: string) {
  const animations = new Map<Element, Animation>()
  const geometry = new Map<Element, string>()
  let frame = 0
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  function draw() {
    frame = 0
    const marks = new Set(node.querySelectorAll<Element>(selector))
    for (const mark of geometry.keys()) if (!marks.has(mark)) {
      animations.get(mark)?.cancel()
      animations.delete(mark)
      geometry.delete(mark)
    }
    for (const mark of marks) {
      const key = ['d', 'x', 'y', 'width', 'height'].map((name) => mark.getAttribute(name)).join('|')
      if (geometry.get(mark) === key) continue
      geometry.set(mark, key)
      animations.get(mark)?.cancel()
      if (preference.matches || !mark.animate) continue
      const animation = mark.animate([
        { clipPath: 'inset(-2px calc(100% + 2px) -2px -2px)' },
        { clipPath: 'inset(-2px -2px -2px -2px)' },
      ], timing)
      animations.set(mark, animation)
      animation.onfinish = () => { if (animations.get(mark) === animation) animations.delete(mark) }
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw) }
  function stop() { if (preference.matches) { for (const animation of animations.values()) animation.cancel(); animations.clear() } }
  const observer = new MutationObserver(schedule)
  observer.observe(node, { subtree: true, childList: true, attributes: true, attributeFilter: ['d', 'x', 'y', 'width', 'height'] })
  preference.addEventListener('change', stop)
  schedule()
  return { destroy() {
    cancelAnimationFrame(frame)
    observer.disconnect()
    for (const animation of animations.values()) animation.cancel()
    preference.removeEventListener('change', stop)
  } }
}
