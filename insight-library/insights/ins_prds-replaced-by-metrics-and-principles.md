---
id: ins_prds-replaced-by-metrics-and-principles
operator: Cat Wu
operator_role: Head of Product, Claude Code + Co-work, Anthropic
source_url: https://www.youtube.com/watch?v=PplmzlgE0kg
source_type: podcast
source_title: How Anthropic's product team moves faster than anyone else — Lenny's Podcast
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [product, leadership]
lifecycle: [process-cadence]
maturity: applied
artifact_class: framework
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_research-preview-trust-cadence, ins_engineers-with-product-taste]
raw_ref: raw/podcasts/cat-wu--anthropic-product-team--2026-04-27.md
---

# Replace PRDs with weekly metrics readouts plus a written team-principles doc

## Claim
For most product work, kill the default PRD. Replace it with two artifacts: weekly metrics readouts (so the whole team knows the trajectory and the drivers) plus a "team principles" document that names key users, why they're key, and the explicit tradeoffs the team has agreed to make. PRDs return only for genuinely ambiguous features and heavy-infra projects.

## Mechanism
PRDs are written to align stakeholders and to document decisions. When the org has a shared, public picture of where the metrics are going *and* a written tie-breaker doc, any engineer can make a local decision without escalating. The PRD's coordination role evaporates. What remains — designing ambiguous features and infrastructure — keeps PRDs because the decisions there are genuinely novel.

## Conditions
Holds when:
- The metrics readouts are widely understood, not just "shown to leadership." A weekly all-hands or read-out cadence is mandatory.
- The team-principles doc is genuinely opinionated. "We optimize for X over Y" must be clear enough for an engineer to argue from it.

Fails when:
- Metrics ownership is fragmented; no one has the data and the trade-offs in their head simultaneously.
- The team has no shared aesthetic — every engineer falls back to personal taste, which produces inconsistent product.
- The org legally or contractually requires written specs (regulated industries, vendor compliance).

## Evidence
> "There are many engineers on our team who are fully able to end-to-end go from see user feedback on Twitter through to ship a product at the end of the week with almost no product involvement. This I think is actually the most efficient way to ship something."

— Cat Wu on Lenny's Podcast, 2026-04-27

Anthropic's team-principles doc names users, ranks priorities, and pre-records tradeoffs. New engineers consult it before raising a question to PM. PMs reappear as authors only on ambiguous-product or heavy-infra projects.

## Signals
- Engineers ship features without PM authorship, citing the principles doc.
- Weekly metrics review attendance is broad (not just leadership).
- The team-principles doc gets edited as priorities shift, not stays static for quarters.
- PRDs become a feature-class signal: "this needs a PRD" is shorthand for "this is genuinely ambiguous."

## Counter-evidence
At larger orgs, the principles doc tends to balloon into a 50-page wiki nobody reads. The compression discipline matters more than the doc itself. April Dunford's positioning work suggests the principles must be ruthlessly short, not exhaustive. Also, Cat acknowledges PRDs are still required for heavy-infra and regulated work — this is not a universal kill.

## Cross-references
- `ins_research-preview-trust-cadence` — the shipping rhythm the principles doc enables
- `ins_engineers-with-product-taste` — the staffing change that makes engineer-led shipping possible
