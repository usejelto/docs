// Check public prose, never the private traceability front matter. Keep these
// rules specific: customer SDK code, server integrations and DNS setup are valid.
const rules = [
  ['private source path', /\b(?:cmd\/jelto|internal\/[\w-]+|web\/(?:dashboard|snippet)|spec\/[\w.-]+|ops\/runbook|RFC-0001|SPECS\.md|PRD\.md)\b/i],
  ['platform development command', /\b(?:docker\s+exec|go\s+run\s+\.\/cmd\/jelto|make\s+(?:up|fixtures|generate|dashboard|test(?:-\w+)?|dev(?:-\w+)?))\b/i],
  ['operator configuration', /\b(?:JELTO_LS_\w*|JELTO_BOT_LIVE_VERIFIED|Operator configuration|Operator setup guide|trusted-IP-header)\b/i],
  ['private repository instructions', /(?:Jelto(?:'s|’s)?\s+(?:private\s+(?:backend|dashboard|repositor(?:y|ies)|checkout)|backend source)|private Jelto checkout|\.\.\/jelto\/sdk)/i],
  ['internal storage mechanism', /\b(?:durable revenue ledger|resumable cursor|email indexes|worker removes expired rows|Jelto serializes each total)\b/i],
  ['internal email matching mechanism', /\b(?:Jelto|email)[^\n]{0,100}\bHMAC\b/i],
  ['session-only dashboard authentication', /(?:session mutations.{0,50}(?:Origin|CSRF)|deployment Origin for CSRF)/i],
]

// This exact link targets the public contracts repository, not a private
// platform specification. Keep the exception tied to its reviewed label and URL.
const publicSdkContractLink = '[spec/wire-v1.md §4](https://github.com/usejelto/contracts/blob/main/spec/wire-v1.md#4-reserved-event-names)'

export function publicBoundaryViolations(text) {
  text = text.split(publicSdkContractLink).join('public SDK event contract')
  return rules.filter(([, pattern]) => pattern.test(text)).map(([label]) => label)
}
