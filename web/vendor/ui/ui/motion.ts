import type { TransitionConfig } from 'svelte/transition'

// JavaScript transitions mirror app.css's motion tokens. CSS custom properties
// cannot supply Svelte's numeric duration or easing function, so the values live
// here once, beside the only conditional boundaries that need an outro.
const FAST_MS = 150
const BASE_MS = 200
const ENTER_MS = 240

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

/** app.css's `--ease: cubic-bezier(0.2, 0, 0, 1)` as a Svelte easing. */
export function uiEase(value: number): number {
  if (value <= 0 || value >= 1) return value

  let low = 0
  let high = 1
  let t = value
  for (let i = 0; i < 12; i += 1) {
    const x = sampleCurve(t, 0.2, 0)
    const delta = x - value
    if (Math.abs(delta) < 0.00001) break
    if (delta < 0) low = t
    else high = t

    const slope = sampleCurveSlope(t, 0.2, 0)
    const candidate = slope > 0.000001 ? t - delta / slope : (low + high) / 2
    t = candidate > low && candidate < high ? candidate : (low + high) / 2
  }
  return sampleCurve(t, 0, 1)
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

function boundary(duration: number, y: number): TransitionConfig {
  const reduced = prefersReducedMotion()
  return {
    duration: reduced ? FAST_MS : duration,
    easing: uiEase,
    css: (t, u) => `opacity: ${t}; transform: ${reduced ? 'none' : `translateY(${u * y}px)`}`,
  }
}

/** A rare, one-shot result entering on the `--motion-enter` tier. */
export function enterOneShot(_node: Element, { y = 1 }: BoundaryParams = {}): TransitionConfig {
  return boundary(ENTER_MS, y)
}

/** An occasional surface entering on the `--motion-base` tier. */
export function enterSurface(_node: Element, { y = 1 }: BoundaryParams = {}): TransitionConfig {
  return boundary(BASE_MS, y)
}

/** The symmetric return path, always on the `--motion-fast` tier. */
export function exitFast(_node: Element, { y = 1 }: BoundaryParams = {}): TransitionConfig {
  return boundary(FAST_MS, y)
}

/** Shared, interruptible dashboard motion. No animation owns persistent styles. */
const timing = { duration: 240, easing: 'cubic-bezier(0.2, 0, 0, 1)' }
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function animatePanel(node: HTMLElement): Animation | undefined {
  if (reduced() || !node.animate) return
  return node.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], timing)
}

/** Animate content changes, never observer-generated layout changes. Grid cards
 * stretch to their neighbours: animating ResizeObserver notifications would make
 * each card chase the other's temporary height indefinitely. */
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
  const mutation = new MutationObserver(schedule)
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
