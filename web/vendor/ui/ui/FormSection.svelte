<script lang="ts" module>
  import { getContext, setContext } from 'svelte'
  export type FormSectionVariant = 'plain' | 'panel' | 'divided'
  const PANEL = Symbol('jelto.form-section.panel')
  /**
   * Design system §10: a container that already draws the boundary (the
   * settings shell's single canvas, a guided panel) asks the panel sections
   * inside it to render as divided sections — a top rule and whitespace —
   * instead of repainting `.ui-form-section` from route CSS.
   */
  export function setFormSectionPanel(variant: Exclude<FormSectionVariant, 'panel'>): void {
    setContext(PANEL, variant)
  }
  function inheritedPanel(): Exclude<FormSectionVariant, 'panel'> | undefined {
    return getContext<Exclude<FormSectionVariant, 'panel'> | undefined>(PANEL)
  }
</script>
<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes, HTMLFormAttributes } from 'svelte/elements'
  import { focusInvalid } from './field'
  let { as = 'section', variant = 'plain', tone = 'neutral', class: className = '', children, ...rest }:
    Omit<HTMLAttributes<HTMLElement> & HTMLFormAttributes, 'class'> & { as?: 'section' | 'div' | 'form'; variant?: FormSectionVariant; tone?: 'neutral' | 'danger'; class?: string; children: Snippet } = $props()
  const panel = inheritedPanel()
  const resolved = $derived(variant === 'panel' ? (panel ?? 'panel') : variant)
  function enhance(node: HTMLElement) {
    if (node instanceof HTMLFormElement) return focusInvalid(node)
  }
</script>
<svelte:element this={as} {...rest} use:enhance class={`ui-form-section ${className}`} data-variant={resolved} data-tone={tone}>{@render children()}</svelte:element>
