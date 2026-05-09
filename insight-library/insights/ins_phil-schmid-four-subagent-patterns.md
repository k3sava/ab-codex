---
id: ins_phil-schmid-four-subagent-patterns
operator: Phil Schmid
operator_role: ML engineer and agentic systems practitioner
co_operators: []
source_url: "https://www.philschmid.de/subagent-patterns-2026"
source_type: essay
source_title: Subagent Patterns 2026
source_date: 2026-05-05
captured_date: 2026-05-09
domain: [ai-ops, product]
lifecycle: [product-development]
maturity: frontier
artifact_class: framework
score: { originality: 3, specificity: 4, evidence: 3, transferability: 4, source: 3 }
tier: B
related: [ins_three-class-agent-taxonomy, ins_agents-as-team-not-tools, ins_kyle-poyar-continuous-monitoring-agents]
raw_ref: 
---

# Four subagent patterns are settling as standard: Inline Tool, Fan-Out, Agent Pool, and Teams. Each adds control surface at a real debugging cost.

## Claim
Four subagent patterns are settling as standard for agentic architectures: Inline Tool, Fan-Out, Agent Pool, and Teams. Each adds control surface and debugging surface at a real cost. The trade is not a free upgrade.

## Mechanism
Inline Tool: a single sequential agent calls tools in order. Simple to trace, slow for independent tasks. Fan-Out: a coordinator dispatches parallel subtasks to specialist agents and merges results. Faster for independent work, but merge logic and error propagation require explicit design. Agent Pool: persistent workers pick tasks from a queue, enabling load balancing. Adds queue-management complexity. Teams: specialized agents coordinate with each other via routing and context-passing logic. Highest control surface, highest debugging surface.

## Conditions
Holds when: The task has independent subtasks (Fan-Out), persistent workload (Pool), or requires specialized coordination (Teams). Inline Tool is right when tasks are sequential and debugging simplicity matters more than throughput.
Fails when: Fan-Out is chosen for dependent tasks where merge logic cannot be cleanly defined. Teams patterns are adopted before simpler patterns have been exhausted.

## Evidence
Phil Schmid's analysis of production agentic systems, published May 5, 2026, drawing on patterns observed across deployed LLM applications.

## Signals
- Fan-Out patterns show 3-5x throughput improvement on independent subtasks vs Inline when tasks are truly parallelizable
- Debugging time rises with each pattern layer; trace IDs and error budgets become required infrastructure
- Agent Pool patterns stabilize when task arrival rate exceeds single-agent processing capacity

## Counter-evidence
Pattern taxonomy is descriptive, not prescriptive. Real systems often mix patterns within a single workflow. Overhead of more complex patterns can exceed benefit for infrequent or short-duration tasks. Patterns are still evolving.

## Cross-references
- `ins_three-class-agent-taxonomy`: complementary taxonomy of agent types
- `ins_agents-as-team-not-tools`: Teams framing from the GTM application side
- `ins_kyle-poyar-continuous-monitoring-agents`: continuous monitoring is Fan-Out applied to GTM signal processing
