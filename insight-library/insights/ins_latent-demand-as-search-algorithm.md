---
id: ins_latent-demand-as-search-algorithm
operator: Boris Cherny
operator_role: Head of Claude Code, Anthropic
source_url: https://www.youtube.com/watch?v=We7BZVKbCVw
source_type: podcast
source_title: What happens after coding is solved
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [product, ai-native, growth-demand]
lifecycle: [strategy-bets, process-cadence]
maturity: applied
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_build-for-model-six-months-out]
raw_ref: raw/podcasts/boris-cherny--claude-code-after-coding-solved--2026-04-27.md
---

# Latent demand — what users hack around the product to get — is the next loop

## Claim
The most reliable signal for what to build next is what users are already hacking together inside or around the product to get a job done. In AI-native products, this extends to watching what the *model* is trying to do but cannot reach — clear that path.

## Mechanism
A user willing to abuse a primitive to get a job done has revealed both the demand and the rough shape of the solution. The cost of discovery is paid by the user, not the product team. Building toward that hack converts a workaround into a primary surface and concentrates demand that was already there. The AI flavor: when the model "wants" to take an action but is missing a tool or context, the gap is itself a roadmap.

## Conditions
Holds when:
- You have meaningful telemetry or qualitative access to how users actually use the product.
- The hack is repeated across many users, not a single power-user quirk.
- The team has the discipline to follow a real signal instead of opinion-driven roadmaps.

Fails when:
- The product is too new to have meaningful usage variance.
- The hack is a workaround for a bug you should fix, not a request for a new surface.
- Privacy, sampling bias, or low-volume usage makes the signal unreliable.

## Evidence
> "In research we call this being on distribution."

Two flavors Boris named:
- **Traditional latent demand** — Facebook Marketplace was discovered because 40% of group posts were buy/sell. Co-work was discovered because non-engineers were using Claude Code in a terminal.
- **Modern AI flavor** — Watch what the model is trying to do and clear the path; tool gaps and refusals are roadmap signals.

— Boris Cherny on Lenny's Podcast, 2026-04-27

## Signals
- A workstream that users hack today becomes a first-class feature with little adoption resistance because the demand was already proven.
- Qualitative interviews surface the same workaround across multiple users.
- New tools added to an agent immediately get high utilisation rates.

## Counter-evidence
Hacks are not always demand — sometimes they are bugs that mask the right product. And not every model refusal is a missing tool; some are correct safety boundaries that should not be cleared. The skill is reading which is which.

## Cross-references
- `ins_build-for-model-six-months-out` — where to bet when latent demand matures
- `ins_agents-as-team-not-tools` — the agent-tool inventory framing for the AI flavor
