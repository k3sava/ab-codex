---
id: ins_two-week-engineer-as-mini-pm
operator: Amole Naik
operator_role: Head of Growth, Anthropic
source_url: https://www.youtube.com/watch?v=k-H4nsOTuxU
source_type: podcast
source_title: Anthropic is automating its own growth — Lenny's Podcast
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [product, leadership]
lifecycle: [process-cadence, hiring-team-design]
maturity: applied
artifact_class: workflow
score: { originality: 3, specificity: 5, evidence: 3, transferability: 5, source: 5 }
tier: B
related: [ins_engineers-with-product-taste]
raw_ref: raw/podcasts/amole-naik--anthropic-automating-growth--2026-04-27.md
---

# Use 2 engineering weeks as the threshold for engineer-owned vs PM-owned work

## Claim
Set an explicit cycle-time gate: projects under two engineering weeks are owned end-to-end by the engineer (security, legal, alignment included). Projects over two weeks have a PM accountable. The gate prevents PM bottlenecks on small bets while preserving alignment work on the larger ones.

## Mechanism
Without a gate, every change either flows through PM (slow on small things) or skips PM (gets in trouble on large things). A bright-line rule lets engineers ship the easy stuff fast while pulling PMs into the genuinely complex work. Two weeks is short enough that small bets stay light, long enough that meaningful coordination work is captured.

## Conditions
Holds when:
- Engineers have the breadth to handle ancillary tasks (legal, security review, comms) on small projects.
- The org has a written team-principles doc so engineers can self-decide on alignment.

Fails when:
- The org has not invested in product-taste hiring; engineers without judgment will ship two-week projects that needed PM oversight.
- The work is regulated. Compliance review can't be capped by engineering effort.

## Evidence
> "If a project is under 2 engineering weeks, the engineer owns the PM work — security, legal, alignment. Over 2 weeks, PM is squarely accountable. Productminded engineers' value goes up an order of magnitude."

— Amole Naik on Lenny's Podcast, 2026-04-27

## Signals
- PM time concentrates on a smaller number of high-leverage projects.
- Engineers ship more PRs that touch non-engineering surfaces (copy, legal review) without PM authoring.
- The two-week gate becomes part of the team's vocabulary — "this is a two-week project" carries meaning.

## Counter-evidence
The two-week cutoff is arbitrary; the right number depends on the org's complexity and the engineer's range. Some teams use one week; some use a month. The principle (cycle-time gate) is more durable than the specific number.

## Cross-references
- `ins_engineers-with-product-taste` — the staffing precondition for this gate to work
