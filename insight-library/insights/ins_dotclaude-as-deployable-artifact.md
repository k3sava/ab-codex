---
id: ins_dotclaude-as-deployable-artifact
operator: Pawel Huryn
operator_role: Product Compass author; PM coach
source_url: https://www.productcompass.pm/archive
source_type: essay
source_title: Product Compass — Claude Code as PM Infrastructure (April 2026 sequence)
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [ai-native, product]
lifecycle: [tooling-config, process-cadence]
maturity: applied
artifact_class: workflow
score: { originality: 3, specificity: 4, evidence: 3, transferability: 4, source: 3 }
tier: B
related: [ins_llm-wiki-pattern, ins_use-new-tools-as-new-tools]
raw_ref: raw/essays/pawel-huryn--claude-code-as-config--2026-04-27.md
---

# Treat `.claude/` as a deployable artifact with versioning and rollback

## Claim
LLM tool configuration (`.claude/`, agent identities, tool inventories) is production infrastructure, not a one-time setup — versioning it as a deployable artifact with rollback expectations catches cost regressions, capability shifts, and quality drift before they propagate.

## Mechanism
LLM tool configuration directly controls cost, capability, and quality. Unversioned config drift is invisible until a cost spike or quality regression surfaces (often weeks later, at month-close billing). Treating config as code (versioned, reviewed, rolled forward and back) catches drift at change time, makes cost shifts auditable, and lets teams compare configurations across machines or operators. The same hygiene that production codebases enforce applies to the agent-config layer.

## Conditions
Holds when:
- The team uses Claude Code (or equivalent LLM tooling) as a sustained workflow, not one-off prompts.
- Multiple operators or machines share the same agent setup.
- Cost or capability shifts have material business impact.

Fails when:
- The team is using LLM tools casually and config-as-code overhead exceeds value.
- Tooling doesn't expose config in a versionable form.
- Operators treat config edits as personal preference and reject shared-versioning discipline.

## Evidence
April 27 entry: cut "$1,389/mo to $200/mo on the same Claude Code workflow" by fixing setup, not by rationing usage.

April 14 entry: treat `.claude/` as a deployable artifact with versioning and rollback expectations.

— Pawel Huryn, *Product Compass*, https://www.productcompass.pm/archive, April 2026

## Signals
- `.claude/` (or equivalent) lives in version control with a CHANGELOG.
- Cost-per-task is tracked alongside capability changes and tied to config commits.
- Rollback is a named operation, not an emergency improv.

## Counter-evidence
For solo operators, config-as-code overhead can exceed value; manual edits and verbal memory work fine. The discipline becomes load-bearing only at team scale or when cost is material.

## Cross-references
- `ins_llm-wiki-pattern` — Karpathy's parallel for the knowledge layer.
- `ins_use-new-tools-as-new-tools` — adjacent claim about treating new tools as their own thing.
