---
id: ins_dont-box-the-model-in
operator: Boris Cherny
operator_role: Head of Claude Code, Anthropic
source_url: https://www.youtube.com/watch?v=We7BZVKbCVw
source_type: podcast
source_title: What happens after coding is solved
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [ai-native, engineering, product]
lifecycle: [ai-workflow, process-cadence]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_build-for-model-six-months-out, ins_agents-as-team-not-tools]
raw_ref: raw/podcasts/boris-cherny--claude-code-after-coding-solved--2026-04-27.md
---

# Give the model tools and a goal; do not hard-code the workflow

## Claim
When building on an LLM, expose tools and a goal and let the model plan the steps. Strict workflows, orchestrators, and decision trees are scaffolding that gets wiped out by the next model release.

## Mechanism
The Bitter Lesson (Sutton): general methods that scale with compute beat human-engineered specific methods over time. Inside a product, every workflow rule, every "if-this-then-that" branch, every prompt-chain orchestrator is a bet against model improvement. When the next model can do that step natively, the scaffolding becomes dead weight and a brittleness source. Tools + goal + a strong general model degrades gracefully and improves automatically.

## Conditions
Holds when:
- You have access to a frontier model with enough capability to be agentic.
- The task can be expressed as a goal plus a small toolset (not a regulated procedure that must follow a fixed order).
- You can afford to give the model enough tokens and turns to reason.

Fails when:
- Compliance, safety, or audit requires a fixed workflow with explicit checkpoints.
- The model is too weak today and you cannot wait for the next one.
- Determinism / SLA demands prevent letting the model take its own path.

## Evidence
> "A lot of people's instinct when they build on the model is to make it behave a particular way... almost always you get better results if you give the model tools, give it a goal, and let it figure it out."

Claude Code's design choice was minimal scaffolding around the LLM, the smallest possible toolset, and direct exposure of capability. "The product is the model." That choice is why it scaled where heavier wrappers stalled.

— Boris Cherny on Lenny's Podcast, 2026-04-27

## Signals
- Each new model release improves your product without engineering work.
- New use cases emerge from users that the team did not anticipate (a sign the model has room to roam).
- Bug reports shift from "the workflow is wrong for my case" to "the model made a judgment I disagree with" — a healthier failure mode.

## Counter-evidence
For early or weak models, scaffolding genuinely lifts quality. April Dunford's positioning work, Claire Vo's progressive-trust onboarding, and other operator playbooks all suggest that *some* structure (named tiers, guardrails, evals) keeps quality bounded. The right reading is: bound the model's safety surface, but do not bound its reasoning path.

## Cross-references
- `ins_build-for-model-six-months-out` — the temporal reason this works
- `ins_agents-as-team-not-tools` — Claire Vo's complement: minimal scope per agent + room to reason
- `ins_progressive-trust-onboarding` — where guardrails do belong
