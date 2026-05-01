---
id: ins_squeezed-pm-thesis
operator: Amol Avasare
operator_role: Head of Growth, Anthropic
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Anthropic growth, CASH, and the squeezed PM
source_date: 2026-04-05
captured_date: 2026-05-01
domain: [leadership, product, ai-native]
lifecycle: [hiring-team-design, process-cadence]
maturity: frontier
artifact_class: framework
score: { originality: 5, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_cash-four-stage-growth-automation, ins_underfund-deliberately, ins_pm-should-not-ship-at-scale]
raw_ref: raw/podcasts/amol-avasare--anthropic-growth-cash--2026-04-05.md
---

# Claude Code multiplies engineers 2–3x; PM and design become the bottleneck

## Claim
When engineering output is multiplied 2–3x by Claude Code, the team's effective shape changes from 5 eng + 1 PM + 1 design to roughly 15–20 eng + 1 PM + 1 design. PM and design are now the constraint. Two responses work: hire more, or deputise product-minded engineers as mini-PMs for short projects under a clear two-week rule.

## Mechanism
Engineering throughput multiplies; PM and design throughput does not multiply at the same rate yet. The bottleneck moves to whichever role cannot keep up with the new pace. Forcing all coordination through a single PM creates a queue; hiring more PMs is one fix; the other is to let engineers own short projects ("under 2 weeks of eng") with PM in advisory mode, reserving full PM ownership for larger workstreams.

## Conditions
Holds when:
- Engineers have meaningful Claude Code access and use it.
- The org has product-minded engineers who can scope and ship without a PM.
- There is a written rule (the "two-week rule" Anthropic uses) so the boundary is clear.

Fails when:
- The eng team does not actually use the substrate at frontier intensity.
- Product strategy is highly contested and needs a senior PM in every room.
- Engineers are not product-minded; deputising them produces feature-shaped output without strategic frame.

## Evidence
> Default team: 5 eng + 1 designer + 1 PM. Claude Code 2–3x's engineering. The team effectively becomes 15–20 eng + 1.5–2 PM + 1.5–2 design.

> "Two-week rule: under 2 weeks of eng → engineer drives, PM advisory; over 2 weeks → PM accountable."

— Amol Avasare on Lenny's Podcast, 2026-04-05

## Signals
- PMs report being reactive, behind, and unable to write the "why" doc.
- Engineering velocity appears unconstrained but design / PM artifacts lag visibly.
- Adoption of an explicit two-week rule unblocks the queue without quality drop.

## Counter-evidence
The squeeze assumes engineering is the multiplied function. In some orgs, design or research is the genuine multiplier and the bottleneck moves elsewhere. Also, deputising engineers as mini-PMs only works in a culture where product taste is broadly shared; it can fail badly in deeply siloed orgs.

## Cross-references
- `ins_cash-four-stage-growth-automation` — the automation that produces the squeeze
- `ins_underfund-deliberately` — Boris Cherny's structural counterpart
- `ins_pm-should-not-ship-at-scale` — how senior PMs spend the rebalanced time
