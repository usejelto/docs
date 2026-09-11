<script lang="ts">
  import { CodeBlock, CopyButton } from '@jelto/ui'
  import type { CodeLanguage } from '@jelto/ui/highlightCode'
  let { text, language, wrap = false }: { text: string; language: CodeLanguage; wrap?: boolean } = $props()
  const names: Record<CodeLanguage, string> = { text: 'Code', html: 'HTML', javascript: 'JavaScript', typescript: 'TypeScript', swift: 'Swift', csharp: 'C#', bash: 'Shell' }
</script>
<div class="docs-code-toolbar"><span class="docs-code-language">{names[language]}</span><CopyButton {text} label="Copy code" copiedLabel="Copied" failureLabel="Could not copy. Select the code and copy it manually." resetAfter={2000} /></div>
<CodeBlock {text} {language} {wrap} label={`${language} code example`} />
