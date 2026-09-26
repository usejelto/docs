// §13 v1.133: a colour-scheme change never animates. Every control fades its
// colours over `--motion-fast`, so without a pause an operating-system theme
// flip would smear across the whole page. styles.css turns transitions off
// while `data-theme-flip` is on the root; two frames cover the restyle.

/** Suppress every transition until two frames have painted. */
export function pauseTransitions(): () => void {
  const root = document.documentElement
  root.dataset.themeFlip = ''
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      frame = 0
      delete root.dataset.themeFlip
    })
  })
  return () => {
    cancelAnimationFrame(frame)
    delete root.dataset.themeFlip
  }
}

/** Pause transitions whenever the operating system flips the colour scheme. */
export function suppressThemeFlipTransitions(): () => void {
  if (typeof matchMedia !== 'function') return () => {}
  const scheme = matchMedia('(prefers-color-scheme: dark)')
  let resume: (() => void) | undefined
  function flip() {
    resume?.()
    resume = pauseTransitions()
  }
  scheme.addEventListener('change', flip)
  return () => {
    scheme.removeEventListener('change', flip)
    resume?.()
  }
}
