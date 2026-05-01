---
id: pat_build-for-next-model
title: Build for the next model, not the current one
captured_date: 2026-05-01
convergence_count: 6
tier: A
uses_cards: [ins_build-for-next-model-not-current, ins_build-for-model-six-months-out, ins_build-products-that-dont-yet-work, ins_remove-features-as-models-improve, ins_rebaseline-quarterly-not-pin-to-snapshot, ins_dont-box-the-model-in, ins_use-new-tools-as-new-tools]
domains: [ai-native, engineering, product]
---

# Build for the next model, not the current one

## Convergence
Six operators independently argue that the dominant strategic error in AI product work is over-investing in scaffolding for the model that ships today. The next model lands in 3-6 months and eats most of the workarounds — the team that built lightly, kept the goal abstract, and re-baselined often is in front. The current model is "the worst it will ever be."

## Operators
- Sherwin Wu (Head of Eng, OpenAI API) — `ins_build-for-next-model-not-current`. Frame: customer asks for V1 scaffolding are valid but depreciating; do the asks, but don't bet the surface on them.
- Boris Cherny (Claude Code, Anthropic) — `ins_build-for-model-six-months-out` and `ins_dont-box-the-model-in`. Frame: give the model a goal and tools, do not hard-code the workflow; six-month forecast horizon for surface decisions.
- Cat Wu (Head of Product, Claude Code) — `ins_build-products-that-dont-yet-work` and `ins_remove-features-as-models-improve`. Frame: ship at the edge of what doesn't quite work yet; on every model upgrade, re-read the system prompt and remove crutches.
- Ethan Mollick — `ins_rebaseline-quarterly-not-pin-to-snapshot`. Frame: pin to capabilities you can re-baseline quarterly; don't pin to a snapshot.
- Benjamin Mann (Anthropic) — `ins_use-new-tools-as-new-tools`. Frame: don't use new tools as old tools — retry the original ambition with the new ceiling.
- Simon Willison — `ins_november-2025-coding-inflection`. Frame (counter-anchor): identifies a moment (Nov 2025) when capability crossed a threshold; reinforces "the floor moves" thesis.

## Variation
- Sherwin and Cat operate from inside model labs — their stake is "stop asking the lab for V1 scaffolding."
- Boris extends to a design rule: keep the workflow abstract, keep tools and goals concrete.
- Mollick frames it as a measurement discipline: re-baseline, don't pin.
- Mann frames it as ambition discipline: don't replicate the old workflow at higher speed.
- The shared move is restraint on scaffolding; the variation is whether the operator emphasises the *measurement loop* (Mollick), the *design rule* (Boris), the *ambition reset* (Mann), or the *surface debt* (Sherwin/Cat).

## Implication
Treat current-model scaffolding as a depreciating asset. Ship the customer fix, but don't anchor your roadmap or org structure to it. Add a quarterly re-baseline to your operating cadence. Hire builders who can rewrite from scratch when the ceiling moves.

## Sources
- ins_build-for-next-model-not-current — Sherwin Wu
- ins_build-for-model-six-months-out — Boris Cherny
- ins_build-products-that-dont-yet-work — Cat Wu
- ins_remove-features-as-models-improve — Cat Wu
- ins_rebaseline-quarterly-not-pin-to-snapshot — Ethan Mollick
- ins_dont-box-the-model-in — Boris Cherny
- ins_use-new-tools-as-new-tools — Benjamin Mann
- ins_november-2025-coding-inflection — Simon Willison (anchor evidence)
