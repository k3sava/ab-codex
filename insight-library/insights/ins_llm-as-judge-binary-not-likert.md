---
id: ins_llm-as-judge-binary-not-likert
operator: Hamel Husain & Shreya Shankar
operator_role: Independent ML consultant and Berkeley PhD researcher
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Evals as error analysis, the benevolent dictator, LLM judges
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [ai-native, engineering]
lifecycle: [ai-workflow, attribution-measurement]
maturity: applied
artifact_class: playbook
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_open-coding-then-axial-coding, ins_evals-are-data-analysis-on-llm-apps]
raw_ref: raw/podcasts/hamel-husain-shreya-shankar--evals-error-analysis--2026-04-28.md
---

# Build LLM-as-judge as binary true/false, one judge per pesky failure mode — and validate against human labels

## Claim
LLM-as-judge evals should output a binary pass/fail per pesky failure mode, not a Likert scale. Build 4–7 narrow judges total, not dozens, because most failures are fixed by prompt edits and never need a permanent eval. Always validate the judge against human-labelled data using a confusion matrix, not a single agreement number.

## Mechanism
A 1-to-5 Likert is "a weasel way of not making a decision" — it produces averages that look reasonable while masking the cases where the judge is wrong. A binary judge forces a callable decision and a falsifiable accuracy number. A confusion matrix surfaces the off-diagonal cells where a judge that says "pass" 90% of the time can hide near-total failure on the long tail. Without the matrix, teams trust scaffolding that has no real signal.

## Conditions
Holds when:
- Each failure mode is genuinely binary (the output either has the kill-list word or it doesn't).
- A reviewer can produce labelled data for the same traces the judge sees.
- The team will retire judges as failure modes get fixed by prompts.

Fails when:
- The failure mode is genuinely graded (severity, urgency, fluency) and binary collapses real distinctions.
- Reviewers cannot produce ground-truth labels at sufficient volume.
- The team treats judges as permanent fixtures and never prunes.

## Evidence
> "1-2-3-4-5 is a weasel way of not making a decision."

> "When people lose trust in your evals, they lose trust in you."

Operating rule Hamel and Shreya teach: most products end with 4–7 LLM judges total. Always look at the off-diagonal cells in the confusion matrix; agreement % is misleading on long-tail errors.

— Hamel Husain & Shreya Shankar on Lenny's Podcast, 2026-04-28

## Signals
- Judge prompts are short and binary; their accuracy is reported with confusion-matrix detail, not single-number summaries.
- Number of permanent judges stays small even as the product grows.
- Trust in the eval dashboard rises because failures map to recognisable categories.

## Counter-evidence
For ranking problems (which of these outputs is best?), pairwise comparison or graded scoring may be needed. The binary rule is conditional on detection-style judges, not preference-style ones.

## Cross-references
- `ins_open-coding-then-axial-coding` — the categories that become judges
- `ins_evals-are-data-analysis-on-llm-apps` — the broader frame
