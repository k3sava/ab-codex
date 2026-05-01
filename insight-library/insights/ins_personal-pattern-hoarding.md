---
id: ins_personal-pattern-hoarding
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
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_llm-wiki-pattern]
raw_ref: raw/podcasts/simon-willison--agentic-engineering-november-inflection--2026-04-02.md
---

# Hoard a personal repository of things that worked — coding agents will recombine them

## Claim
Maintain a public-or-private GitHub repo of every small thing you ship — tools, research scripts, one-off pages. When a new task comes in, point a coding agent at the repo and let it search, recombine, and adapt prior solutions instead of starting from scratch.

## Mechanism
Coding agents are "phenomenally good at sticking to existing patterns." A local corpus of working code biases the agent toward your style, your conventions, and your past solutions. Search-over-corpus is now cheap; starting from a similar working artifact is faster and lower-defect than starting from a blank file. The corpus compounds: each new artifact joins the haystack and accelerates the next one.

## Conditions
Holds when:
- You ship enough small artifacts for the corpus to cover real adjacency.
- The corpus is greppable / searchable by an agent (markdown reports, source code, README per project).

Fails when:
- The corpus is incoherent — too few projects, no metadata, dead branches. Agent pulls in stale or wrong patterns.
- The work is one-of-a-kind. Hoarding helps recombination, not pure novelty.

## Evidence
> "The code is cheap now."

Simon maintains two corpora: `simonw/tools` (193 small HTML/JS tools) and `simonw/research` (75 AI-driven research projects, each with a markdown report after running real code). Claude Code searches these to combine prior solutions for new problems.

— Simon Willison on Lenny's Podcast, 2026-04-02

## Signals
- New tasks routinely complete in minutes by adapting an existing artifact.
- The agent cites or imports your prior code unprompted.
- Solo operators effectively run with a "junior team" of past selves.
- The corpus has explicit metadata — frontmatter, README, problem statement — so the agent can match on intent, not just code.

## Counter-evidence
A messy hoard is worse than no hoard — the agent picks up bad patterns. Karpathy's LLM-wiki pattern (`ins_llm-wiki-pattern`) is the disciplined version: append-only raw, synthesized pages, explicit indexing. Without that discipline the corpus rots and recommends old approaches that the model has since obsoleted. The hoard must be re-pruned as model capability shifts.

## Cross-references
- `ins_llm-wiki-pattern` — the disciplined-corpus pattern Simon's hoard implements informally
