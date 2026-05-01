---
id: ins_ghost-citation-gap
operator: Kevin Indig
operator_role: Growth advisor; author of Growth Memo
source_url: https://www.growth-memo.com/p/the-ghost-citation-problem
source_type: essay
source_title: The Ghost Citation Problem
source_date: 2026-04-26
captured_date: 2026-05-01
domain: [growth, pmm, ai-native]
lifecycle: [measurement-experimentation, positioning]
maturity: frontier
artifact_class: research
score: { originality: 5, specificity: 4, evidence: 5, transferability: 5, source: 5 }
tier: A
related: [ins_aeo-three-layer-presence-readiness-impact, ins_relevance-engineering-passage-level, ins_death-of-the-ultimate-guide]
raw_ref: raw/essays/kevin-indig--ghost-citation-problem--2026-04-26.md
---

# Citation rate and mention rate are different metrics; comparative content closes the gap

## Claim
Across 454 prompt-domain pairs and four AI engines, 62% of citations never name the brand — measuring citation rate alone hides whether the brand is actually getting recall, while comparative content produces ~30x more brand mentions than informational content.

## Mechanism
LLMs synthesize answers from many sources. A citation means the model drew on the page; a mention means the model named the brand inside its answer. Recall and trust come from mentions, not silent ingestion. Comparative content (X vs Y, alternatives-to teardowns, ranked listings) forces the model to keep brand tokens together with claims, so the brand survives summarization. Informational content can be summarized brand-free without losing the answer's substance, so the brand is dropped.

## Conditions
Holds when:
- The buyer journey includes a discovery surface that AI mediates (ChatGPT, Perplexity, Google AI Mode, Claude).
- Brand recall is part of the conversion mechanism (memory, branded search, direct visits).
- The team can produce comparative content at quality.

Fails when:
- The product wins on pure top-of-funnel SEO with click-through to a known landing page (and the AI surface is not yet a real channel).
- Comparative content is thin or biased — gets cited but won't survive editorial scrutiny when the user clicks through.
- The brand is so dominant in a category that even informational content carries the name (rare).

## Evidence
> "Being cited means an AI is drawing on your content. Being mentioned means it is naming you."

Sample: 3,981 domains, four AI engines, 454 prompt-domain pairs. 62% of citations across the sample do not name the brand. Certain query formats and content types produced ~30x more brand mentions than the baseline.

— Kevin Indig, *The Ghost Citation Problem*, https://www.growth-memo.com/p/the-ghost-citation-problem, 2026-04-26

## Signals
- AEO dashboards track citation rate and mention rate as separate series, with the gap between them as an explicit operator KPI.
- Comparison-page library expands ahead of how-to content in the AEO content roadmap.
- Branded search and direct-visit lift correlate with mention rate, not citation rate.

## Counter-evidence
The 30x mention multiplier is from a single research sample with a specific prompt set; mention-rate uplift will vary by category and query type. Other operators may find informational content carries brand mentions in domains where the brand is the entity (e.g., open-source projects, named methodologies).

## Cross-references
- `ins_aeo-three-layer-presence-readiness-impact` — Aleyda's framework treats Presence as multi-metric; Indig's data tells you which sub-metrics to split.
- `ins_relevance-engineering-passage-level` — Mike King's chunking model explains why comparative passages survive.
- `ins_death-of-the-ultimate-guide` — Amanda Natividad's "POV beats exhaustive" reaches the same conclusion from the content side.
