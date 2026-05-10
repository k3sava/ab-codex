---
id: ins_anthropic-routines-cloud-agent-tasks
operator: Anthropic
operator_role: AI safety company and model developer
co_operators: []
source_url: "https://9to5mac.com/2026/04/14/anthropic-adds-repeatable-routines-feature-to-claude-code-heres-how-it-works/"
source_type: post
source_title: Anthropic adds repeatable Routines feature to Claude Code
source_date: 2026-04-14
captured_date: 2026-05-10
domain: [ai-gtm, developer-tools, product]
lifecycle: [product-development, automation]
maturity: frontier
artifact_class: workflow
score: { originality: 4, specificity: 4, evidence: 3, transferability: 3, source: 3 }
tier: B
related: [ins_dreaming-cross-session-memory-curation, ins_outcomes-grader-agent-evaluation, ins_dotclaude-as-deployable-artifact]
raw_ref: 
---

# Claude Code Routines separates cloud-hosted scheduled agent tasks from local compute, enabling event-triggered agent work on Anthropic's servers without the user's machine being online.

## Claim
AnthropicRSQUO's Routines feature gives Claude Code a cloud-hosted execution layer for saved agent tasks. A Routine packages a prompt, connected repos, and tools into a callable unit triggered by schedule, API call, or GitHub webhook. The task runs on Anthropic's infrastructure regardless of the user's device state, creating a clean boundary between cloud-hosted and local agent execution.

## Mechanism
Local automation depends on the machine being available and authenticated. Cloud-hosted agent tasks remove that dependency. The agent inherits the same capabilities as an interactive session (file read/write within connected repos, tool calls) but executes asynchronously on managed infrastructure. Two distinct use patterns emerge: local execution for work requiring private filesystem access or credentials that cannot be stored externally, and Routines for pure-model tasks where cloud execution is appropriate. The architecture separates compute residency from task authorship.

## Conditions
Holds when: the agent task does not require access to private local files, local databases, or credentials that cannot be safely stored in Anthropic's managed infrastructure.
Fails when: the task needs to read from a local database, access a credential store reachable only from the local network, or interact with services not accessible from Anthropic's servers.

## Evidence
9to5Mac coverage of the April 2026 launch. Plan quotas: Pro users get 5 Routines per day, Max 15, Team and Enterprise 25.

## Signals
- Teams stop building local cron wrappers around Claude tasks
- GitHub webhooks trigger automated code review or documentation passes without human initiation
- Routine quota becomes a plan-selection criterion alongside API credits
- Agent tasks complete overnight without a machine being left on

## Counter-evidence
Cloud execution introduces latency and daily quota limits absent from local cron. Teams with high-frequency tasks, strict data-residency requirements, or tasks requiring private filesystem access may prefer local execution regardless of Routines availability. The 5-per-day limit on Pro plans is restrictive for production use cases. Quota is currently the binding constraint, not capability.

## Cross-references
- ins_dreaming-cross-session-memory-curation, Anthropic
- ins_outcomes-grader-agent-evaluation, Anthropic
- ins_dotclaude-as-deployable-artifact
