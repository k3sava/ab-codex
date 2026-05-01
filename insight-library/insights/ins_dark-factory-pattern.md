---
id: ins_dark-factory-pattern
operator: Simon Willison
operator_role: Independent AI/engineering writer; co-creator of Django
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Simon Willison on agentic engineering and the November 2025 inflection — Lenny's Podcast
source_date: 2026-04-02
captured_date: 2026-05-01
domain: [ai-native, engineering]
lifecycle: [ai-workflow, process-cadence]
maturity: frontier
artifact_class: case-study
score: { originality: 5, specificity: 5, evidence: 4, transferability: 4, source: 5 }
tier: A
related: [ins_november-2025-coding-inflection, ins_simulated-qa-swarm]
raw_ref: raw/podcasts/simon-willison--agentic-engineering-november-inflection--2026-04-02.md
---

# The dark factory: nobody reads the code, gated by a simulated QA swarm

## Claim
StrongDM has been operating since August 2025 under a two-rule progression: (1) nobody types code, (2) nobody reads code. They make this safe by running a simulated swarm of thousands of agent-employees against a vibe-coded simulated stack (Slack, Jira, Okta, the works), 24/7, at roughly $10K/day in tokens.

## Mechanism
The cost of simulating dependencies has collapsed. Building a fake Slack, fake Jira, fake Okta used to be a six-month project; now agents build them from API docs in days. Once the simulated dependencies exist, you can run continuous adversarial-style QA at scale that no human team could match. The simulator catches regressions earlier than any human review, so the human-in-the-loop on individual PRs becomes redundant. Read-the-code discipline shifts from line-level review to suite-level test coverage.

## Conditions
Holds when:
- The product has well-defined surfaces with API docs that can be simulated.
- The team has the operating discipline and budget to run agent swarms continuously.
- The token economics work — token spend < salary saved.

Fails when:
- The product's correctness depends on physical-world or human-judgment outputs the simulator can't cover.
- The org has not invested in the simulation harness — without it, "nobody reads code" is reckless.

## Evidence
> "The cost of simulating those dependencies has crashed... They've built simulated employees that work in a simulated Slack, simulated Jira, simulated Okta — and these are running 24/7 testing their access management software."

— Simon Willison on Lenny's Podcast, 2026-04-02

Token spend reported as ~$10K/day. StrongDM ships security software, the case where you'd most expect line-level review to be irreducible.

## Signals
- Token cost runs higher than the salary cost they replace, but is rising slower than throughput.
- New regressions are caught by the simulated swarm before reaching staging.
- Human time shifts from PR review to harness improvement, eval design, and exception triage.
- Engineers rarely open the code — they read the swarm's reports.

## Counter-evidence
For most companies, "nobody reads code" is premature. The simulator is the load-bearing piece, and most teams have neither the budget nor the discipline to maintain a live simulated environment. The pattern transfers earliest in security, where adversarial coverage is the existing review model anyway. Marketing-side analog requires a synthetic-buyer simulator, not a synthetic-employee simulator — different shape, partly built (Nooks-style SDR practice tools), not yet at "nobody reads the copy" maturity.

## Cross-references
- `ins_november-2025-coding-inflection` — the model-quality threshold that made this safe
- `ins_simulated-qa-swarm` — the harness pattern abstracted from the StrongDM specifics
