---
id: ins_advisor-tool-replaces-ensemble
operator: Cat Wu
operator_role: Head of Product, Claude Code + Co-work, Anthropic
source_url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool
source_type: essay
source_title: Anthropic Advisor Tool — public beta documentation
source_date: 2026-04-26
captured_date: 2026-05-02
domain: [ai-native, engineering]
lifecycle: [ai-workflow, tooling-config]
maturity: applied
artifact_class: framework
score: { originality: 3, specificity: 5, evidence: 4, transferability: 4, source: 5 }
tier: B
related: []
raw_ref: 
---

# Advisor-tool replaces ensemble-of-3 stability hacks at near-Sonnet rates

## Claim
Anthropic's advisor-tool collapses the ensemble-of-3 stability pattern into a single executor run that consults Opus mid-stream for a 400-700 token plan, then continues at Sonnet rates. Valid pairs: Haiku/Sonnet/Opus 4.6 → Opus 4.7 advisor. For long-horizon, mostly-mechanical workloads with occasional planning bottlenecks, this is the cleaner replacement for ensemble voting.

## Mechanism
Ensembles deliver stability by running multiple full inferences; the advisor pattern delivers it by inserting a small Opus-grade plan at the moment of decision, paid for once instead of N times. Cost-per-stable-decision improves because the executor stays on a cheap tier for the bulk of the work.

## Conditions
Holds when: the workload has clear planning bottlenecks (consolidation, multi-step decisions) that benefit from a higher-capability mid-stream consult.
Fails when: every step needs high-capability reasoning — there, ensemble or pure Opus still wins.

## Evidence
Anthropic advisor-tool public beta with header `advisor-tool-2026-03-01`. Sonnet executor calls Opus mid-generation for a 400-700 token plan. Verified via Anthropic Python SDK 0.97.0.
— Anthropic platform docs, 2026-04-26

## Signals
- Long-running scheduler tasks adopt advisor-tool for the planning step.
- Cost-per-stable-decision drops vs. ensemble baseline in head-to-head bake-offs.
- Ensemble code paths retired once advisor-tool reaches GA pricing.

## Counter-evidence
For workloads requiring diversity-of-output (where ensembles vote across genuinely independent reasoning paths), advisor cannot substitute — it is one path with a smarter midpoint.

## Cross-references
- (none in current corpus)
