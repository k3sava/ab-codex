---
id: ins_november-2025-coding-inflection
operator: Simon Willison
operator_role: Co-creator of Django; creator of Datasette; independent AI/engineering writer
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Simon Willison on agentic engineering and the November 2025 inflection — Lenny's Podcast
source_date: 2026-04-02
captured_date: 2026-05-01
domain: [ai-native, engineering]
lifecycle: [strategy-bets, ai-workflow]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_build-for-next-model-not-current, ins_dark-factory-pattern]
raw_ref: raw/podcasts/simon-willison--agentic-engineering-november-inflection--2026-04-02.md
---

# November 2025 was the qualitative threshold — coding agents now almost always do what you tell them

## Claim
Between GPT 5.1 and Claude Opus 4.5, coding agents crossed a discrete threshold from "mostly works" to "almost always works." That single shift, dating from November 2025, is the qualifier separating "AI-native" as aspiration from "AI-native" as operating reality.

## Mechanism
Reasoning models gave coding agents the ability to think through problems before producing output. Combined with longer context and stronger tool use, the failure rate per task dropped past the threshold where humans stop verifying every step. Below that threshold, the human reviews everything and time-savings are marginal. Above it, the human reviews exceptions and time-savings compound. This is a phase change, not a slope change.

## Conditions
Holds when:
- The task has a verifiable output (tests pass, build green, page renders).
- The human reviewer can spot-check rather than full-read.

Fails when:
- The task is unverifiable (legal, strategy, taste). The threshold for those domains comes later, at the rate eval rigor improves for each.
- The harness around the model is poor — even a good model with no test loop produces brittle output.

## Evidence
> "Previously coding agents mostly worked, now they almost always do what you told them to do."

Simon reports ~95% of his own code is no longer typed by him personally. StrongDM has been practicing "nobody reads the code" since August 2025 — security software, no less — gated by a simulated-QA swarm running thousands of agent-driven test users in a vibe-coded simulated Slack/Jira/Okta. ~$10K/day in tokens, robust enough to ship security-critical infrastructure.

— Simon Willison on Lenny's Podcast, 2026-04-02

## Signals
- Engineers who spent 3 weeks on a feature now ship the same feature in 3 hours.
- The bottleneck stops being writing code and starts being deciding what to write, prototyping which approach wins, and getting alignment.
- Per-engineer PR throughput jumps measurably (Sherwin Wu's Codex data: heavy users +70%).
- Teams stop writing scaffolding around model weakness because the weakness disappeared between releases.

## Counter-evidence
The threshold is task-specific. Code is the bellwether because code is verifiable; essays, lawsuits, and plans don't have a unit test. Operators who extrapolate "November happened for code" to "November happened for marketing" will overpay for current-model marketing agents and underbuild eval infrastructure. The right move is to invest in the eval/verification layer for each domain so that domain's threshold can arrive.

## Cross-references
- `ins_build-for-next-model-not-current` — the operating principle this threshold validates
- `ins_dark-factory-pattern` — the StrongDM example of post-threshold operations
