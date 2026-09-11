export const HOVER_CARD_GAP = 12
export const HOVER_CARD_EDGE = 8

export type HoverCardSide = 'top' | 'bottom'
export type HoverCardAlign = 'start' | 'center' | 'end'

export interface HoverCardSize {
  width: number
  height: number
}

export interface HoverCardViewport {
  width: number
  height: number
}

export interface HoverCardPlacement {
  x: number
  y: number
  side: HoverCardSide
  align: HoverCardAlign
}

export interface HoverCardPoint {
  x: number
  y: number
}

export interface HoverCardRect {
  left: number
  right: number
  top: number
  bottom: number
  width: number
  height: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function horizontalPlacement(
  preferredX: number,
  fallbackX: number,
  size: HoverCardSize,
  viewport: HoverCardViewport,
): Pick<HoverCardPlacement, 'x' | 'align'> {
  const maxX = viewport.width - size.width - HOVER_CARD_EDGE
  if (preferredX + size.width <= viewport.width - HOVER_CARD_EDGE) {
    return { x: clamp(preferredX, HOVER_CARD_EDGE, maxX), align: 'start' }
  }
  if (fallbackX >= HOVER_CARD_EDGE) {
    return { x: clamp(fallbackX, HOVER_CARD_EDGE, maxX), align: 'end' }
  }
  return { x: clamp(preferredX, HOVER_CARD_EDGE, maxX), align: 'center' }
}

/** Pointer cards prefer the upper-right quadrant, then flip only to remain visible. */
export function placeHoverCardAtPoint(
  point: HoverCardPoint,
  size: HoverCardSize,
  viewport: HoverCardViewport,
): HoverCardPlacement {
  const horizontal = horizontalPlacement(
    point.x + HOVER_CARD_GAP,
    point.x - HOVER_CARD_GAP - size.width,
    size,
    viewport,
  )
  const above = point.y - HOVER_CARD_GAP - size.height
  const fitsAbove = above >= HOVER_CARD_EDGE
  const side: HoverCardSide = fitsAbove ? 'top' : 'bottom'
  const preferredY = fitsAbove ? above : point.y + HOVER_CARD_GAP
  return {
    ...horizontal,
    y: clamp(preferredY, HOVER_CARD_EDGE, viewport.height - size.height - HOVER_CARD_EDGE),
    side,
  }
}

/** Keyboard cards centre on their trigger and prefer above it. */
export function placeHoverCardAtElement(
  rect: HoverCardRect,
  size: HoverCardSize,
  viewport: HoverCardViewport,
): HoverCardPlacement {
  const centered = rect.left + rect.width / 2 - size.width / 2
  const clampedX = clamp(centered, HOVER_CARD_EDGE, viewport.width - size.width - HOVER_CARD_EDGE)
  const above = rect.top - HOVER_CARD_GAP - size.height
  const fitsAbove = above >= HOVER_CARD_EDGE
  const side: HoverCardSide = fitsAbove ? 'top' : 'bottom'
  const preferredY = fitsAbove ? above : rect.bottom + HOVER_CARD_GAP
  const centerDelta = clampedX - centered
  const align: HoverCardAlign = Math.abs(centerDelta) < 1 ? 'center' : centerDelta > 0 ? 'start' : 'end'
  return {
    x: clampedX,
    y: clamp(preferredY, HOVER_CARD_EDGE, viewport.height - size.height - HOVER_CARD_EDGE),
    side,
    align,
  }
}

export function hoverCardSize(
  element: HTMLElement | null | undefined,
  fallback: HoverCardSize = { width: 224, height: 152 },
): HoverCardSize {
  return {
    width: element?.offsetWidth || fallback.width,
    height: element?.offsetHeight || fallback.height,
  }
}

export function browserViewport(): HoverCardViewport {
  return { width: window.innerWidth, height: window.innerHeight }
}
