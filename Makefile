.DEFAULT_GOAL := check
.PHONY: check vendor-check content build test typecheck go-test govulncheck npm-audit security

# vendor/ holds shared tooling snapshots, not Go dependency vendoring, so the
# module is read with vendoring off and module edits disabled, as CI does.
export GOFLAGS := -mod=readonly
export GOWORK := off

# Build, test and scan with the Go release go.mod names rather than whatever
# newer one is installed: govulncheck judges the standard library by the
# toolchain that runs it, so a newer local Go hides advisories CI reports.
export GOTOOLCHAIN := go$(shell sed -n 's/^go //p' go.mod)

# The shared quality targets (hooks, tools, secrets, osv, workflow-audit, sast)
# arrive from the contracts repository as a checksummed snapshot; `make inputs`
# in the backend refreshes it, and nothing edits it here.
include vendor/quality/quality.mk

security: secrets workflow-audit osv npm-audit govulncheck

# The whole gate: what to run before a pull request, and what CI runs.
check: vendor-check content build test typecheck go-test security

node_modules: package.json package-lock.json
	npm ci --no-audit --no-fund
	@touch $@

vendor-check:
	node vendor-check.mjs

# Public page, metadata, link and boundary checks.
content: node_modules
	npm run check:content

build: node_modules
	npm run build

test: node_modules
	npm test

typecheck: node_modules
	npm run check

# Assets are built first: the Go tests assert the rendered output.
go-test: build
	go test ./... -count=1

govulncheck:
	go run golang.org/x/vuln/cmd/govulncheck@v1.8.0 ./...

npm-audit:
	npm audit --audit-level=moderate --package-lock-only
