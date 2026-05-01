---
id: ins_red-green-tdd-shorthand-for-agents
operator: Simon Willison
operator_role: Independent AI/engineering writer; co-creator of Django
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Simon Willison on agentic engineering and the November 2025 inflection — Lenny's Podcast
source_date: 2026-04-02
captured_date: 2026-05-01
domain: [ai-native, engineering]
lifecycle: [ai-workflow]
maturity: applied
artifact_class: workflow
score: { originality: 3, specificity: 5, evidence: 3, transferability: 5, source: 5 }
tier: B
related: [ins_personal-pattern-hoarding]
raw_ref: raw/podcasts/simon-willison--agentic-engineering-november-inflection--2026-04-02.md
---

# Encode jargon shorthand once, save tokens forever

## Claim
Compress recurring multi-paragraph instructions into terms the agent already recognizes ("Red/Green TDD", "monorepo conventions", "ship as research preview") so each new task spends tokens on the work, not the meta-instruction.

## Mechanism
LLMs are pattern-matchers over training distribution. Standard jargon collapses a long natural-language spec into a short symbol the model has seen thousands of times in training. The agent already knows the implied steps, conventions, and edge cases. Token spend per task drops; consistency across tasks rises because the symbol carries shared assumptions.

## Conditions
Holds when:
- The shorthand is a real industry term, not a private acronym. Models recognize "Red/Green TDD"; they do not recognize "RG-TDD-v2".
- The team agrees on the shorthand. Mixed usage produces drift.

Fails when:
- The shorthand is too coarse for the actual task. "Use TDD" is fine for a CRUD endpoint and wrong for a complex algorithm where the test design is the hard part.
- The model's training cutoff predates the term. Then you pay full token cost anyway.

## Evidence
> "I hated TDD as a human; I love it for agents."

Simon notes agents don't get bored writing 1,000 lines of test boilerplate. Adjacent rule he flags: keep tests generously now that updating them is free — what used to be a code smell (verbose test suites) is now a feature.

— Simon Willison on Lenny's Podcast, 2026-04-02

## Signals
- Agent prompts shrink over time as the team adopts shorthand.
- Test suites grow faster than the codebase without slowing iteration.
- New team members adopt the shorthand quickly because the model reinforces it.

## Counter-evidence
Over-compressed prompts hide intent and produce wrong outputs when the symbol means something different in the agent's training data. Always sanity-check the agent's first output on a new shorthand before scaling it.

## Cross-references
- `ins_personal-pattern-hoarding` — the same idea applied at the artifact level instead of the language level
