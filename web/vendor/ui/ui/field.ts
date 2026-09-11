import { tick } from 'svelte'
export const FIELD = Symbol('jelto.form-field')
export interface FieldContext {
  readonly id: string
  readonly describedby: string | undefined
  readonly invalid: boolean
}
export function focusInvalid(form: HTMLFormElement): { destroy: () => void } {
  const focus = () => { void tick().then(() => {
    if (form.isConnected) form.querySelector<HTMLElement>('[aria-invalid="true"], :invalid')?.focus()
  }) }
  form.addEventListener('submit', focus)
  return { destroy: () => form.removeEventListener('submit', focus) }
}
