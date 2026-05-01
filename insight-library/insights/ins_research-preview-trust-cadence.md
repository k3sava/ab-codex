---
id: ins_research-preview-trust-cadence
operator: Cat Wu
operator_role: Head of Product, Claude Code + Co-work, Anthropic
source_url: https://www.youtube.com/watch?v=PplmzlgE0kg
source_type: podcast
source_title: How Anthropic's product team moves faster than anyone else — Lenny's Podcast
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [product, ai-native]
lifecycle: [launch, process-cadence]
maturity: applied
artifact_class: workflow
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_prds-replaced-by-metrics-and-principles, ins_engineers-with-product-taste]
raw_ref: raw/podcasts/cat-wu--anthropic-product-team--2026-04-27.md
---

# Brand work as "research preview" to compress timelines from quarters to weeks

## Claim
Label new features explicitly as "research preview" to lower the commitment cost of shipping. The reduced expectation lets the team release in a week or two, gather real usage data, and iterate; the tradeoff (less polish at launch) is offset by a published cadence of follow-up shipments.

## Mechanism
Most launch friction is reputational: "if we ship this and it breaks, the brand suffers." Pre-naming the artifact as a preview pre-commits the audience to incremental quality. The team then earns trust via *iteration cadence*, not initial polish. This unsticks the multi-quarter alignment-then-ship pattern that crushes velocity in older orgs.

## Conditions
Holds when:
- The team can actually iterate weekly. Promising a research preview and going dark for a month destroys trust faster than waiting.
- The product surface tolerates change. APIs and core flows are higher-stakes than experimental features.

Fails when:
- The audience expects production stability (e.g., enterprise compliance, regulated industries).
- "Research preview" becomes a permanent label dodging accountability — at some point the work has to graduate.

## Evidence
> "We try to ship most features in research preview within a week. The way you lose trust around quality is by releasing something early and then nothing happens after."

— Cat Wu on Lenny's Podcast, 2026-04-27

Cat's team timelines collapsed from 6 months to 1 month to 1 week to 1 day. Engineers post in an "evergreen launch room" the moment a feature is dog-fooded; Sarah (Docs), Alex (PMM), and DevRel turn around the marketing announcement the next day.

## Signals
- Time from "feature dog-fooded" to "publicly available" is measured in days.
- Each preview has at least one shipped iteration within two weeks.
- Brand and docs teams treat preview launches as default work, not exception work.

## Counter-evidence
Jenny Wen (Anthropic Design): non-deterministic AI products *cannot* be mocked, so research-preview is the only honest mode. For deterministic products with stable APIs, traditional GA discipline still wins because users expect contracts, not iterations. The pattern transfers most cleanly to AI-native and consumer-discovery products and least cleanly to platform / API surfaces with SLAs.

## Cross-references
- `ins_prds-replaced-by-metrics-and-principles` — the doc-light culture this cadence assumes
- `ins_engineers-with-product-taste` — the staffing pattern that makes weekly preview shipping feasible
