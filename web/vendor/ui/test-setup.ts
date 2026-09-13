import '@testing-library/jest-dom/vitest'
import { afterAll } from 'vitest'

const finishCleanup = globalThis.setTimeout
afterAll(async () => {
  // Bits UI releases its final body lock on a 24 ms timer after unmount.
  if (typeof document !== 'undefined') await new Promise((resolve) => finishCleanup(resolve, 32))
})

// ---------------------------------------------------------------------------
// The two browser APIs jsdom does not implement and the hero chart needs.
//
// the dashboard specification §4's hero is LayerChart (§13 v1.48). Two things about it
// reach APIs jsdom lacks — measured, not assumed:
//
//   typeof window.matchMedia: undefined
//   typeof ResizeObserver:    undefined
//
// `svelte/motion`, which LayerChart imports, constructs its
// `prefersReducedMotion` MediaQuery at MODULE LOAD through `window.matchMedia`
// — so without it the whole module graph fails to import, and every test in
// any file that reaches HeroChart.svelte (Dashboard.test.ts and App.test.ts
// included) errors before its first assertion. The stub answers "no match",
// which under jsdom is as true as any answer. LayerChart's <Chart> sizes
// itself with Svelte's `bind:clientWidth`, and Svelte 5 implements that
// binding on a ResizeObserver it constructs on first use; the stub observes
// nothing and never fires. Svelte also reads `clientWidth` directly on mount,
// and jsdom's answer is 0, which is the truthful width of an element that has
// no layout: every test that asserts on the chart asserts on its MARKUP, never
// on a measured size.
//
// (Through v1.47 the chart was uPlot on a canvas, and this file also stubbed
// Path2D and a 2D context for it. The SVG chart needs neither, nothing else in
// src/ does, and they are gone.)
//
// TEST-ENVIRONMENT gaps, not product behaviour: a real browser has both.
// Nothing in src/ may branch on them.
// ---------------------------------------------------------------------------

const noop = (): void => {}

// Bits UI scrolls the highlighted select option into view during keyboard
// navigation. jsdom has no layout or scrolling; real-browser QA covers it.
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: noop })
}

// Torph's injected sheet ends with one nested rule used only by `debug=true`.
// Browsers in the support matrix parse CSS nesting; jsdom 26 does not. Strip
// that unused debug tail in jsdom before its stylesheet parser sees it, while
// leaving all runtime Torph styles and all application styles untouched.
if (typeof HTMLHeadElement !== 'undefined' && typeof HTMLStyleElement !== 'undefined') {
  const appendToHead = HTMLHeadElement.prototype.appendChild
  HTMLHeadElement.prototype.appendChild = function <T extends Node>(node: T): T {
    if (node instanceof HTMLStyleElement && node.dataset.torph === 'true' && node.textContent !== null) {
      const debugRule = node.textContent.indexOf('[torph-root][torph-debug]')
      if (debugRule >= 0) node.textContent = node.textContent.slice(0, debugRule)
    }
    return appendToHead.call(this, node) as T
  }
}

if (typeof globalThis.matchMedia !== 'function') {
  Object.defineProperty(globalThis, 'matchMedia', {
    configurable: true,
    value: (media: string) => ({
      media,
      matches: false,
      onchange: null,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
      dispatchEvent: () => false,
    }),
  })
}

if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver !== 'function') {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: ResizeObserverStub })
}

// Svelte's transition runtime uses Element.animate(). jsdom has no Web
// Animations API, so finish both its delay animation and its generated
// keyframes on the next microtask. Product code still runs the real browser
// implementation; this only lets tests observe the settled DOM.
if (typeof Element !== 'undefined' && typeof Element.prototype.animate !== 'function') {
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: () => {
      let handler: (() => void) | null = null
      const animation = {
        finished: Promise.resolve(),
        currentTime: 0,
        effect: {} as AnimationEffect | null,
        playState: 'running' as AnimationPlayState,
        cancel() {
          animation.playState = 'idle'
        },
        get onfinish() {
          return handler
        },
        set onfinish(next: (() => void) | null) {
          handler = next
          queueMicrotask(() => {
            if (handler !== next || next === null) return
            animation.playState = 'finished'
            next()
          })
        },
      }
      return animation as unknown as Animation
    },
  })
}

// Torph cancels in-flight Web Animations through getAnimations() before an
// interrupt or teardown. jsdom implements neither half of that API, so its
// empty animation list is the truthful counterpart to the animate() stub.
if (typeof Element !== 'undefined' && typeof Element.prototype.getAnimations !== 'function') {
  Object.defineProperty(Element.prototype, 'getAnimations', {
    configurable: true,
    value: () => [],
  })
}

// dnd-kit finishes document animations before measuring sortable items.
// jsdom has no animation timeline at either the element or document level.
if (typeof Document !== 'undefined' && typeof Document.prototype.getAnimations !== 'function') {
  Object.defineProperty(Document.prototype, 'getAnimations', { configurable: true, value: () => [] })
}

// Floating UI asks whether its anchor is in the browser's top layer. jsdom
// implements none of these APIs. Its NWSAPI selector engine instead delegates
// :modal/:fullscreen back to Element.matches, recursively (confirmed by a CPU
// profile of the crawler popover test). Answer only those unavailable native
// states; ordinary selector matching and all application code remain unchanged.
if (typeof Element !== 'undefined' && typeof HTMLElement !== 'undefined') {
  const unavailableTopLayer = new Set<string>()
  if (typeof HTMLElement.prototype.showPopover !== 'function') unavailableTopLayer.add(':popover-open')
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') unavailableTopLayer.add(':modal')
  if (typeof Element.prototype.requestFullscreen !== 'function') unavailableTopLayer.add(':fullscreen')
  const nativeMatches = Element.prototype.matches
  Element.prototype.matches = function (selector: string): boolean {
    return unavailableTopLayer.has(selector) ? false : nativeMatches.call(this, selector)
  }
}
