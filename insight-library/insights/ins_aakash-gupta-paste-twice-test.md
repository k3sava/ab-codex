---
id: ins_aakash-gupta-paste-twice-test
operator: Aakash Gupta
operator_role: Product growth advisor and AI tools practitioner
co_operators: []
source_url: "https://www.aibyaakash.com/p/claude-skills-7-laws"
source_type: essay
source_title: "Claude Skills: 7 Laws"
source_date: 2026-05-12
captured_date: 2026-05-15
domain: [ai-tools, workflow, pmm]
lifecycle: [enablement]
maturity: applied
artifact_class: playbook
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 4 }
tier: B
related: [ins_bottleneck-is-context-not-capability, ins_dotclaude-as-deployable-artifact, ins_anthropic-skills-as-vertical-distribution-unit]
raw_ref: 
---

# If you would paste the same instructions twice, that workflow belongs in a skill, not session memory

## Claim
If you would paste the same instructions twice across sessions, that workflow belongs in a skill. The description field is the routing layer. A vague description means the skill does not trigger when it should.

## Mechanism
Claude Skills are invoked by description match, not by explicit user call. The description is the signal the model uses to determine whether a skill applies to the current context. A vague or generic description leaves the routing decision to chance. The result: the model produces generic output from the wrong context rather than the specialized output the skill was built for. The paste-twice test is a scope diagnostic: if the same instructions would help across multiple sessions, the value is recurring, and recurring instructions belong in a skill with a precise description.

## Conditions
Holds when: the workflow is recurrent across sessions and the instructions are stable enough to codify. Applies to any AI assistant that routes to capabilities via description matching.
Fails when: the workflow is exploratory or one-off. Promoting it to a skill adds overhead without routing benefit.

## Evidence
Gupta's finding after 75 tests of Claude Skills. The primary failure mode across all 75 tests was description quality, not instruction quality.

> The test: if you'd paste the same instructions twice, it belongs in a skill.

Skills with vague descriptions were not triggered at the right moment. Skills with precise, context-specific descriptions triggered reliably.

## Signals
- You find yourself copying the same prompt preamble at the start of multiple sessions
- A skill exists but the model does not invoke it in contexts where it would clearly help
- Output quality varies across sessions for the same type of task

## Counter-evidence
The test applies specifically to Claude's description-matching invocation architecture. Other AI systems with different routing mechanisms (explicit tool calls, user-initiated slash commands) do not have the description-as-routing-layer problem in the same form.

## Cross-references
- [[ins_bottleneck-is-context-not-capability]] — Sherwin Wu: when the agent isn't doing what you want, fix the context, not the model
- [[ins_dotclaude-as-deployable-artifact]] — on treating .claude configurations as deployable artifacts with named owners
- [[ins_anthropic-skills-as-vertical-distribution-unit]] — Anthropic treating skills as the unit of vertical agent distribution
