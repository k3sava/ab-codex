---
id: ins_outcomes-grader-agent-evaluation
operator: Anthropic
operator_role: AI safety research company and Claude developer
co_operators: []
source_url: unknown
source_type: talk
source_title: Code with Claude
source_date: 2026-05-06
captured_date: 2026-05-07
domain: [ai-product, evals]
lifecycle: [growth-loops, retention]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 4, transferability: 4, source: 3 }
tier: A
related: [ins_traces-need-feedback-to-learn, ins_error-analysis-highest-leverage-eval-step, ins_evals-are-data-analysis-on-llm-apps, ins_benevolent-dictator-not-committee, ins_dreaming-cross-session-memory-curation]
raw_ref: 
---

# A separate grader agent in its own context window closes the output verification loop at production scale

## Claim
Deploy a separate grader agent in its own context window to evaluate whether output meets a defined success rubric. The grader runs independently of the generator and has no access to the generator's reasoning chain, only the output.

## Mechanism
When a grader shares context with the generator, it inherits the generator's blind spots. A separate context window forces independent evaluation against the rubric. The rubric — not the generator — determines pass or fail. This creates a closed feedback loop: the generator produces, the grader measures, the delta drives improvement without scaling manual review linearly with volume.

## Conditions
Holds when: the task has a defined, measurable success rubric. Output format is consistent enough for the grader to evaluate. The grader can access necessary ground truth or reference material.
Fails when: success criteria are vague or subjective. The grader and generator share overlapping context that smuggles in confirmation bias. The rubric itself is wrong.

## Evidence
Announced at Code with Claude, May 6, 2026, as part of Claude Managed Agents public beta. Internal testing showed +8.4% improvement on docx file generation and +10.1% on pptx file generation after Outcomes was added.

> "Agents do their best work when they know what 'good' looks like."

## Signals
- Output quality scores improve week-over-week without manual review hours scaling proportionally
- The grader catches the same error class repeatedly, pointing to a generator training target
- Task success rate and human-rated quality converge over time (grader is calibrated)

## Counter-evidence
For tasks without a verifiable rubric, adding a grader adds latency and cost with no quality signal. The grader itself can be miscalibrated if the rubric is underspecified.

## Cross-references
- `ins_traces-need-feedback-to-learn` (Harrison Chase): traces without outcome feedback are incomplete raw material
- `ins_error-analysis-highest-leverage-eval-step` (Hamel Husain): error analysis is the highest-leverage eval step most teams skip
- `ins_dreaming-cross-session-memory-curation` (Anthropic): paired feature — Outcomes closes the output loop, Dreaming closes the memory loop
