<script lang="ts">
  let { name, value, disabled, required, trigger, oninvalid }: {
    name?: string
    value: string
    disabled: boolean
    required: boolean
    trigger: HTMLButtonElement | null
    oninvalid: () => void
  } = $props()
</script>

{#if required}
  <!-- A hidden input cannot participate in native constraint validation. -->
  <input class="sr-only" tabindex="-1" aria-hidden="true" {name} {value} {disabled} required
    onfocus={() => trigger?.focus()}
    oninvalid={(event) => { event.preventDefault(); oninvalid(); trigger?.focus() }} />
{:else if name}
  <input type="hidden" {name} {value} {disabled} />
{/if}
