<script lang="ts" generics="T extends string = string">
  let { value = $bindable('' as T), name, label, options, disabled = false, class: className = '' }:
    { value?: T | null; name: string; label: string; options: readonly { value: T; label: string; disabled?: boolean }[]; disabled?: boolean; class?: string } = $props()
</script>
<div class={`ui-radio-group ${className}`} role="radiogroup" aria-label={label}>
  {#each options as option (option.value)}
    <label class="ui-radio" data-checked={value === option.value || undefined}>
      <input type="radio" {name} value={option.value} bind:group={value} disabled={disabled || option.disabled} />
      <span>{option.label}</span>
    </label>
  {/each}
</div>
