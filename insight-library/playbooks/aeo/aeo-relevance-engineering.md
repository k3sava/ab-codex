---
id: pb_aeo-relevance-engineering
title: AEO relevance engineering — passages, schema, mirrors, scorecard
maintained_by: codex maintainers
captured_date: 2026-05-01
domain: [aeo, seo, gtm]
uses_cards: [ins_aeo-is-gtm-capability, ins_aeo-three-layer-presence-readiness-impact, ins_ai-slop-loop, ins_ghost-citation-gap]
originating_operators: [aleyda-solis, lily-ray]
secondary_sources:
  - flywheel/skills/aeo-relevance-engineering/SKILL.md
  - flywheel/skills/schema-delta-aeo/SKILL.md
---

# AEO relevance engineering playbook

Treat answer-engine optimization as an information-retrieval engineering discipline, not content production. The unit of citation is the passage, not the page. Each pass emits four artifacts side-by-side so the doc ships AI-ready, not just human-ready.

Source synthesis: Mike King (iPullRank, "relevance engineering" frame), Aleyda Solis (per-vertical/per-country shape; three-layer measurement — `ins_aeo-three-layer-presence-readiness-impact`), Lily Ray (YouTube + LinkedIn = highest-cited AI Overview sources; `ins_ai-slop-loop`), Amanda Natividad (precision over breadth), Kevin Indig (citation rate vs. mention rate gap — `ins_ghost-citation-gap`).

## When to use

Per-vertical AEO/GEO pass on a single source artifact (vertical playbook, battle card, pricing page, integration page, help doc). Run before publishing the page; rerun whenever schema.org vocabulary shifts or competitor citation profiles change.

## Inputs

- One target artifact path
- Vertical anchor (real-estate / solar / home-services / finserv / dental / horizontal — per-vertical shape varies; one motion does not fit all)
- ICP anchor

## Process

1. **Read substrate.** Positioning, ICP-anchor card, brand-voice, product-knowledge for any product entities in the target.
2. **Extract canonical entities.** Product names, integrations, competitors, ICP role titles, pricing tiers, capability claims. Output an `entities.json` with type tags compatible with schema.org Product / Service / Organization.
3. **Produce 8–12 stand-alone passages, 40–90 words each.** Each answers ONE buyer question. Each is self-contained — LLMs cite passages, not pages (Mike King's frame). Single buyer question per passage.
4. **Generate FAQPage + HowTo schema blocks** for the passages where the question/answer shape fits. Validate against the current schema.org spec.
5. **Map each passage to a YouTube + LinkedIn long-form mirror.** Lily Ray: those two surfaces are the highest-cited AI Overview sources. Output a mirror plan with title, opening hook, source passage.
6. **Score on Aleyda's three layers** (`ins_aeo-three-layer-presence-readiness-impact`):
   - **Presence:** 10–15 buyer-prompt coverage list, recommendation-rate target, citation-rate target.
   - **Readiness:** 10-trait checklist (accessible, transactable, navigable, factual, …) with current state per trait.
   - **Business Impact:** keep three confidence layers separate — observed referrals / modeled lift / attributed deals. Never combine.

## Outputs

- `entities.json` — typed entity list.
- `passages.md` — 8–12 cite-ready passages.
- `schema.json` — FAQPage + HowTo blocks.
- `mirror-plan.md` — YouTube + LinkedIn mirror plan per passage.
- `aeo-scorecard.md` — three-layer scorecard.

## Quality gates

- **Substrate-cited.** Every entity and claim cites a substrate path.
- **Passage discipline.** 40–90 words. Self-contained. One buyer question per passage.
- **Schema validity.** Validates against current schema.org spec.
- **Voice-enforce.** Passages obey brand-voice rules.
- **No fabricated entities.** Entity must be present in product-knowledge or competitive-data-bank.
- **Vertical declared.** Per-vertical shape varies; one motion does not fit all.
- **Three layers separate.** Never bleed modeled lift into observed referrals (Aleyda's failure-mode warning). Never combine into a single AEO number.

## Human checkpoints

- **Canonical-entity owner:** signs off on which entities and capability claims are canonical enough to expose to LLM crawlers.
- **Content + distribution owner:** approves the YouTube/LinkedIn mirror plan; decides which docs cross over to long-form.
- **Positioning + measurement owner:** sets the Presence prompt set per vertical; decides which Business Impact layer rolls into the growth narrative.

## Refusal patterns

- Refuses if the brief / substrate index is missing or stale.
- Refuses if target doc has no frontmatter or no substrate cite.
- Refuses if vertical anchor missing.

## Common failure modes

- Optimizing whole pages instead of passages. Passage is the unit of citation.
- Single AEO score that mixes Presence, Readiness, and Business Impact.
- Modeled lift presented as observed lift.
- Schema generated without validation.
- Skipping YouTube + LinkedIn mirror plan; web pages alone underperform on AI Overview citations.
- Ignoring per-vertical shape — same passages across verticals.
- Mention rate up but citation rate flat (`ins_ghost-citation-gap`) — comparative content closes the gap.
- Seeded fake claims that self-confirm in AI Overviews (`ins_ai-slop-loop`).
