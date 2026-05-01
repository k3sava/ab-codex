---
id: ins_100-percent-automation-rule
operator: Cat Wu
operator_role: Head of Product, Claude Code + Co-work, Anthropic
source_url: https://www.youtube.com/watch?v=PplmzlgE0kg
source_type: podcast
source_title: How Anthropic's product team moves faster than anyone else — Lenny's Podcast
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [ai-native, engineering]
lifecycle: [ai-workflow]
maturity: applied
artifact_class: framework
score: { originality: 3, specificity: 4, evidence: 3, transferability: 5, source: 5 }
tier: B
related: []
raw_ref: raw/podcasts/cat-wu--anthropic-product-team--2026-04-27.md
---

# An automation that works 95% of the time is not an automation

## Claim
If an automation does not work 100% of the time, it isn't really an automation — the last 5–10% takes more time to manage than the original task did to do once. Most users abandon at 95%; the payoff is repeated runs at full reliability, which only materializes if you push to 100%.

## Mechanism
Manual exception handling is more cognitively expensive than the original work because it requires you to context-switch into "is this the 5% case?" every run. Below 100%, you build mental overhead that grows linearly with run count. At 100%, the automation drops out of mind and compounds with each repetition. Building automation is slower than doing the task once; the math only works at full coverage.

## Conditions
Holds when:
- The task repeats often enough that 100% reliability returns the harness investment.
- The failure modes are specific enough to debug, not random model variance.

Fails when:
- The task is one-off; 100% pursuit is wasted effort.
- The cost of an undetected failure is high — there, you keep humans in the loop even at 99% reliability.

## Evidence
> "If an automation doesn't work 100% of the time, it's not really an automation. That last 5–10% takes more time. Most users give up at 95%."

— Cat Wu on Lenny's Podcast, 2026-04-27

## Signals
- The team tracks failure rate per automation and refuses to ship below threshold.
- "Half-automated" workflows get either fully automated or removed within a defined timebox.
- People stop checking the output of long-running automations because they have learned to trust them.

## Counter-evidence
Aishwarya Naresh Reganti and Kiriti Badam's CCCD argument cuts the other way: AI products are non-deterministic and 100% is a category error in many domains. The right move is *transparent uncertainty* (confidence scores, multiple hypotheses) rather than a binary "automation / not." Cat's rule applies cleanly to deterministic automation tasks and less cleanly to probabilistic AI outputs.

## Cross-references
- (none in current corpus)
