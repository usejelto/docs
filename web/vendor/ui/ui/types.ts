import type { Snippet } from 'svelte'
import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements'

export type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ControlSize = 'compact' | 'default'
export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger'
export type ButtonProps = Omit<HTMLButtonAttributes, 'class'> & {
  class?: string
  variant?: ActionVariant
  size?: ControlSize
  loading?: boolean
  pressed?: boolean
  layout?: 'default' | 'option'
  static?: boolean
  ref?: HTMLButtonElement | null
  children?: Snippet
}
export type LinkButtonProps = Omit<HTMLAnchorAttributes, 'class' | 'href'> & {
  href: string
  disabled?: boolean
  class?: string
  variant?: ActionVariant
  size?: ControlSize
  ref?: HTMLAnchorElement | null
  children?: Snippet
}
export function actionClass(variant: ActionVariant, size: ControlSize): string {
  return `ui-btn${variant === 'secondary' ? '' : ` ui-btn--${variant}`}${size === 'compact' ? ' ui-btn--sm' : ''}`
}
