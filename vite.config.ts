import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte(), {
    name: 'docs-embed-assets',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'PLACEHOLDER', source: 'Run npm run build in docs to build the documentation assets.\n' })
      for (const [name, source] of [
        ['mascot-mark.svg', 'brand/mascot-mark.svg'],
        ['JELTO-BRAND-NOTICE.txt', 'brand/NOTICE.txt'],
        ['OFL-DM-Sans.txt', 'fonts/OFL-DM-Sans.txt'],
      ]) {
        this.emitFile({
          type: 'asset',
          name,
          originalFileName: 'web/vendor/' + source,
          source: readFileSync(new URL('./web/vendor/' + source, import.meta.url)),
        })
      }
    },
  }],
  resolve: { conditions: ['browser'], dedupe: ['svelte'] },
  base: '/docs/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    manifest: 'manifest.json',
    rollupOptions: { input: fileURLToPath(new URL('./web/main.ts', import.meta.url)) },
  },
  test: {
    include: ['web/**/*.test.ts'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./web/test-setup.ts'],
  },
})
