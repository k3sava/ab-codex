---
id: ins_willison-reliability-erodes-review-discipline
operator: Simon Willison
operator_role: Independent developer and creator of Datasette
co_operators: []
source_url: "https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/"
source_type: essay
source_title: Vibe coding and agentic engineering
source_date: 2026-05-06
captured_date: 2026-05-13
domain: [ai-native, product]
lifecycle: [build]
maturity: frontier
artifact_class: excerpt
score: { originality: 4, specificity: 4, evidence: 3, transferability: 5, source: 4 }
tier: A
related: [ins_dark-factory-pattern, ins_breunig-harness-lock-in-model-layer]
raw_ref: 
---

# As coding agents become more reliable, review discipline erodes and the failure mode becomes invisible

## Claim
As coding agents become more reliable, review sessions naturally shorten. Each skipped review feels harmless because the agent is usually right. The aggregate effect: you have degraded the oversight mechanism at the exact point it still matters.

## Mechanism
Reliability removes the friction that made oversight automatic. When failure is rare, skipping review carries negligible apparent cost per instance. Over time, the discipline disappears. When failure does occur, there is no review habit left to catch it.

## Conditions
Holds when: Agent reliability is high enough that review feels like overhead rather than necessity. Most acute in production-grade agentic workflows where the agent is correct often enough to make vigilance feel wasteful.
Fails when: The agent fails frequently enough to keep review discipline alive. Low reliability is its own safeguard.

## Evidence
Willison, writing candidly about his own practice as an experienced daily user of agentic coding:

> "Those things have started to blur for me already, which is quite upsetting."

This is a first-person report from a practitioner who is honest about what happens to oversight when reliability climbs.

## Signals
- You can no longer recall the last time you rejected an agent output
- Code review sessions feel like rubber-stamping rather than evaluation
- You notice the agent made a decision you would not have made, after the fact

## Counter-evidence
High-stakes domains maintain review discipline through external compliance requirements, not practitioner choice. The erosion pattern may not apply where oversight is mandated and audited. Teams with formal code review processes independent of AI may preserve the habit through structure rather than vigilance.
