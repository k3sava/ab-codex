---
id: ins_underfund-deliberately
operator: Boris Cherny
operator_role: Head of Claude Code, Anthropic
source_url: https://www.youtube.com/watch?v=We7BZVKbCVw
source_type: podcast
source_title: What happens after coding is solved
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [leadership, ai-native, engineering]
lifecycle: [hiring-team-design, process-cadence]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_agents-as-team-not-tools, ins_manager-skill-not-technical]
raw_ref: raw/podcasts/boris-cherny--claude-code-after-coding-solved--2026-04-27.md
---

# Underfund teams deliberately so AI substrate, not headcount, absorbs the work

## Claim
When a team has access to a strong AI substrate, deliberately under-staff each project — one person plus the substrate beats a fully-staffed team — because constraint forces clarity and lets the substrate absorb the rest.

## Mechanism
Adding humans to a workstream the substrate can do creates coordination overhead, slower decisions, and weaker individual ownership. A single under-resourced operator with strong tooling has to clarify scope to ship at all; that forced clarification is where the productivity comes from. The substrate eats the throughput gap.

## Conditions
Holds when:
- The substrate is genuinely capable for the task domain (Claude Code for engineering; this is now plausible for many marketing/PM workstreams).
- The single operator has the judgment to scope and prioritise.
- The org culture rewards intrinsic motivation, not headcount-as-signal-of-importance.

Fails when:
- The work is genuinely beyond the substrate's reach (novel research, deep multi-stakeholder coordination).
- The single operator is junior and needs explicit teammates for craft growth.
- Organisational politics treat headcount as currency for promotion.

## Evidence
> "There's this interesting thing that happens when you underfund everything a little bit — people are forced to clarify, and the way they ship really quickly is just intrinsic motivation."

> "Productivity per engineer increased 200% while we 4x'd the team."

Anthropic measured *both* more people and more output per person. Boris ships 10–30 PRs/day with ~5 Claude Code agents in parallel and is still one of the most prolific committers on his team.

— Boris Cherny on Lenny's Podcast, 2026-04-27

## Signals
- Time-to-first-decision on a new workstream drops; a single named owner is set within hours, not weeks.
- Engineers / PMMs report that token spend rose but headcount stayed flat or grew with output.
- Projects that historically required 4 people now ship with 1 + substrate.
- Revenue or output per employee rises while team size grows (compound, not substitution).

## Counter-evidence
Operators with no substrate access, or in regulated domains where every artifact must be co-reviewed, will hit a quality wall fast. Underfunding without compensating substrate is just the old "do more with less" trap. Boris is explicit that the win comes from substrate + token budget, not constraint alone.

## Cross-references
- `ins_agents-as-team-not-tools` — the substrate side of the same equation
- `ins_manager-skill-not-technical` — the operating-discipline prerequisite
