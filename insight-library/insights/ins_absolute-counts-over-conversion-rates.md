---
id: ins_absolute-counts-over-conversion-rates
operator: Archie Abrams
operator_role: VP Product & Growth, Shopify
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Churn optimization & long-term holdout experiments
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [growth-demand, product]
lifecycle: [onboarding-activation, attribution-measurement]
maturity: foundational
artifact_class: metric-model
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_long-term-holdouts-30-40-evaporate]
raw_ref: raw/podcasts/archie-abrams--churn-optimization-shopify--2026-04-28.md
---

# Optimise for absolute count of users reaching each stage, not stage conversion rates

## Claim
Conversion-rate optimisation creates a perverse incentive: the easiest way to lift a stage's rate is to make the previous stage harder, filtering out lower-intent users. Optimise instead for the absolute number of users reaching the stage, even if rates fall.

## Mechanism
Each funnel stage's conversion rate is a ratio with two levers — increase the numerator (good) or shrink the denominator (perverse). Stage owners under rate-only goals will optimise for whichever lever is easier, and shrinking the denominator usually is. Optimising for absolute count forces teams to grow the funnel, not just compress it. Lowering signup friction looks like a regression on rate but often increases activated users and reduces CAC.

## Conditions
Holds when:
- The downstream value of an additional activated user exceeds the cost of additional low-intent traffic.
- The team has measurement that ties absolute counts to revenue or LTV.
- Leadership will not panic when the rate dashboard turns red.

Fails when:
- Servicing low-intent users costs more than they generate (sales-led complex products).
- The team's compensation or visibility is tied to rate metrics; absolute-count goals will not stick.

## Evidence
> "Because that will always hurt your conversion rate, but it may actually give you more people on the outside."

Concrete pattern at Shopify: lower signup friction → conversion rate falls → absolute activated merchants rise → CAC drops → spend more to acquire more → net win.

— Archie Abrams on Lenny's Podcast, 2026-04-28

## Signals
- Funnel rate dashboards and absolute-count dashboards diverge; teams using both make different decisions than teams using only rates.
- Lower-friction signup paths show falling rates but rising downstream activations and revenue.
- CAC-to-revenue ratio improves even as headline conversion drops.

## Counter-evidence
For sales-assisted or high-touch products, every low-intent signup costs the team. Pure rate optimisation makes more sense there. The framework is conditional on the cost-to-serve being low.

## Cross-references
- `ins_long-term-holdouts-30-40-evaporate` — pair with for the long-term value test
