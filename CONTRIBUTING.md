# Contributing to Jelto documentation

Bug reports, corrections, examples and focused changes are welcome.
Participants follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Start a contribution

Search [existing issues](https://github.com/usejelto/docs/issues) before opening one. Use a bug report for
reproducible failures, a feature request to explain a use case, or a blank issue
for questions and corrections. Discuss substantial changes before implementing
them; small fixes can go straight to a PR.

Send security reports privately as described in [SECURITY.md](SECURITY.md).
For setup and account help, see [SUPPORT.md](SUPPORT.md).

## Local development

Node 24.22.2 (the release `.nvmrc` pins), the Go release `go.mod` names
(`make` selects it through `GOTOOLCHAIN`), and Make.

Fork and clone this repository, create a branch from `main`, and run commands
from this repository's root. A standalone checkout contains its build inputs;
you do not need the private Jelto backend, and no instruction here should ask
you for it.

```sh
make hooks   # once per clone
make check   # the whole gate; CI runs the same command
```

`make check` runs `vendor-check`, `lint`, `deadcode`, `content`, `build`,
`test`, `typecheck`, `go-test` and `security`; each is also a target of its
own.

Guide prose, navigation and images live in `content/`. Go handlers, search and templates live in this directory; browser enhancements live in `web/`. Build the assets before the Go checks so the rendered-asset assertions run.

Vendored inputs under `vendor/` are checked-in snapshots with recorded sources
and checksums. Do not edit them by hand; they are refreshed by an explicit
update command that reviews the pin diff.

## Checks and exceptions

`make check` is the whole gate, and the command CI runs on Linux. `make hooks`
enables two Git hooks once per clone: `commit-msg` rejects a subject that is
not a Conventional Commit, and `pre-commit` runs gitleaks over the staged
changes. Do not bypass them with `--no-verify`.

The security targets run separate programs, not project dependencies.
`vendor/quality/tools.json` pins each one's exact version and SHA-256; the first run
downloads and verifies it into `~/.cache/jelto-tools` (`JELTO_TOOLS_DIR`
overrides the location), and `make tools` installs them all ahead of time.
`vendor/quality/` is a checksummed snapshot of the contracts repository's
`tools/quality/`; change it there, not here. golangci-lint is one of those
programs; ESLint and Knip are development dependencies, pinned by
`package-lock.json`.

| Target | Tool | What it checks |
|---|---|---|
| `make lint` | golangci-lint, ESLint | the standard Go linters and gofmt (`.golangci.yml`); the recommended JavaScript, TypeScript and Svelte rules (`eslint.config.js`), no warnings |
| `make deadcode` | Knip | files nothing imports, unused exports and dependencies, undeclared dependencies (`knip.config.ts`; `web/vendor/` is left to its producer) |
| `make secrets` | gitleaks | the whole Git history for credentials |
| `make workflow-audit` | actionlint, zizmor | workflow syntax, script injection, permissions and pinning |
| `make osv` | OSV-Scanner | `package-lock.json` and `go.sum` against the OSV database, downloaded and matched locally |
| `make npm-audit` | npm audit | `package-lock.json` against the npm advisory database |
| `make govulncheck` | govulncheck | Go code paths that reach a known vulnerability |

When a check reports something, fix a real problem in the same change. A
deliberate exception, or a finding the tool got wrong, is marked at the one
place it applies, with the reason beside it:

- gitleaks: a `.gitleaks.toml` allowlist entry naming the one literal and why;
- zizmor: `# zizmor: ignore[<audit>]` on the line, with the reason above it;
- OSV-Scanner: an `[[IgnoredVulns]]` entry in `osv-scanner.toml` with a
  `reason` and an `ignoreUntil` date;
- golangci-lint: `//nolint:<linter> // <reason>` at the end of the line;
- ESLint: `// eslint-disable-next-line <rule> -- <reason>` above the line, or
  `<!-- eslint-disable-next-line <rule> -- <reason> -->` in Svelte markup (an
  `eslint-disable`/`eslint-enable` pair around one element that Prettier
  spreads over several lines);
- Knip: an entry or `ignoreDependencies` line in `knip.config.ts` with the
  reason above it, or `/** @public */` on an export something outside the
  import graph uses.

Never disable a rule, a file or a directory wholesale, and never relax a
threshold to make a check pass.

## Review and acceptance

Keep changes focused and match the surrounding style. Add regression coverage
for behavior changes. Do not update an expected value just to match a failing
implementation.

Use a scoped Conventional Commit title, such as `fix(docs): correct the
retry example`. Describe the problem, the resulting behavior, the related issue
or specification, compatibility impact, and the exact verification commands with
their results. State when a check was not run and why.

Use synthetic data in examples and reports. Never include credentials, customer
payloads or IP addresses. Contributions must preserve Jelto's privacy
boundaries: no IP storage or logging, and no row-level identifier that joins a
website visitor to an app install.

Taha Bozdemir reviews scope, correctness and compatibility, and decides whether
to merge. Review is best effort with no guaranteed turnaround.

## Licensing

Submit only work you have the right to contribute. Code, including the code
examples inside the prose, is contributed under the [MIT licence](LICENSE);
the guides under `content/` is contributed under
[CC BY 4.0](LICENSE-DOCS.md). Preserve third-party notices and the Contributor
Covenant attribution. Jelto names, logos, mascots and original brand artwork are
excluded from both licences; no trademark rights are granted. No separate CLA or
DCO sign-off is required.
