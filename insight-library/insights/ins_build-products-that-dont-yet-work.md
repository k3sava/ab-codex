---
id: ins_build-products-that-dont-yet-work
operator: Cat Wu
operator_role: Head of Product, Claude Code + Co-work, Anthropic
source_url: https://www.youtube.com/watch?v=PplmzlgE0kg
source_type: podcast
source_title: How Anthropic's product team moves faster than anyone else — Lenny's Podcast
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [product, ai-native]
lifecycle: [strategy-bets, ai-workflow]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 3, evidence: 4, transferability: 5, source: 5 }
tier: B
related: [ins_remove-features-as-models-improve]
raw_ref: raw/podcasts/cat-wu--anthropic-product-team--2026-04-27.md
---

# Build products at the edge of what does not yet work

## Claim
In a fast-improving model environment, the right place to build is at features that almost work today and will work fully on the next model. When the model lands, you swap it in and the gap closes; competitors who waited are six months behind on the surface they have to learn.

## Mechanism
Prototyping is now cheap; the expensive thing is being in the market when capability arrives. Products built strictly for the *current* model collapse to commoditized surfaces immediately because every team can build them. Products built for the next model carry the team's accumulated taste and harness work into the moment the capability becomes general. The runway investment is the harness, not the model.

## Conditions
Holds when:
- The team can repeatedly prototype against current model and probe the failure modes.
- The expected next-model release is concrete (Anthropic and OpenAI have visible release cadence; smaller labs do not).

Fails when:
- The product needs revenue today. Building for unreleased capabilities is a bet that pays out on a future date.
- The "almost works" has a predictable obstacle that the next model is not targeting (e.g., needs a new modality entirely).

## Evidence
> "Build products that don't yet work."

Code review at Anthropic was tried multiple times before Opus 4.5 / 4.6 plus Sonnet 4.6 made multi-agent code review reliable enough to gate merges on. Each attempt informed the harness; the final release rode the new model into production immediately.

— Cat Wu on Lenny's Podcast, 2026-04-27

## Signals
- The team has a list of "almost works" features tracked across model versions.
- Each model launch promotes one or more of those features to production.
- Competitors who shipped early get lapped because their surface is built for the previous model and harder to rewrite than yours is to upgrade.

## Counter-evidence
"Build for the next model" is the easy excuse for shipping nothing. The pattern only works if the team actually ships at each model launch — otherwise it is permanent vaporware. Sherwin Wu's variation ("the models will eat your scaffolding") cuts both ways: don't *over-invest* in the harness either, since the next model may obviate it entirely.

## Cross-references
- `ins_remove-features-as-models-improve` — the cleanup half of this build pattern
