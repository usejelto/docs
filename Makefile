.DEFAULT_GOAL := check
.PHONY: check vendor-check content build test typecheck go-test govulncheck npm-audit security

# vendor/ holds shared tooling snapshots, not Go dependency vendoring, so the
# module is read with vendoring off and module edits disabled, as CI does.
export GOFLAGS := -mod=readonly
export GOWORK := off

# The shared quality targets (hooks, tools, secrets, osv, workflow-audit, sast)
# arrive from the contracts repository as a checksummed snapshot; `make inputs`
# in the backend refreshes it, and nothing edits it here.
include vendor/quality/quality.mk

security: secrets workflow-audit osv
