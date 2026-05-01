---
id: ins_relevance-engineering-passage-level
operator: Mike King
operator_role: Founder & CEO, iPullRank; creator of Relevance Engineering
source_url: https://ipullrank.com/how-ai-mode-works
source_type: essay
source_title: How AI Mode Works (and How SEO Can Prepare)
source_date: 2026-04-22
captured_date: 2026-05-01
domain: [growth, pmm, ai-native]
lifecycle: [content, measurement-experimentation]
maturity: frontier
artifact_class: framework
score: { originality: 5, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_aeo-three-layer-presence-readiness-impact, ins_ghost-citation-gap, ins_death-of-the-ultimate-guide, ins_aeo-is-gtm-capability]
raw_ref: raw/essays/mike-king--how-ai-mode-works--2026-04-22.md
---

# The unit of optimization is the passage, not the page

## Claim
In AI-mediated search, optimization means engineering individual passages — H2-bounded blocks — to survive chunking and embed cleanly against likely query variants, not optimizing pages for keyword rank.

## Mechanism
AI search systems run a retrieval pipeline: chunk the doc into passages, embed each, score embeddings against query fan-out (the model expands one query into many sub-queries), then assemble passages that match into a synthesized answer. A page that ranks #1 for a head term can still be invisible in AI Mode if its passages don't survive the chunker (too short, too long, poor entity density) or don't embed against the right sub-queries. The work is moved from page-level signals (links, meta tags, headings) to passage-level signals (size, entity shape, citation hooks, query-fan-out coverage).

## Conditions
Holds when:
- AI Mode, AI Overviews, ChatGPT, Perplexity, or Claude is a meaningful share of the discovery surface.
- The page can be edited at the H2 level without breaking other constraints (legal, brand voice, taxonomy).
- The team has access to embedding tooling or a query-fan-out simulator.

Fails when:
- The product wins on direct/branded traffic and AI surfaces are <10% of acquisition.
- Editorial constraints prevent passage-level rewrites (heavily templated CMS, brand-locked structure).
- The passage scoring becomes goodharted — operators write passages for the chunker, not the reader, and lose user trust.

## Evidence
> "Answers are generated, not linked."

iPullRank reports from controlled studies: 34% higher citation retention versus baseline when pages were rewritten to the relevance-engineering spec. 67%+ of enterprise SEO budgets allocate to GEO in 2026. "Result-as-a-Service" contracts up 340% YoY.

— Mike King, *How AI Mode Works*, https://ipullrank.com/how-ai-mode-works, and *AI Search Manual*, 2026-04-22

## Signals
- Passage-level audits replace page-level audits in the SEO/AEO workflow.
- Mean retrievability scores per passage (size, entity start, citation hooks) are tracked alongside or instead of rank.
- Editorial tooling exposes chunk boundaries to writers in real time.
- Citation retention rises against a measured baseline.

## Counter-evidence
Some operators argue the chunker behavior changes faster than content can be rewritten — every model generation alters embedding spaces and chunk sizes, so passage-level investments depreciate quickly. Engineering for one chunker can underperform when the model shifts. The right hedge is to optimize for human readability AND chunker survival; sole optimization for chunkers is fragile.

## Cross-references
- `ins_aeo-three-layer-presence-readiness-impact` — Mike King's framework slots into Aleyda's Readiness layer.
- `ins_ghost-citation-gap` — Indig's mention-vs-citation split explains why some surviving passages still don't earn brand recall.
- `ins_death-of-the-ultimate-guide` — Amanda Natividad's content-side conclusion: POV passages beat exhaustive ones.
- `ins_aeo-is-gtm-capability` — Maja Voje on who should own this work in the org.
