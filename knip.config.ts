// Knip: files nothing imports, unused exports and dependencies, and
// dependencies used but not declared. `make deadcode` runs it. Tests count as
// users. Everything a tool loads without an import is named here, with why.
import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    // The vendored-snapshot check, run by `make vendor-check`; Knip reads
    // package.json scripts, not the Makefile. web/main.ts, the Vite input, and
    // the npm scripts' files are found already.
    'vendor-check.mjs',
  ],
  // web/vendor/ is a vendored snapshot of another repository (the shared UI
  // as @jelto/ui, the brand and the fonts), checked by vendor-check.mjs and
  // reviewed where it is produced. bits-ui and shiki are imported only there;
  // Knip counts them as peer dependencies the @jelto/ui package declares.
  project: ['web/**/*.{ts,svelte}', '!web/vendor/**', 'tests/**/*.mjs', '*.{js,mjs,ts}'],
}

export default config
