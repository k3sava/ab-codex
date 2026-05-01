---
id: ins_engineers-with-product-taste
operator: Cat Wu
operator_role: Head of Product, Claude Code + Co-work, Anthropic
source_url: https://www.youtube.com/watch?v=PplmzlgE0kg
source_type: podcast
source_title: How Anthropic's product team moves faster than anyone else — Lenny's Podcast
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [product, leadership]
lifecycle: [hiring-team-design]
maturity: applied
artifact_class: framework
score: { originality: 3, specificity: 4, evidence: 4, transferability: 5, source: 5 }
tier: B
related: [ins_prds-replaced-by-metrics-and-principles, ins_taste-as-scarce-skill]
raw_ref: raw/podcasts/cat-wu--anthropic-product-team--2026-04-27.md
---

# Hire engineers with product taste rather than adding more PMs

## Claim
As code generation gets cheap, the bottleneck moves to "deciding what to write." Hire engineers who can take user feedback and ship a feature end-to-end without PM input. PM and engineering job descriptions are merging; designers and PMs both write code; the durable scarce skill is taste.

## Mechanism
The previous PM-engineer split assumed code was expensive and product judgment was specialized. Both have inverted. Code is now table stakes; product judgment — knowing which feature to write, which user pain to chase, which polish to prioritize — is the gate. An engineer with taste outputs more user value per week than a PM-plus-engineer pair where the PM is gating.

## Conditions
Holds when:
- The engineering team is genuinely close to users (Anthropic's "Twitter to ship" path; not all orgs have this).
- Product principles are written down (see related card) so engineers can decide from them.

Fails when:
- The work is integration-heavy with hard cross-team dependencies. Coordination work doesn't disappear because an engineer has taste.
- The audience requires careful upstream research (regulated industries, enterprise procurement). PMs still own that.

## Evidence
> "As code becomes much cheaper to write, the thing that becomes more valuable is deciding what to write."

— Cat Wu on Lenny's Podcast, 2026-04-27

Anthropic's product org is ~30-40 PMs across Research PM, Cloud Developer Platform, Cloud Code, Enterprise, and Growth — small relative to engineering. The pattern is reinforced at OpenAI by Sherwin Wu (95% Codex authorship; ICs becoming tech leads of agent fleets).

## Signals
- Engineers regularly read user feedback unprompted.
- PR descriptions reference user pain, not just technical change.
- New PM hires skew senior and ambiguous-problem-focused, not feature-shipping.

## Counter-evidence
Anthropic and OpenAI hire from a deep talent pool with high prior selection on taste. Most companies do not have this hiring funnel. Camille Fournier's platform-engineering work argues the opposite for infrastructure teams: there, manager / specialist split still wins because the work is coordination-dense. Treat this as an applied pattern for product-shipping teams, not a universal hiring rule.

## Cross-references
- `ins_prds-replaced-by-metrics-and-principles` — the operating pattern that enables engineer-led shipping
- `ins_taste-as-scarce-skill` — the broader thesis on what compounds in the AI era
