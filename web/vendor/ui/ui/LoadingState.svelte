<script lang="ts">
  import LoaderCircle from '@lucide/svelte/icons/loader-circle'
  let { label, class: className = '' }: { label: string; class?: string } = $props()
</script>
<div class={`ui-loading-state ${className}`} role="status"><LoaderCircle class="ui-loading-icon" size={16} aria-hidden="true" />{label}</div>
