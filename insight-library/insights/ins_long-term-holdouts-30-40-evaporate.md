---
id: ins_long-term-holdouts-30-40-evaporate
operator: Archie Abrams
operator_role: VP Product & Growth, Shopify
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Churn optimization & long-term holdout experiments
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [growth-demand, product]
lifecycle: [growth-loops, attribution-measurement]
maturity: applied
artifact_class: metric-model
score: { originality: 5, specificity: 5, evidence: 5, transferability: 4, source: 5 }
tier: A
related: [ins_absolute-counts-over-conversion-rates]
raw_ref: raw/podcasts/archie-abrams--churn-optimization-shopify--2026-04-28.md
---

# 30–40% of growth experiments with short-term lift show no incremental value at one year

## Claim
Run a permanent 5% holdout on every shipped change (or a 50/50 split on new-user cohorts) and revisit one to three years later. Roughly 30–40% of changes that produced a clear short-term lift will show no incremental long-term value. Most growth measurement misses this.

## Mechanism
Short-term lifts are often pull-forward effects — accelerating signups that would have happened anyway — or low-quality user attraction that does not durable retain. Long-term holdouts catch this by separating "moved the metric" from "created incremental value." Without the holdout, the team takes credit for evaporated wins and re-invests behind theatre.

## Conditions
Holds when:
- The product has cohort-tracking infrastructure that can sustain a 5% holdout for years.
- Leadership accepts the slower feedback loop (3, 6, 9, 12-month review cadences).
- The team has the discipline to act on negative findings rather than rationalise them.

Fails when:
- The product is too small or too new to have meaningful long-term cohorts.
- Decision-making cadence requires same-quarter wins; long-term findings arrive too late.
- The "win" is genuinely a one-time pull-forward (e.g., a launch event) where short-term is the right horizon.

## Evidence
> "We want to lower barriers to get started and help folks grow, and those winners make the whole thing work."

> Finding: 30–40% of experiments showing short-term lift (paying signup, first sale) show NO incremental GMV lift after 1 year.

> Archie has never seen short-term positive flip to long-term negative. So safe to ship — but don't take credit.

Operating discipline at Shopify: 5% always-on holdout, automated email reports at 3 / 6 / 9 / 12 months. "You can't hide from reality."

— Archie Abrams on Lenny's Podcast, 2026-04-28

## Signals
- Quarterly growth dashboards diverge from one-year cohort GMV / ARPU dashboards.
- Initiatives that win the quarter look smaller in the annual review; budgets reallocate accordingly.
- Teams that previously over-claimed wins re-calibrate downward without political damage when the long-term data is automated and shared.

## Counter-evidence
For very early-stage products, you don't have the volume or runway to run multi-year holdouts; short-term metrics are all you have. And the 30–40% number is Shopify's, not a universal constant — sample-size and category dependent. Some operators argue holdouts at scale leak revenue Shopify can afford to leak; smaller orgs cannot.

## Cross-references
- `ins_absolute-counts-over-conversion-rates` — same operator, complementary measurement frame
