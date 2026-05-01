---
id: ins_cash-four-stage-growth-automation
operator: Amol Avasare
operator_role: Head of Growth, Anthropic (ex-Mercury, MasterClass)
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Anthropic growth, CASH, and the squeezed PM
source_date: 2026-04-05
captured_date: 2026-05-01
domain: [growth-demand, ai-native, gtm]
lifecycle: [growth-loops, ai-workflow, process-cadence]
maturity: frontier
artifact_class: workflow
score: { originality: 4, specificity: 5, evidence: 5, transferability: 5, source: 5 }
tier: A
related: [ins_squeezed-pm-thesis, ins_dont-box-the-model-in]
raw_ref: raw/podcasts/amol-avasare--anthropic-growth-cash--2026-04-05.md
---

# Automate the four stages of a growth experiment; keep humans on alignment

## Claim
Run growth experimentation through a four-stage substrate — identify opportunity, build the change, test against a quality + brand bar, ship and analyze — driven by Claude. The fifth stage (cross-functional alignment) stays human, and that is the lasting bottleneck.

## Mechanism
Most growth experimentation is loosely coupled steps that already have rich playbooks: ideation, implementation, QA, analysis. A capable model can drive each step end-to-end against a written brand and quality bar, with current win rates around "junior PM 2–3 years in." The expensive human input is no longer building the experiment — it is the political and aesthetic work of getting six people in a room to agree on what to ship.

## Conditions
Holds when:
- The team has a written quality + brand bar codified as skills with explicit dos / don'ts.
- A frontier model (Opus 4.5+ in Anthropic's case) is wired to the relevant tools.
- Growth output is a high-volume stream of similar experiments, not one-shot strategic bets.

Fails when:
- Brand and quality guardrails are tacit, not written. The model has nothing to align to.
- The work depends on novel research or category creation, not iteration on a known surface.
- Stakeholder alignment was already the bottleneck — automation does not solve org-design problems.

## Evidence
> "Identify opportunities → build the feature → test against quality + brand bar → ship + analyze."

> "We will have AGI and it will still be impossible to get six people in a room to align."

The team is led by Alexey Komissarouk inside Anthropic. Win rate today is named at "junior PM 2–3 years in." The substrate wasn't viable before Opus 4.5; it is now. Human-in-loop review need is decreasing weekly.

— Amol Avasare on Lenny's Podcast, 2026-04-05

## Signals
- Number of shipped experiments per growth-PM-month rises 3–5x without quality regression.
- Brand-bar violations caught in pre-ship review trend down to a stable low.
- PM time shifts from "building the experiment" to "deciding which experiment matters" and "negotiating cross-team alignment."

## Counter-evidence
Operators outside frontier labs may not have the brand-bar maturity, the model access, or the org buy-in to run this. Without the codified guardrails, automating stages 1–4 produces fast slop. The win is not in the automation; it is in the prerequisite of having explicit quality definitions.

## Cross-references
- `ins_squeezed-pm-thesis` — the staffing implication
- `ins_dont-box-the-model-in` — why the substrate exposes Claude with light scaffolding
