import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const languages = {
  html: () => import('shiki/langs/html.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  swift: () => import('shiki/langs/swift.mjs'),
  csharp: () => import('shiki/langs/csharp.mjs'),
  bash: () => import('shiki/langs/shellscript.mjs'),
}

export type CodeLanguage = keyof typeof languages | 'text'
export type CodeToken = { content: string; color?: string }

let highlighter: Promise<HighlighterCore> | undefined
const loadingLanguages = new Map<CodeLanguage, Promise<void>>()

function getHighlighter(): Promise<HighlighterCore> {
  // This module is itself lazy-loaded. One engine serves every mounted example;
  // grammars load only when used, and no source text leaves the browser.
  highlighter ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [],
    themes: [{
      name: 'jelto',
      colors: { 'editor.foreground': 'var(--ink)', 'editor.background': 'var(--ground)' },
      tokenColors: [
        { scope: ['comment'], settings: { foreground: 'var(--muted)' } },
        { scope: ['keyword', 'storage'], settings: { foreground: 'var(--web)' } },
        { scope: ['string'], settings: { foreground: 'var(--good)' } },
        { scope: ['constant', 'variable.other.constant'], settings: { foreground: 'var(--warn)' } },
        { scope: ['entity.name.function', 'support.function', 'entity.name.tag'], settings: { foreground: 'var(--accent)' } },
        { scope: ['entity.name.type', 'support.type', 'support.class', 'entity.other.attribute-name'], settings: { foreground: 'var(--web)' } },
      ],
    }],
  }).catch((error: unknown) => {
    highlighter = undefined
    throw error
  })
  return highlighter
}

export async function highlightCode(text: string, language: CodeLanguage): Promise<CodeToken[]> {
  if (language === 'text' || !text) return [{ content: text }]
  const engine = await getHighlighter()
  let loading = loadingLanguages.get(language)
  if (!loading) {
    loading = engine.loadLanguage(languages[language]).catch((error: unknown) => {
      loadingLanguages.delete(language)
      throw error
    })
    loadingLanguages.set(language, loading)
  }
  await loading

  const { tokens } = engine.codeToTokens(text, { lang: language, theme: 'jelto' })
  const result: CodeToken[] = []
  let end = 0
  for (const line of tokens) {
    for (const token of line) {
      // Tokens omit line endings. Retain the source's exact LF/CRLF, blank lines
      // and trailing whitespace instead of reconstructing them from the DOM.
      if (token.offset > end) result.push({ content: text.slice(end, token.offset) })
      result.push({ content: token.content, color: token.color })
      end = token.offset + token.content.length
    }
  }
  if (end < text.length) result.push({ content: text.slice(end) })
  return result
}
