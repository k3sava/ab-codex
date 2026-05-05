---
id: ins_ariely-relativity-principle
operator: Dan Ariely
operator_role: Behavioral economist; James B. Duke Professor at Duke University; author Predictably Irrational
source_url: https://danariely.com/
source_type: book
source_title: "Predictably Irrational — The Relativity Principle"
source_date: 2008-02-19
captured_date: 2026-05-05
domain: [pmm, design, growth-demand]
lifecycle: [pricing-packaging, conversion-design]
maturity: foundational
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 5, transferability: 5, source: 5 }
tier: A
related: [ins_decoy-effect-pricing, ins_anchoring-pricing-negotiation, ins_simon-single-price-always-suboptimal]
raw_ref: raw/expert-content/experts/dan-ariely.md
---

# The Relativity Principle — humans cannot evaluate prices in isolation, only by comparison

## Claim
Humans lack an internal absolute-value meter for prices. They can only evaluate prices by comparing them to other prices. Any pricing page that presents a single option forces the buyer to guess at value with no reference; multiple options let the buyer compute value relationally. This is why three-tier pricing converts better than single-price offers even when the buyer ends up choosing the original tier.

## Mechanism
The brain has no direct perception of "value" — value is computed by comparison. When a buyer encounters a single price, they have no basis to judge it as fair; the conversation in their head becomes "is this worth it?" with no answer-generating mechanism. Introduce a second price (a clearly more expensive tier, or a clearly more limited tier) and the brain shifts mode: now value is computed as "this option vs. that option," which the brain *can* do. The relativity decision is fast, confident, and feels rational even though the absolute prices were set by the seller. Decoy-effect pricing (`ins_decoy-effect-pricing`) is one application; the broader principle says any pricing surface should provide reference points for the buyer to compare against.

## Conditions
Holds when:
- The buyer has no strong external reference price (new category, custom quote, novel product).
- The reference points the seller introduces are credible and distinguishable.
- The decision is made in a single session — relativity computation needs both options visible at once.

Fails when:
- The buyer has strong internal anchors from prior purchases or deep category knowledge.
- The reference points the seller introduces are too similar — the comparison degenerates into noise.
- The buyer treats the additional options as suspicious price-engineering and discounts the value computation.

## Evidence
> "humans cannot evaluate prices in isolation; they can only compare them"

— see `raw/expert-content/experts/dan-ariely.md` line 15.

## Signals
- Pricing pages have 3+ tiers with clear value differences, not a single price or feature-count tiers.
- A/B tests show tier-based pricing converting higher than single-price equivalents at the same target tier price.
- Sales conversations include explicit price-comparison context ("our enterprise tier is $X, this is $Y") rather than naked price quotes.

## Counter-evidence
For commodity categories with transparent market prices (consumer subscriptions, public PaaS), buyers have strong external anchors and the relativity-engineering benefit is muted. The Ariely claim is sharpest for considered-purchase B2B and novel-category B2C where buyers genuinely lack reference points.

## Cross-references
- `ins_decoy-effect-pricing` — Ariely's foundational application of the principle.
- `ins_anchoring-pricing-negotiation` — Kahneman's adjacent claim on anchoring; relativity is the why behind anchoring's power.
- `ins_simon-single-price-always-suboptimal` — Simon's WTP-heterogeneity claim; relativity is one mechanism for why tier-based pricing captures more WTP than single price.
