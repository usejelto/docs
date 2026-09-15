<script lang="ts">
  import IconButton from './IconButton.svelte'
  import type { Snippet } from 'svelte'

  let { label, heading, hint, children, pressed, onclick, ...rest }: {
    label: string; heading: string; hint: string; children: Snippet; pressed: boolean; onclick: () => void;
    [key: `data-${string}`]: string | undefined
  } = $props()
</script>

<IconButton {...rest} {label} title={heading} {hint} {pressed} {onclick} variant="secondary">
  {@render children()}
</IconButton>
