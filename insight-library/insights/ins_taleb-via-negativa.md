---
id: ins_taleb-via-negativa
operator: Nassim Nicholas Taleb
operator_role: Risk theorist; former options trader; author Fooled by Randomness, Black Swan, Antifragile, Skin in the Game
source_url: https://www.fooledbyrandomness.com/
source_type: book
source_title: "Antifragile — Via Negativa"
source_date: 2012-11-27
captured_date: 2026-05-05
domain: [strategy, product, leadership]
lifecycle: [risk-quality, strategy-bets, productisation]
maturity: foundational
artifact_class: framework
score: { originality: 5, specificity: 4, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_antifragile-barbell, ins_taleb-iatrogenics, ins_taleb-skin-in-the-game]
raw_ref: raw/expert-content/experts/nassim-taleb.md
---

# Improvement comes from removing harm, not adding good — addition introduces unknown failure modes; subtraction does not

## Claim
The most reliable path to improvement in a complex system is *via negativa* — removing harmful elements rather than adding beneficial ones. Bad habits, unnecessary complexity, toxic clients, fragile dependencies. Subtraction is more reliable because the harms are usually identifiable and removal does not introduce new failure modes; addition, by contrast, introduces unknown interactions that often produce harms larger than the intended benefit.

## Mechanism
In any non-trivial system, every addition has known intended effects and unknown interaction effects. The unknown interactions produce hidden failure modes that compound over time — the more components added, the more potential interactions, the more fragility. Removal has the opposite property: removing a known-harmful component eliminates its direct harm and any interactions it was driving, without creating new ones. The reliability asymmetry favours subtraction. The product / strategy / lifestyle implication is to default to "what should we cut?" before "what should we add?" — a heuristic that compounds in stable directions.

## Conditions
Holds when:
- The system is complex enough that interaction effects are non-trivial (most software, most organisations, most processes).
- The harmful elements are identifiable — the team can name what is dragging the system down.
- There is room to subtract without losing critical capability.

Fails when:
- The system is missing a critical capability that only addition can provide (early-stage products needing core features).
- The harms are non-obvious or contested — subtracting the wrong thing is worse than tolerating it.
- Cultural resistance to "doing less" is so strong that the via-negativa stance is overridden ("growth-at-all-costs" environments).

## Evidence
> "Via negativa is the principle that improvement comes more reliably from removing harmful things (bad habits, unnecessary complexity, toxic clients, fragile dependencies) than from adding good things."

— see `raw/expert-content/experts/nassim-taleb.md` line 18.

## Signals
- Quarterly reviews include a "what to stop doing" exercise alongside the "what to start" exercise — and the stop list is at least as long.
- Product roadmaps include explicit deprecations alongside additions; net feature count is bounded.
- Org-design reviews include team / process / report removals as first-class outputs.

## Counter-evidence
For products in growth-stage with clear feature gaps vs. competitors, via negativa's "subtract first" instinct can starve the product of needed capability. Pure subtraction-focused operators sometimes fail to ship the additions that genuinely move the metric. The discipline is balance: default to subtraction, but recognise when the correct move is to add a missing primitive.

## Cross-references
- `ins_antifragile-barbell` — barbell strategy is via-negativa applied to allocation: subtract everything in the middle.
- `ins_taleb-iatrogenics` — the failure mode that via-negativa defends against (harm caused by intervention).
- `ins_invert-always-invert` — Munger's inversion is via-negativa at the cognitive level (avoid failure rather than seek success).
