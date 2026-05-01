---
id: ins_agents-are-the-new-product-user
operator: Elena Verna
operator_role: Growth advisor; ex-CMO Lenny's Newsletter, ex-SurveyMonkey, ex-Miro
source_url: https://www.elenaverna.com/p/your-product-has-a-new-user-its-not
source_type: essay
source_title: Your product has a new user. It's not human.
source_date: 2026-04-26
captured_date: 2026-05-01
domain: [product, ai-native, gtm]
lifecycle: [product-strategy, positioning]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 3, evidence: 3, transferability: 5, source: 5 }
tier: A
related: [ins_pmm-as-infrastructure-not-gate, ins_nlx-is-the-new-ux, ins_software-is-not-a-moat]
raw_ref: raw/essays/elena-verna--agents-are-the-new-user--2026-04-26.md
---

# Agents are first-class product users; design for output reliability, not navigation

## Claim
AI agents speaking MCP (or equivalent protocols) are now first-class product users who consume product output without ever touching the UI; the product surface to optimize is reliable, fast, format-correct output — not onboarding flow or navigation.

## Mechanism
A human user values UX affordances (onboarding, progressive disclosure, navigation) because the human pays attention costs to learn the product. An agent pays no attention cost but has zero tolerance for ambiguity, slowness, or malformed output. The agent path traverses APIs, MCP endpoints, structured outputs — surfaces most product teams treat as plumbing, not product. As agents do more buying-side work, products that defend the human path while neglecting the agent path get reproduced and bypassed.

## Conditions
Holds when:
- The product has functionality that can be called programmatically (state, transactions, data, content).
- Buyers' workflows are starting to involve agents (research, vendor selection, procurement, ops).
- The product team has the engineering capacity to expose and maintain agent endpoints.

Fails when:
- The product is fundamentally human-experiential (creative tools where the human IS the loop).
- Agent traffic is still negligible and the team rationally prioritizes human UX.
- Exposing core functionality programmatically commoditizes the product before the team has a defensible moat (the API replaces the product).

## Evidence
> "Agents don't care about onboarding. They don't care about your navigation. They care about whether your product returns the right output, quickly, reliably, and in a format they can use."

> "If an agent can reproduce your core functionality without ever touching your product, what exactly are you defending?"

— Elena Verna, https://www.elenaverna.com/p/your-product-has-a-new-user-its-not, 2026-04-26

## Signals
- Product roadmap has an explicit agent-readiness lane (MCP endpoints, structured output, latency budgets for programmatic calls).
- Audit scores every owned surface on output quality and bypassability.
- Agent traffic is reported as a separate cohort with its own funnel.

## Counter-evidence
Some product categories have moats that depend on the human experience itself (community, brand, taste). For those, agent-readiness investment may be premature or actively dilutive. Aparna Chennapragada's NLX-is-the-new-UX (`ins_nlx-is-the-new-ux`) is a parallel claim from the human-conversation side, suggesting both surfaces matter and the right architecture is dual-surface, not agent-only.

## Cross-references
- `ins_pmm-as-infrastructure-not-gate` — Verna's GTM-side parallel.
- `ins_nlx-is-the-new-ux` — the human-conversation surface that complements agent surfaces.
- `ins_software-is-not-a-moat` — why the moat isn't the software but the durable asset around it.
