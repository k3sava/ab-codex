---
id: ins_evals-are-data-analysis-on-llm-apps
operator: Hamel Husain & Shreya Shankar
operator_role: Independent ML consultant (ex-GitHub, Airbnb) and Berkeley PhD researcher
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Evals as error analysis, the benevolent dictator, LLM judges
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [ai-native, engineering, product]
lifecycle: [ai-workflow, attribution-measurement]
maturity: applied
artifact_class: workflow
score: { originality: 5, specificity: 5, evidence: 5, transferability: 5, source: 5 }
tier: A
related: [ins_open-coding-then-axial-coding, ins_llm-as-judge-binary-not-likert]
raw_ref: raw/podcasts/hamel-husain-shreya-shankar--evals-error-analysis--2026-04-28.md
---

# Evals are systematic data analysis on your LLM application — start with error analysis, not tests

## Claim
LLM evals are not a new mystical discipline; they are systematic data analysis on stochastic application output. The trap is to jump straight to writing tests. Start with open-ended error analysis on real traces, identify the failure modes that survive prompt fixes, then build narrow binary judges only for those.

## Mechanism
Tests written before error analysis test the wrong hypotheses — the team's pre-existing model of what could go wrong, not what is actually going wrong. A trace-first approach surfaces the real failure distribution: most issues are fixed by prompt edits and never need a permanent eval. Writing evals before that triage means you spend engineering time hardening against problems that no longer exist while the live failures go uncaught.

## Conditions
Holds when:
- You have access to real production traces or representative test data.
- A domain expert can read traces and recognise failure that an LLM cannot self-detect.
- The team accepts a sequenced workflow rather than a "comprehensive" eval suite up front.

Fails when:
- The product has no production volume yet (cold-start; evals have to be designed against synthetic data).
- The team's culture rewards visible eval scaffolding over actual error reduction.
- The domain expert is missing and traces look fine to non-experts.

## Evidence
> "It really doesn't have to be scary or unapproachable. It really is, at its core, data analytics on your LLM application."

> "There's a common trap that a lot of people fall into because they jump straight to the test like, 'Let me write some tests,' and usually that's not what you want to do. You should start with some kind of data analysis to ground what you should even test."

Hamel and Shreya teach the highest-grossing course on Maven (~2,000 PMs/eng across 500 companies, including OpenAI and Anthropic).

— Hamel Husain & Shreya Shankar on Lenny's Podcast, 2026-04-28

## Signals
- Most "failures" found in trace review are fixed by prompt edits within a sprint and never make it to permanent evals.
- The eval suite for a mature product is small (4–7 narrow judges), not large.
- Engineers stop building eval infrastructure speculatively and start with weekly trace reviews.

## Counter-evidence
For safety-critical or regulated domains, certain checks (PII, toxicity, jailbreaks) must be in place before any production traffic — there is no "wait and see." That is a separate class of evals, not the failure-mode evals this insight addresses.

## Cross-references
- `ins_open-coding-then-axial-coding` — the specific pipeline this insight points to
- `ins_llm-as-judge-binary-not-likert` — the judge construction rule
