---
id: ins_mine-transcripts-to-promote-config
operator: Eugene Yan
operator_role: Senior Applied Scientist; writes at eugeneyan.com on AI/ML systems
source_url: https://eugeneyan.com/writing/
source_type: essay
source_title: "Closing the feedback loop — mining session transcripts for promotable patterns"
source_date: 2026-05-03
captured_date: 2026-05-06
domain: [ai-native, engineering, research]
lifecycle: [ai-workflow, measurement-experimentation, llm-evals]
maturity: applied
artifact_class: workflow
score: { originality: 4, specificity: 4, evidence: 3, transferability: 5, source: 4 }
tier: A
related: [ins_traces-need-feedback-to-learn, ins_llm-wiki-pattern]
raw_ref: 
---

# Close the feedback loop by mining session transcripts for patterns to promote into config

## Claim
The fastest practical route from "we ship LLM features" to "the system gets better on its own cadence" is to treat session transcripts as the corpus from which improvements get harvested. Each session is a recorded interaction; each correction, retry, or visibly better path is a candidate pattern. The closing move is to harvest those patterns into config — prompts, tool definitions, retrieval rules, evaluator rubrics — so the next session inherits what the last session figured out. The corpus is the gym; the transcripts are the reps; the config promotions are the strength gain that compounds.

## Mechanism
The cost of running an LLM call is now low. The cost of human attention reviewing a transcript is the binding constraint. Two design moves break the constraint: (a) transcripts are stored in a queryable shape (not free-text logs), so an evaluator agent can pre-filter the most-promising candidates; (b) "promote into config" is a real, tracked PR-shaped operation — not a one-off prompt edit — so promotions are reviewable, attributable, reversible. Once both are in place, the feedback loop runs continuously: agent runs → transcript stored → evaluator surfaces candidates → human or higher-tier agent reviews → config diff merges → next run inherits. Without the queryable shape, candidates drown in noise. Without promotion-as-PR, every improvement is local and forgotten on the next prompt edit.

## Conditions
Holds when:
- The product runs enough sessions that transcripts accrue at a useful rate.
- Transcripts are captured with enough metadata (model, prompt version, tools, outcome) to be promotable.
- The team has authority to change config based on transcript review.

Fails when:
- Sessions are too sparse for pattern emergence (long-tail enterprise use cases).
- Transcripts are PII-bound and reviewable only under heavy gating (clinical, legal contexts).
- Config changes are gated by a release process slower than the feedback cadence.

## Evidence
> "Close the feedback loop — mine session transcripts for patterns to promote into config."
— Eugene Yan, eugeneyan.com, 2026-05-03 (synthesised from his publication that week; see `ins_traces-need-feedback-to-learn` for the parallel framing from Harrison Chase the same week).

The same idea appeared in Karpathy's Sequoia Ascent talk a few days earlier — the bottleneck is verification, not intelligence. Yan operationalises it: verification produces the labels; promotion turns labels into compounding system improvement.

## Signals
- "Transcript review" is a regular calendar item, not an ad-hoc activity.
- Config diffs cite the transcript IDs they were derived from.
- New evaluator rubrics begin life as patterns observed in transcripts, not as theoretical correctness checks.

## Counter-evidence
- For agents with low repetition, the transcript corpus never reaches density where pattern-mining beats hand-tuned config.
- Promotion can drift toward local optima — what worked on the last hundred transcripts isn't necessarily what generalises. Some teams over-promote and lock the agent into outdated patterns; the discipline is to review promotions on a longer window than promote them on.

## Cross-references
- `ins_traces-need-feedback-to-learn` — Harrison Chase's same-week framing from the frameworks side; the pair represents independent convergence on the trace-plus-feedback minimum.
- `ins_llm-wiki-pattern` — Karpathy's persistent wiki is one natural destination for promoted patterns.
