---
id: ins_anthropic-claude-code-subagents-haiku-routing
operator: Anthropic
operator_role: AI research and deployment company
co_operators: []
source_url: "https://code.claude.com/docs/en/sub-agents"
source_type: research
source_title: "Claude Code: Sub-agents"
source_date: 2026-05-13
captured_date: 2026-05-13
domain: [ai-native, product]
lifecycle: [build]
maturity: applied
artifact_class: workflow
score: { originality: 3, specificity: 5, evidence: 5, transferability: 5, source: 5 }
tier: B
related: [ins_anthropic-routines-cloud-agent-tasks, ins_anthropic-skills-as-vertical-distribution-unit]
raw_ref: 
---

# Claude Code subagents run in isolated context windows with model routing, enabling cost-optimized bulk delegation without polluting the orchestrator session

## Claim
Claude Code subagents are markdown files with YAML frontmatter declaring name, description, tools, and model. Each runs in its own context window, inherits parent permissions, and cannot spawn nested subagents. Haiku is explicitly supported for cost routing.

## Mechanism
Context isolation means the orchestrator session does not absorb the raw output of bulk reads or expensive sub-tasks. The subagent returns structured results. The parent session sees only the summary. The model declaration in frontmatter lets you route cheap, mechanical work to Haiku and keep the orchestrator on Sonnet or higher.

## Conditions
Holds when: You have discrete, bounded sub-tasks (bulk file reads, formatting passes, signal extraction) that do not need the full orchestrator context.
Fails when: The sub-task requires judgment that depends on the broader session context. Isolation is the feature and the constraint simultaneously. Nested subagent spawning is not supported.

## Evidence
From the official Claude Code documentation:

> "Control costs by routing tasks to faster, cheaper models like Haiku."

File format: markdown at `~/.claude/agents/<name>.md` (user scope) or `.claude/agents/<name>.md` (project scope). Each subagent runs in its own context window, inheriting parent permissions.

## Signals
- Main session token counts drop after delegating bulk reads to a Haiku subagent
- Structured JSON summaries from subagents contain equivalent signal density to raw reads at a fraction of the cost
- Context window health improves across multi-step analysis runs

## Counter-evidence
Subagents cannot spawn nested subagents. For deeply recursive workflows, the architecture does not scale without flattening the task graph first. The context isolation that reduces cost also prevents subagents from using session history.
