/** Keep sticky offsets equal to the rendered chrome, including wrapping. */
export function measureHeight(node: HTMLElement, property: string): { destroy: () => void } {
  const style = document.documentElement.style
  const previous = style.getPropertyValue(property)
  const update = (): void => {
    const height = node.getBoundingClientRect().height
    if (height > 0) style.setProperty(property, `${height}px`)
  }
  update()
  const observer = new ResizeObserver(update)
  observer.observe(node)
  return {
    destroy: () => {
      observer.disconnect()
      if (previous) style.setProperty(property, previous)
      else style.removeProperty(property)
    },
  }
}
