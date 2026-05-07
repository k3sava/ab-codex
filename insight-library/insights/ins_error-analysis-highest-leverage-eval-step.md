---
id: ins_error-analysis-highest-leverage-eval-step
operator: Hamel Husain
operator_role: ML engineer and evaluation methodology advisor
co_operators: ["Shreya Shankar"]
source_url: unknown
source_type: essay
source_title: Evals Masterclass (Aakash Gupta's newsletter, May 2026)
source_date: 2026-05-05
captured_date: 2026-05-07
domain: [ai-engineering]
lifecycle: [evaluation]
maturity: applied
artifact_class: playbook
score: { originality: 3, specificity: 4, evidence: 3, transferability: 4, source: 4 }
tier: B
related: [ins_open-coding-then-axial-coding, ins_llm-as-judge-binary-not-likert, ins_evals-are-data-analysis-on-llm-apps, ins_benevolent-dictator-not-committee]
raw_ref: 
---

# Error analysis is the most-skipped step in AI evals and gives the most leverage per hour invested

## Claim
Most teams instrument traces, build LLM judges, and ship dashboards while skipping the step that makes those investments pay off: sitting with a sample of real failures and manually coding what went wrong.

## Mechanism
Without error analysis, LLM judges measure the wrong things. They categorize errors that don't exist at scale and miss the ones that do. The six-step methodology: instrument traces, open-code a sample manually, axial-code the patterns into categories, count via pivot table, build a binary LLM judge on those categories, validate against human labels with true-positive and true-negative rates. The open-coding step is the one almost every team skips. It is also the step that tells you what to measure and how to weight it. Everything downstream of skipping it is optimization against the wrong rubric.

## Conditions
Holds when: the system generates at sufficient volume to sample failure modes but has not yet established a validated eval rubric.
Fails when: a validated rubric already exists and the team is past the open-coding phase; at that point, error analysis is maintenance, not the leverage point.

## Evidence
Husain, from the Evals Masterclass:

> Error analysis is the step that most people skip in evals...the thing that's going to give you extreme leverage as a PM.

The six-step methodology treats open-coding and axial-coding as prior steps that make LLM judge construction valid, not as optional enrichment.

## Signals
- The team can name the top 3 failure modes by frequency from a real sample
- LLM judge categories map to those named failure modes, not to generic quality axes
- Judge TPR and TNR are both above 80% on a holdout set

## Counter-evidence
For teams with very high output volume, manual open-coding a representative sample is feasible but requires a deliberate sampling strategy. The skip often happens not because teams don't know about it but because there is no clear owner for the manual work. Husain's benevolent-dictator principle (one named eval owner) is the organizational precondition for error analysis to actually happen.
