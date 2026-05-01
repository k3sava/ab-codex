---
id: ins_manual-action-propagates-to-ai-surfaces
operator: Glenn Gabe
operator_role: SEO consultant; G-Squared Interactive
source_url: https://www.gsqi.com/marketing-blog/when-mt-ai-crumbles-chatgpt-follows/
source_type: essay
source_title: When Mt. AI Crumbles, ChatGPT Follows
source_date: 2026-04-22
captured_date: 2026-05-01
domain: [growth, ai-native]
lifecycle: [risk-quality, content]
maturity: applied
artifact_class: case-study
score: { originality: 4, specificity: 4, evidence: 4, transferability: 4, source: 4 }
tier: B
related: [ins_relevance-engineering-passage-level, ins_ai-slop-loop, ins_aeo-three-layer-presence-readiness-impact]
raw_ref: raw/essays/glenn-gabe--mt-ai-crumbles--2026-04-22.md
---

# Google manual actions propagate downstream to AI Overviews and ChatGPT citations

## Claim
A site that suffers a Google manual action (or quality-driven demotion) drops not only in classic SERP but also in AI Overviews, AI Mode, and ChatGPT/Perplexity citations — quality penalties on Google now have downstream blast radius across most AI surfaces.

## Mechanism
AI surfaces use Google (and adjacent crawl indexes) as one of their retrieval and trust layers. When a domain is demoted in Google's index for quality reasons, the same trust signals that drop its rank also reduce its inclusion likelihood in synthesis pipelines that consume Google-index data. Some AI surfaces also separately apply quality filters that downrank known-spam patterns. The effect is a cascade: surge-then-decay in GSC is the early signal, then citation logs across AI surfaces show the same pattern within days to weeks.

## Conditions
Holds when:
- The site is recoverable through normal SEO quality fixes (the penalty is reversible).
- Citation logs across at least two AI surfaces are tracked separately.
- The team has visibility into Google Search Console anomalies.

Fails when:
- The penalty is so severe that recovery is structural, not tactical.
- The AI surface has its own retrieval index decoupled from Google (some Perplexity/Claude paths).
- The site already had thin AI-citation presence; the fall is invisible because the floor was zero.

## Evidence
> "If you receive a manual action from Google, you will drop in AIOs, AI Mode, and then downstream in AI search."

Case study: a site that scaled AI-generated content to climb Google rankings, then collapsed across organic, AI Overviews, AI Mode, and ChatGPT citations once Google issued a manual action.

— Glenn Gabe, https://www.gsqi.com/marketing-blog/when-mt-ai-crumbles-chatgpt-follows/, 2026-04-22

## Signals
- AEO/SEO workflows include a risk-pass step that watches for Google manual-action patterns before AI-citation collapse.
- Surge-then-decay shapes in GSC trigger an automatic AI-citation audit.
- Quality-fix sprints prioritize the pages most cited by AI surfaces, not just the highest-rank Google pages.

## Counter-evidence
Some AI surfaces (notably some Perplexity sources, Anthropic web fetch with custom retrieval) are partially decoupled from Google's index. A site demoted in Google may still appear in those surfaces. The propagation is strong but not universal.

## Cross-references
- `ins_relevance-engineering-passage-level` — Mike King's passage engineering still helps, but only above a quality floor.
- `ins_ai-slop-loop` — Lily Ray's parallel finding on how AI surfaces can amplify quality problems in the other direction.
- `ins_aeo-three-layer-presence-readiness-impact` — the measurement framework needs a quality-risk component.
