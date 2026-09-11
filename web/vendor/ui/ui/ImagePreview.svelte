<script lang="ts">
  import Maximize2 from '@lucide/svelte/icons/maximize-2'
  import ZoomIn from '@lucide/svelte/icons/zoom-in'
  import ZoomOut from '@lucide/svelte/icons/zoom-out'
  import Button from './Button.svelte'
  import Dialog from './Dialog.svelte'
  import StatusMessage from './StatusMessage.svelte'

  let { src, alt, thumbnailSrc = src, caption = '', title = 'Image preview', open = $bindable(false) }:
    { src: string; alt: string; thumbnailSrc?: string; caption?: string; title?: string; open?: boolean } = $props()
  let zoomed = $state(false)
  let loaded = $state(false)
  let failed = $state(false)
  let attempt = $state(0)
  $effect(() => {
    src
    if (open) { zoomed = false; loaded = false; failed = false; attempt = 0 }
  })
  function show(event: MouseEvent) {
    // Safari does not focus buttons on pointer activation by default.
    const trigger = event.currentTarget
    if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true })
    open = true
  }
</script>

<figure class="ui-image-preview">
  <Button variant="ghost" static class="ui-image-preview__trigger" aria-label={`Enlarge image: ${alt}`} aria-haspopup="dialog" onclick={show}>
    <img src={thumbnailSrc} {alt} loading="lazy" />
  </Button>
  <figcaption class="ui-image-preview__footer">
    {#if caption}<span class="ui-image-preview__caption">{caption}</span>{/if}
    <Button variant="ghost" size="compact" static class="ui-image-preview__enlarge" aria-haspopup="dialog" onclick={show}><Maximize2 size={14} strokeWidth={1.5} aria-hidden="true" />Enlarge image</Button>
  </figcaption>
</figure>

<Dialog bind:open {title} hideTitle size="image" dismissOnBackdrop>
  {#snippet headerActions()}
    <Button size="compact" disabled={!loaded || failed} pressed={zoomed} onclick={() => { zoomed = !zoomed }}>
      {#if zoomed}<ZoomOut size={16} strokeWidth={1.5} aria-hidden="true" />Fit to screen{:else}<ZoomIn size={16} strokeWidth={1.5} aria-hidden="true" />Actual size{/if}
    </Button>
  {/snippet}
  {#if open}
    <StatusMessage as="div" live="polite">{failed ? 'Could not load this image.' : !loaded ? 'Loading image…' : ''}</StatusMessage>
    {#if failed}
      <Button size="compact" onclick={() => { failed = false; loaded = false; attempt += 1 }}>Try again</Button>
    {:else}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Native-size images need a named scrolling region for keyboard access.) -->
      <div class="ui-image-viewer__viewport" data-zoomed={zoomed} tabindex={zoomed ? 0 : undefined} role={zoomed ? 'region' : undefined} aria-label={zoomed ? 'Full-size image. Scroll to explore.' : undefined}>
        {#key `${src}:${attempt}`}
          <img class="ui-image-viewer__image" {src} {alt} onload={() => { loaded = true }} onerror={() => { failed = true }} />
        {/key}
      </div>
    {/if}
    {#if caption}<p class="ui-image-viewer__caption">{caption}</p>{/if}
  {/if}
</Dialog>
