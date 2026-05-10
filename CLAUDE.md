# ab-codex working agreement

Public operator insight library at codex.iamkesava.com. Open-source, machine-discoverable, mobile-first. Higher bar than the average dev project. Atomic operator-attributed insights — every claim traces to a named human who shipped something.

## Voice (always-on)

Operator voice. Someone who actually ran the play. Not consultant voice, not AI voice.

- Zero em dashes outside `> verbatim` operator quotes. Use periods, commas, or middots (·).
- Kill-list banned: orchestration, seamless, strategic, leverage, transform, holistic, synergy, bespoke, unlock, robust, comprehensive, cutting-edge, innovative, paradigm, dive, delve, embark, journey. If a word does no work, the sentence won't miss it.
- No throat-clearing openers. No "It's worth noting." No "Furthermore."
- Plain English over jargon. "Goals" not "bets." "Principles" not "doctrine." "Insights" not "cards."
- Gary Provost cadence: vary sentence length. Short. Then medium. Then longer.
- Headlines do work. Specific beats categorical.
- Operator verbatim quotes are immutable. Never strip em dashes from them. Never paraphrase. Never composite.

## Anti-fabrication (overrides everything)

Every fact traces to raw source, codebase, or operator's own words. If it doesn't trace, write "unverified" and stop.

- Don't invent URLs, LinkedIn slugs, handles, dates, metrics, IDs.
- Don't paraphrase as if quoted.
- Re-count from `git log` or source files. Never round, approximate, paraphrase numbers.
- "Looks like X based on context" isn't evidence. Verify or omit.

## Working agreement

- Plan before code on anything bigger than a one-line fix. Get explicit OK before executing.
- Auto mode is on. Act on low-risk reversible work. Pause before destructive ops (push --force, branch delete, force reset, anything user-facing that affects strangers).
- Commit after each meaningful unit. Body lists what shipped, what each lens (Ogilvy / Feynman / DaVinci / Jobs) flagged, what's deferred and why.
- Cheap-tier delegation: bulk reads + boilerplate → `ask-flash`. Judgment stays on Claude. See `cheap-tier-delegation` skill.
- Click every primary button in Chrome desktop + Safari iOS minimum before declaring done. Real device, not emulator.
- "Done" means a stranger could click it cold and have it work.

## Detail layer

Load `ab-codex-playbook` skill (`.claude/skills/ab-codex-playbook/SKILL.md`) when implementing features, building pages, or auditing surfaces. It carries: UX & design rules, IA edge model, accessibility floor, sharing & AEO surfaces, 10 QC failure modes, error-eye patterns, loop discipline, round structure.

## Updates

New rules go in `.claude/skills/ab-codex-playbook/SKILL.md` (or a new sibling skill), not here. This file stays ≤100 lines.
