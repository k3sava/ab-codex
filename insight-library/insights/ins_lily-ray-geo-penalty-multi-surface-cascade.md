---
id: ins_lily-ray-geo-penalty-multi-surface-cascade
operator: Lily Ray
operator_role: SEO strategist and AI search researcher
co_operators: []
source_url: "https://ppc.land/lily-ray-what-the-seo-industry-is-getting-dangerously-wrong-about-ai-search/"
source_type: podcast
source_title: What the SEO Industry Is Getting Dangerously Wrong About AI Search
source_date: 2026-05-13
captured_date: 2026-05-15
domain: [aeo, seo]
lifecycle: [content-strategy, risk-management]
maturity: applied
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 4, transferability: 4, source: 4 }
tier: A
related: [ins_aleyda-solis-aeo-offsite-corroboration-floor, ins_lily-ray-aeo-seo-continuity, ins_manual-action-propagates-to-ai-surfaces]
raw_ref: 
---

# A Google penalty removes a page from every AI surface at once, not just Google search

## Claim
AI systems retrieve content via RAG from Google's index. A Google enforcement action does not stop at Google. It removes the page from the source pool that ChatGPT, Perplexity, and Copilot all draw from, making one enforcement decision a multi-surface traffic loss.

## Mechanism
Search AI systems pull from Google's indexed content via retrieval-augmented generation. Google's index functions as the shared source pool. When Google deprioritizes or removes a page, that page is absent from the pool those other systems draw from at retrieval time. The enforcement action is upstream of all the surfaces, not parallel to them. Self-promotional or manipulative tactics flagged by Google's algorithms are therefore flagged implicitly for every AI surface that draws from the same pool.

## Conditions
Holds when: AI surfaces draw primarily from Google's index via RAG, which is the current architecture for ChatGPT Browse, Perplexity, and Copilot.
Fails when: an AI surface maintains its own fully independent crawl and index rather than drawing from Google. The degree of coupling varies and may shift as labs invest in independent infrastructure.

## Evidence
Ray documented specific patterns already being enforced in 2026: self-promotional listicles with a 49% visibility loss after January 2026 enforcement; comparison page farms (one site built 51 of them); artificial timestamp refreshes. Microsoft's February 2026 marketer guide formally named the category "AI Recommendation Poisoning."

> That's getting recommended by everybody else without recommending yourself. And to me, that's where you want to go.

## Signals
- Traffic from ChatGPT, Perplexity, or Copilot drops in the same reporting period as a Google manual action or core update
- Pages built around self-referential tactics lose citation share across multiple AI surfaces simultaneously
- Third-party mention growth correlates with citation-share growth while self-referential page performance declines

## Counter-evidence
AI surfaces investing in independent indexing would reduce this cascade over time. The degree of coupling is not publicly confirmed by any lab and may vary by surface and query type.

## Cross-references
- [[ins_aleyda-solis-aeo-offsite-corroboration-floor]], Solis's complementary frame: the real optimization surface is off-site, not on-site
- [[ins_manual-action-propagates-to-ai-surfaces]], earlier card on the same mechanical claim
- [[ins_lily-ray-aeo-seo-continuity]], Ray's prior card on SEO and AEO as a continuous surface
