<script lang="ts">
  import { Tabs } from 'bits-ui'
  let { class: className = '', ref = $bindable(null), ...rest }: Tabs.TriggerProps = $props()
</script>
<Tabs.Trigger {...rest} bind:ref class={`ui-tab ui-pill ${className}`} />
