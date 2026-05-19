---
id: ins_anthropic-claude-security-data-flow-scanning
operator: Anthropic
operator_role: AI safety company and model developer
co_operators: []
source_url: "https://www.anthropic.com/news/claude-code-security"
source_type: post
source_title: Claude Code Security
source_date: 2026-05-19
captured_date: 2026-05-19
domain: [product, engineering]
lifecycle: [product-development]
maturity: applied
artifact_class: case-study
score: { originality: 4, specificity: 4, evidence: 4, transferability: 3, source: 5 }
tier: B
related: [ins_anthropic-claude-code-subagents-haiku-routing, ins_dark-factory-pattern]
raw_ref: 
---

# Security scanning via data flow tracing finds business logic flaws that pattern-matching tools miss for years

## Claim
Scanning codebases by tracing data flows and component interactions catches business logic vulnerabilities that traditional pattern-matching scanners never surface.

## Mechanism
Pattern-matching scanners check for known vulnerability shapes: SQLi, XSS, hardcoded secrets. Business logic flaws have no known shape. They emerge from how data moves through specific system paths. A scanner that traces actual data flows can follow the path a real attacker would follow, surfacing logic errors specific to that codebase rather than matching against a static rulebook.

## Conditions
Holds when: the codebase has complex data flows, API integrations, or custom business logic where the vulnerability is contextual and relational.
Fails when: the vulnerability class is a well-known structural pattern. Traditional scanners cover those faster and cheaper.

## Evidence
Claude Security entered public beta in May 2026 for Enterprise and Team customers, powered by Opus 4.7. Anthropic reports hundreds of organizations used it to fix production vulnerabilities that existing tools had missed for years. The differentiator is not model size but method: data flow tracing over pattern matching.

## Signals
- Scanner surfaces a vulnerability that requires understanding multiple components together
- Finding describes how data moves through the system, not just where a bad pattern appears
- Fix requires changing business logic, not sanitizing an input

## Counter-evidence
Data flow tracing generates more false positives and runs slower than pattern matching. For commoditized vulnerability classes, traditional scanners are faster and sufficient.

## Cross-references
- `ins_anthropic-claude-code-subagents-haiku-routing`
- `ins_dark-factory-pattern`
