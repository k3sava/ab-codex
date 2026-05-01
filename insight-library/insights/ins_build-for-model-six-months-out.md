---
id: ins_build-for-model-six-months-out
operator: Boris Cherny
operator_role: Head of Claude Code, Anthropic
source_url: https://www.youtube.com/watch?v=We7BZVKbCVw
source_type: podcast
source_title: What happens after coding is solved
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [ai-native, product, strategy-bets]
lifecycle: [strategy-bets, ai-workflow]
maturity: frontier
artifact_class: framework
score: { originality: 5, specificity: 4, evidence: 5, transferability: 5, source: 5 }
tier: A
related: [ins_dont-box-the-model-in, ins_underfund-deliberately]
raw_ref: raw/podcasts/boris-cherny--claude-code-after-coding-solved--2026-04-27.md
---

# Build for the model six months out, not the one that ships today

## Claim
Design AI-product features for the model capability you expect six months from now; accept that PMF will be mediocre at launch and inflect when the next model arrives.

## Mechanism
Model capability is on a steep curve. A product designed for today's model has its scaffolding wiped out by the next release; a product designed for the model six months ahead reads as broken at launch but becomes the obvious leader the moment the underlying capability lands. The early investment in surface area, tools, and evals compounds because the model — not the product team — does the catching up.

## Conditions
Holds when:
- The product depends on a frontier capability (reasoning depth, agentic loops, long context) that is on a known improvement trajectory.
- The team can tolerate weak metrics for two quarters without org-political collapse.
- Distribution is in place to ride the inflection (existing user base, channel, dogfooding loop).

Fails when:
- The capability gap is qualitative, not quantitative (no improvement curve to ride).
- The org needs metric proof at every gate; you'll be killed before inflection.
- Competitors with better current PMF will own the category by the time your model lands.

## Evidence
> "Your product market fit won't be very good for the first 6 months, but when that model comes out you're going to hit the ground running."

Claude Code felt mediocre on Sonnet 3.5 and inflected at Opus 4. Boris's team kept shipping into the weak window because they were betting on the next model, not optimizing the current one.

— Boris Cherny on Lenny's Podcast, 2026-04-27

## Signals
- Internal evals improve faster than user-facing metrics during the wait.
- Each new model release produces a step-change in user behaviour (engagement spike, expanded use cases) without product changes.
- Competitors who optimised for the current model find their differentiation evaporating.

## Counter-evidence
The Bitter Lesson cuts both ways: if you bet on the wrong dimension of capability improvement, you waste two quarters. Most teams do not have the runway, conviction, or model-roadmap visibility to make this bet correctly. Operators outside frontier labs may be guessing about what "six months out" looks like.

## Cross-references
- `ins_dont-box-the-model-in` — the architectural corollary
- `ins_underfund-deliberately` — the staffing pattern that makes this affordable
