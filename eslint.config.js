// ESLint for the documentation's browser code, its tests and the build and
// check scripts. `make lint` runs it; svelte-check (`make typecheck`) owns type
// errors, so this config adds the recommended JavaScript, TypeScript and Svelte
// rules on top.
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.js'

export default ts.config(
  // Build output, the generated agent twins and vendored snapshots (the shared
  // UI and the quality tools: their producers lint them).
  { ignores: ['dist/', 'agents/', 'vendor/', 'web/vendor/', 'coverage/'] },
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
    // The enhancements in web/ run in the reader's browser.
    files: ['web/**'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    // Build, content-check and vendor-check scripts and the tool configuration
    // run in Node.
    files: ['*.js', '*.mjs', '*.ts', 'tests/**'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: { parserOptions: { parser: ts.parser, svelteConfig } },
  },
)
