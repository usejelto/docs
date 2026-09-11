# Documentation source layout

Public guides, navigation and images live in [`content/`](content/README.md).
Edit that Markdown to change the documentation visitors read. Source paths gain
a `content/` prefix; public `/docs/` URLs and guide-relative links do not.

Go handlers, search, HTML/CSS templates and their tests live in this directory,
which has its own Go module. Browser enhancements and their tests live in
`web/`, with a local Node package, lockfile and Vite configuration.

Shared UI is the pinned `@jelto/ui` package in `web/vendor/ui/`. Jelto artwork
and the OFL-licensed DM Sans font are separate snapshots in `web/vendor/brand/`
and `web/vendor/fonts/`; see [asset licensing](ASSET-LICENSES.md). Each generated
manifest records the authoritative sources and checksums. A snapshot is refreshed
by an explicit maintainer update that reviews the pin diff, never by a build; run
`npm ci` after the UI snapshot changes. Building needs only this repository and
its normal package dependencies.

From this directory: `npm ci`, `npm run build`, `npm test`, `npm run check`,
`npm run check:content`, and `go test ./...`. Build assets before the Go checks
to include the rendered asset and logo assertions.

- `npm run check:content`: validate all public pages, metadata, links and boundaries.
- `npm run build:agents`: generate agent copies and `llms.txt` from the same sources.
- `npm run build`: build browser enhancements into `dist/`.
- `npm test` and `npm run check`: run the browser and type checks.
- `go test ./... -count=1`: verify public serving, search and content boundaries.

`agents/`, `llms.txt` and `dist/` are generated outputs. Only manifest-listed
guides and approved assets are served: this README, the server sources and the
tests are part of the repository but are never published as documentation pages.

Code here is MIT ([LICENSE](LICENSE)); the guides under `content/` are CC BY 4.0
([LICENSE-DOCS.md](LICENSE-DOCS.md)), and code examples inside them are MIT.
