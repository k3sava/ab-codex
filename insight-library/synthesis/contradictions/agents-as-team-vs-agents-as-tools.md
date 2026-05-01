---
id: con_agents-as-team-vs-tools
title: Agents-as-team vs. agents-as-tools
captured_date: 2026-05-01
---

# Agents-as-team vs. agents-as-tools

## Position A — Agents are a team you manage
- Operator: Claire Vo
- Card: `ins_agents-as-team-not-tools`, `ins_manager-skill-not-technical`, `ins_progressive-trust-onboarding`
- Claim: Don't throw every task at one super-agent. Build one agent per role, each with its own context window, identity, and tool scope, and manage them like teammates. The unlock is management skill, not technical skill.

## Position B — Agents are tools you give a goal and stay out of
- Operator: Boris Cherny
- Card: `ins_dont-box-the-model-in`, `ins_underfund-deliberately`
- Claim: Give the model tools and a goal; do not hard-code the workflow. The right move is restraint: less scaffolding, less workflow, more abstraction. Underfund teams so substrate absorbs work; don't manage agents as headcount.

## Conditions distinguishing them
- **Loop type**: Vo runs a 9-agent CPO operating loop where each agent has a specialised JTBD (writes PRDs, reviews dashboards, briefs stakeholders). Cherny is building a coding agent (Claude Code) where the user's job is one task and the agent figures out execution.
- **Output structure**: Vo's loops produce many heterogeneous artifacts that need consistent identities + tool scopes. Cherny's loops produce one homogeneous artifact (code change) where over-scaffolding limits the model's ability to discover its own path.
- **Trust horizon**: Vo emphasises progressive trust because each agent persists across sessions; Cherny emphasises freedom because the agent is short-lived and goal-bound.

## Resolution / synthesis
Both positions converge on substrate-runs-loop / humans-run-alignment (`pat_substrate-runs-loop-humans-run-alignment`); they diverge on whether the substrate looks like a *team* or a *tool*. The reconcilable rule:
- Heterogeneous, persistent JTBD → agents-as-team (Vo): named identities, scoped contexts, progressive trust.
- Homogeneous, ephemeral, goal-bound tasks → agents-as-tools (Cherny): minimal scaffolding, give the goal, stay out.

This is genuinely orthogonal — same operator could deploy both shapes for different problems. The contradiction reveals a missing taxonomy axis: persistence + heterogeneity of the agent's job determines which shape applies.
