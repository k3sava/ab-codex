---
id: ins_kevin-indig-verification-cost-rising
operator: Kevin Indig
operator_role: Growth advisor and creator of Growth Memo
co_operators: []
source_url: "https://www.growth-memo.com/p/ai-changed-my-work-and-yours-too"
source_type: essay
source_title: AI changed my work and yours too
source_date: 2026-05-04
captured_date: 2026-05-13
domain: [pmm, ai-native]
lifecycle: [awareness]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 4, transferability: 4, source: 3 }
tier: A
related: [ins_chatgpt-prompts-invisible-to-keyword-tools, ins_judgment-doesnt-compress]
raw_ref: 
---

# The cost to produce AI output is falling. The cost to verify it is rising. Judgment is the binding constraint.

## Claim
Agentic AI is compressing production cost at the same time verification cost is rising. METR measured 1.5-13x time savings for technical staff using agentic AI. But output volume growing faster than verification capacity means judgment, not production, is the new bottleneck.

## Mechanism
Production cost falls because AI handles generation. Verification cost rises because AI output volume grows while human evaluation time stays fixed. The ratio flips: you produce more than you can reliably assess. Judgment is the only thing that does not compress.

## Conditions
Holds when: AI generates enough volume that human reviewers are the constraint. True for most knowledge work at current model capability levels.
Fails when: Automated evals can substitute for human judgment on the specific output type. Where verification can be mechanized, the constraint shifts back to production.

## Evidence
Indig references METR research: 1.5-13x time savings, 40% cost reduction, 60% time reduction as realistic benchmarks for technical staff with agentic AI. His synthesis:

> "Judgment is the only thing that doesn't compress."

## Signals
- Output queues are longer than review queues can clear
- You have more drafts, more code, more research than you can act on
- The bottleneck in any AI-native workflow is approval, not generation

## Counter-evidence
For tasks with objective correctness (unit tests, factual lookups with external verification), automated evals can substitute for human judgment. The judgment-scarcity claim is strongest for tasks where quality is subjective or contextual. The METR research covers technical staff; transferability to other domains is unverified.
