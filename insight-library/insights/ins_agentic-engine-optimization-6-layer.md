---
id: ins_agentic-engine-optimization-6-layer
operator: Addy Osmani
operator_role: Engineering lead at Google Chrome; web platform writer
source_url: https://addyosmani.com/blog/agentic-engine-optimization/
source_type: essay
source_title: "Agentic Engine Optimization"
source_date: 2026-05-01
captured_date: 2026-05-06
domain: [ai-native, engineering, growth, design]
lifecycle: [content-strategy, ai-workflow, growth-loops]
maturity: applied
artifact_class: framework
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 4 }
tier: A
related: [ins_agents-are-the-new-product-user, ins_aeo-is-gtm-capability, ins_aeo-competes-for-mentions-not-rankings, ins_rich-context-beats-sophisticated-agents]
raw_ref: 
---

# Agent-first content has six platform layers — access, discovery, capability, format, token, UX bridge

## Claim
Agents now read your site in fundamentally different patterns than humans, and the platform-level moves that serve them are concrete and stackable: (1) access control via robots.txt + an `agent-permissions.json` declaration, (2) discovery via `llms.txt`, (3) capability signaling with explicit "this product does X with Y" statements, (4) content formatting that puts the answer first inside a 200-token TL;DR, (5) token surfacing so a single page doesn't blow an agent's context window, and (6) a UX bridge like a "Copy as Markdown" button so a human can easily hand the page to their agent. Treating these as a six-layer stack — and shipping each layer deliberately — converts an agent-illegible site into one agents can use, cite, and recommend.

## Mechanism
A web page produced for human readers fails an agent on multiple axes at once. Agents fetch in 1-2 HTTP requests where humans browse for minutes; analytics built for humans don't see the agent traffic at all; a 193,000-token page silently gets truncated by the agent's context window. None of that is fixed by writing better headlines. Each of the six layers is a different mechanism: access controls so the right agents in (and the wrong ones out), discovery so the agent knows what to read, capability declarations so the agent can match the page to a query, formatting so the answer is reachable in the first 200 tokens, token discipline so the page fits, UX bridge so humans-with-agents have a clean handoff. They compound — none alone produces the lift, but together they convert a site from agent-hostile to agent-friendly.

## Conditions
Holds when:
- The site is reasonably content-driven (docs, help center, integration pages, comparison pages).
- The team has authority to ship platform-level changes (robots.txt, schema, page templates).
- The audience has measurable agent traffic or is in a category where agents are imminent.

Fails when:
- The site is genuinely brand-only with no informational role for agents to fulfill.
- The org's CMS / publishing constraints prevent shipping per-page TL;DRs at scale.
- The work gets cargo-culted (every layer half-built, none working) — partial implementation often performs worse than not bothering.

## Evidence
The source piece names each layer with concrete syntax — `agent-permissions.json` example, `llms.txt` discovery, the 200-token TL;DR pattern, the 193,000-token page case where context windows get exceeded. The 6-layer stack is the explicit organising frame.

— Addy Osmani, *Agentic Engine Optimization*, https://addyosmani.com/blog/agentic-engine-optimization/, 2026-05-01.

## Signals
- An `llms.txt` exists at the site root and is kept current.
- Top-tier integration / comparison pages start with a 200-token answer-first TL;DR before any narrative.
- A "Copy as Markdown" button exists on the highest-intent pages.
- Page tokenisation is a measurable property of the publishing pipeline (CI flags any page over a threshold).

## Counter-evidence
- The agent ecosystem isn't standardised yet. `llms.txt` adoption is still under 11% of indexed domains as of mid-2026, and OpenAI/Anthropic/Google have not formally confirmed they act on it. Some of the six layers will turn out to be premature.
- For brand-only marketing pages where the goal is human emotional response, optimising for agent legibility can flatten the experience for the human reader. Treat agent-first content audits as a top-of-funnel / docs / help-center concern, not a brand-page concern.

## Cross-references
- `ins_agents-are-the-new-product-user` — Verna's parallel framing from the PLG side; same converging structural shift.
- `ins_aeo-is-gtm-capability` — Maja Voje's framing of why this work belongs to PMM, not SEO.
- `ins_rich-context-beats-sophisticated-agents` — same author's (Voje) point about what makes agents perform: context. AEO content is one input.
