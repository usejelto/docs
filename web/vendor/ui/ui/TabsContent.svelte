<script lang="ts">
  import { Tabs } from 'bits-ui'
  let { class: className = '', ref = $bindable(null), ...rest }: Tabs.ContentProps = $props()
</script>
<Tabs.Content {...rest} bind:ref class={` ${className}`} />
