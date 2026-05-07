---
id: ins_dreaming-cross-session-memory-curation
operator: Anthropic
operator_role: AI safety research company and Claude developer
co_operators: []
source_url: unknown
source_type: talk
source_title: Code with Claude
source_date: 2026-05-06
captured_date: 2026-05-07
domain: [ai-product]
lifecycle: [retention, onboarding]
maturity: frontier
artifact_class: workflow
score: { originality: 5, specificity: 3, evidence: 3, transferability: 4, source: 3 }
tier: A
related: [ins_outcomes-grader-agent-evaluation, ins_traces-need-feedback-to-learn, ins_make-verification-easy-ai-production, ins_mine-transcripts-to-promote-config]
raw_ref: 
---

# Scheduled cross-session transcript reading extracts patterns and proposes memory updates for human review before they land

## Claim
A scheduled background process reads past session transcripts and memory stores, extracts cross-session patterns (recurring mistakes, emerging best practices, stale memory, contradictions), and proposes curated memory updates. Updates require human review and approval before applying.

## Mechanism
Single-session memory loses cross-session signal. A process that reads across sessions surfaces patterns no individual session can see. The human review gate prevents drift: proposed updates are visible, reversible, and auditable before they change the agent's operating context. This is proposed memory, not automated memory.

## Conditions
Holds when: session transcripts are stored and accessible. Cross-session patterns exist because the agent runs repeatedly on similar tasks. A human can review proposals on a cadence that matches session frequency.
Fails when: sessions are too infrequent or too varied for patterns to emerge. Review is skipped, turning the process into unreviewed automated memory.

## Evidence
Announced as a gated research preview at Code with Claude, May 6, 2026. The feature reads past session transcripts and memory stores, extracts cross-session patterns, and curates memory updates with the option to review changes before they land.

## Signals
- Proposed updates cluster around the same mistake class week-over-week (root cause, not symptom)
- Human reviewers approve the majority of proposals without edits (extraction quality is calibrated)
- Memory staleness rate drops after several weeks of scheduled runs

## Counter-evidence
Scheduled extraction without a review gate becomes unaudited automated memory. Low session volume produces noisy signal with poor pattern quality. The extraction process can surface coincidental patterns rather than causal ones.

## Cross-references
- `ins_outcomes-grader-agent-evaluation` (Anthropic): paired feature — Outcomes closes the output loop, Dreaming closes the memory loop
- `ins_traces-need-feedback-to-learn` (Harrison Chase): traces without feedback are incomplete; Dreaming applies that principle to persistent state
- `ins_mine-transcripts-to-promote-config`: mining transcripts to promote patterns into config
