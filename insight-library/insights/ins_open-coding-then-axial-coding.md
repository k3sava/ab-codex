---
id: ins_open-coding-then-axial-coding
operator: Hamel Husain & Shreya Shankar
operator_role: Independent ML consultant and Berkeley PhD researcher
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Evals as error analysis, the benevolent dictator, LLM judges
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [ai-native, research-discovery, engineering]
lifecycle: [ai-workflow]
maturity: applied
artifact_class: playbook
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_evals-are-data-analysis-on-llm-apps, ins_benevolent-dictator-not-committee]
raw_ref: raw/podcasts/hamel-husain-shreya-shankar--evals-error-analysis--2026-04-28.md
---

# Sample 100+ traces, write one free-form note per trace, let an LLM cluster the notes — humans first, machines second

## Claim
Run trace review as a two-stage pipeline: a human samples 100+ traces and writes a free-form note on the first thing wrong with each (open coding); then an LLM groups those notes into failure-mode buckets (axial coding). An LLM cannot do the open-coding pass for you because it lacks product context; humans cannot scale the categorisation pass.

## Mechanism
Open coding captures domain-specific failure that an LLM judge would miss because the LLM has no privileged access to product reality (e.g., "we don't actually offer virtual tours" — hallucination invisible without context). Axial coding is pure clustering, which LLMs do reliably. The split assigns each task to the actor that can do it, and the resulting pivot table converts qualitative review into quantitative priority.

## Conditions
Holds when:
- A domain expert can read traces and recognise wrong outputs.
- The traces are recent enough that current product context applies.
- The team can tolerate the upfront human time for the first pass.

Fails when:
- Reviewers are not domain experts and their notes mislead the categorisation.
- The traces span product changes such that "wrong" varies by date.
- The team cuts the human step to save time and the LLM hallucinates the categories.

## Evidence
> "When you're doing this open coding... appoint one person whose taste that you trust."

> "I would bet money... if I put that into ChatGPT and asked, 'Is there an error?' it would say, 'No, did a great job.'"

Stopping rule: theoretical saturation, not a fixed count. Once 15–60 traces stop yielding new categories, you stop.

— Hamel Husain & Shreya Shankar on Lenny's Podcast, 2026-04-28

## Signals
- Failure-mode pivot table covers >80% of observed problems with a small set of clusters.
- Engineering work is prioritised by category counts, not by squeaky-wheel reports.
- The same pipeline runs weekly without each cycle starting from scratch.

## Counter-evidence
Coding-agent teams (Claude Code, Codex) operate with much lighter eval discipline because the developer is also the user; the dogfood loop closes inside one head. That pattern does not generalise to products where the buyer is not the builder.

## Cross-references
- `ins_evals-are-data-analysis-on-llm-apps` — why this pipeline matters
- `ins_benevolent-dictator-not-committee` — who runs the human step
- `ins_llm-as-judge-binary-not-likert` — what the categories become
