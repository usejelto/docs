import { mount, unmount } from 'svelte'
import ImagePreview from '@jelto/ui/ImagePreview.svelte'

// Keep the original linked PNG and caption intact until enhancement succeeds.
export function enhanceImages() {
  const previews: ReturnType<typeof mount>[] = []
  for (const paragraph of document.querySelectorAll<HTMLParagraphElement>('.docs-prose > p')) {
    if (paragraph.children.length !== 1 || paragraph.textContent?.trim()) continue
    const link = paragraph.firstElementChild
    if (!(link instanceof HTMLAnchorElement) || link.children.length !== 1) continue
    const image = link.firstElementChild
    if (!(image instanceof HTMLImageElement)) continue
    const next = paragraph.nextElementSibling
    const caption = next?.matches('p') && next.children.length === 1 && next.firstElementChild?.matches('em') && !next.firstElementChild.children.length ? next : null
    const target = document.createElement('div')
    paragraph.before(target)
    try {
      previews.push(mount(ImagePreview, { target, props: { src: link.href, thumbnailSrc: image.src, alt: image.alt, caption: caption?.textContent?.trim() ?? '' } }))
      paragraph.remove()
      caption?.remove()
    } catch { target.remove() }
  }
  return async () => { await Promise.all(previews.map((preview) => unmount(preview))) }
}
