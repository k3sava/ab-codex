---
id: ins_three-class-agent-taxonomy
operator: Hamza Farooq
operator_role: AI engineering practitioner; co-author with Jaya Rajwani in Lenny's Newsletter
source_url: https://www.lennysnewsletter.com/p/not-all-ai-agents-are-created-equal
source_type: essay
source_title: Not All AI Agents Are Created Equal
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [ai-native, product, engineering]
lifecycle: [planning-resourcing, ai-workflow]
maturity: applied
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 3, transferability: 5, source: 4 }
tier: B
related: [ins_agents-as-team-not-tools, ins_jtbd-as-agent-wiring-diagram]
raw_ref: raw/essays/farooq-rajwani--agent-taxonomy--2026-04-28.md
---

# Agents come in three classes — tag each loop or under-resource it

## Claim
"Agent" describes three structurally different systems with order-of-magnitude different build costs — deterministic automation (n8n, Zapier), reasoning-and-acting agents (LangGraph, CrewAI), and multi-agent networks — and treating "agent" as one estimate causes systemic mis-resourcing on roadmaps.

## Mechanism
Deterministic automation has a fixed graph and no model reasoning step; build cost is hours to days. Reasoning-and-acting agents have a model-driven tool loop; build cost is weeks. Multi-agent networks coordinate multiple agents with emergent behavior; build cost is months because coordination, observability, and failure modes compound. A roadmap that treats all three as "build an agent" estimates the deterministic cost and ships nothing on the multi-agent side. Tagging each agent loop with its class lets resourcing match the cost band.

## Conditions
Holds when:
- The team is shipping more than one agent and needs prioritization.
- Build estimates have meaningful business consequences (deadlines, headcount allocation).
- Engineering can distinguish the three classes (or willing to learn).

Fails when:
- The team is shipping one prototype and the taxonomy is overhead.
- The category genuinely fits one class only (e.g., pure deterministic ops automation).
- Class boundaries blur in practice — frameworks like LangGraph allow both reasoning and multi-agent shapes.

## Evidence
> "One agent might take six weeks to build. Another might take six months."

Class breakdown:
1. Deterministic automation (n8n, Zapier) — fixed graph, no reasoning step.
2. Reasoning-and-acting agents (LangGraph, CrewAI) — single agent with a tool loop.
3. Multi-agent networks — multiple agents coordinating, with emergent behavior.

— Hamza Farooq and Jaya Rajwani, https://www.lennysnewsletter.com/p/not-all-ai-agents-are-created-equal, 2026-04-28

## Signals
- Roadmap items have an explicit agent-class tag, and resourcing matches.
- Build estimates separate the three classes rather than averaging.
- Multi-agent networks get longer observability and failure-mode investment than single-agent loops.

## Counter-evidence
The taxonomy is taxonomic and edge cases blur. Some operators argue the three classes overlap so heavily that the distinction is academic; what matters is observable cost per agent over time. The taxonomy is most useful for greenfield planning, less for live-system tuning.

## Cross-references
- `ins_agents-as-team-not-tools` — Claire Vo's operating model lives in the multi-agent class but works through identity discipline.
- `ins_jtbd-as-agent-wiring-diagram` — adjacent: the spec layer that should precede class selection.
