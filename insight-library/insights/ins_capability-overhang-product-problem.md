---
id: ins_capability-overhang-product-problem
operator: Amole Naik
operator_role: Head of Growth, Anthropic
source_url: https://www.youtube.com/watch?v=k-H4nsOTuxU
source_type: podcast
source_title: Anthropic is automating its own growth — Lenny's Podcast
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [ai-native, product, growth-demand]
lifecycle: [strategy-bets]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 4, transferability: 4, source: 5 }
tier: B
related: [ins_remove-features-as-models-improve, ins_seasons-not-roadmaps]
raw_ref: raw/podcasts/amole-naik--anthropic-automating-growth--2026-04-27.md
---

# In AI products, capability overhang is the central growth problem

## Claim
Models improve faster than products can diffuse the new capabilities. You ship onboarding for Opus 4, run tests, get learnings, ship a new flow — and Opus 4.5 is out. Your learnings are stale. The structural challenge for AI growth is not "use more AI"; it is "build artifacts that auto-update when the model changes."

## Mechanism
Traditional growth experiments assume the underlying product is stable across the test window. AI products break that assumption every few months when a new capability wave lands. Hard-coded copy, scripted onboarding, and feature scaffolds built around current-model limits become net-negative the moment the limit lifts. The compounding asset is anything that adapts: configurable prompts, capability-detection branches, copy generated at runtime against the current model.

## Conditions
Holds when:
- The product depends on a frontier model whose capability is improving on a known cadence.
- The team can build adaptive scaffolding without over-investing in plumbing that will itself be obsoleted.

Fails when:
- The product depends on a stable model (open-source, on-prem). Capability overhang is not your problem.
- The team uses "models will improve" as an excuse to defer real product work today.

## Evidence
> "Models are getting better so fast that the real challenge is on the product side — diffusing those benefits to people. You ship onboarding for Opus 4. By the time you've learned, Opus 4.5 is out and your learnings are obsolete."

— Amole Naik on Lenny's Podcast, 2026-04-27

## Signals
- Onboarding copy is generated, not hand-crafted, against the current model's behavior.
- Feature flags include "capability detection" so the product unlocks affordances when the model gets better.
- Test windows are kept short (weeks, not quarters) so learnings still apply when shipped.

## Counter-evidence
Sherwin Wu's "the models will eat your scaffolding" cuts the same way. Both are warnings against over-investment. The opposite failure mode is also common: teams use capability overhang as an excuse to defer hard product work indefinitely. Calibration matters; the rule is "build adaptive, not no scaffolding."

## Cross-references
- `ins_remove-features-as-models-improve` — Cat Wu's cleanup half of this same pattern
- `ins_seasons-not-roadmaps` — the planning cadence implication
