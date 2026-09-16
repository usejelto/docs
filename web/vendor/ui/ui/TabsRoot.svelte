<script lang="ts">
  import { tick } from 'svelte'
  import { animatePanel } from './motion'
  import { Tabs } from 'bits-ui'
  let { class: className = '', ref = $bindable(null), value = $bindable(''), ...rest }: Tabs.RootProps = $props()
  let previous: string | undefined
  $effect(() => {
    const selected = value
    const root = ref
    const changed = previous !== undefined && previous !== selected
    previous = selected
    if (!root || !changed) return
    let cancelled = false
    let animation: Animation | undefined
    void tick().then(() => {
      if (cancelled) return
      const panel = root.querySelector<HTMLElement>('[role="tabpanel"][data-state="active"]')
      // Pending reports retain their previous content. Animate only a ready
      // panel, without replaying an entrance over stale rows or a skeleton.
      if (panel && panel.dataset.loading !== 'true' && !panel.hasAttribute('inert')) animation = animatePanel(panel)
    })
    return () => { cancelled = true; animation?.cancel() }
  })
</script>
<Tabs.Root {...rest} bind:ref bind:value class={` ${className}`} />
