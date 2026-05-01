---
id: ins_llms-are-new-os-agents-are-apps
operator: Mark Petty
operator_role: Senior Director Analyst, Gartner
source_url: https://www.gartner.com/en/documents/G00828648
source_type: research
source_title: "LLMs Are the New OS. AI Agents Are the New Apps. And SaaS Just Got Demoted to Infrastructure"
source_date: 2026-02-27
captured_date: 2026-05-02
domain: [ai-native, gtm, product]
lifecycle: [strategy-bets, positioning]
maturity: frontier
artifact_class: framework
score: { originality: 5, specificity: 4, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_software-is-not-a-moat, ins_post-training-as-the-moat, ins_rebuild-gtm-around-ai]
raw_ref: raw/research/gartner--llms-are-the-new-os--2026-04.md
---

# LLM platform is the new OS, agents are the new apps, MCP registries are the new app stores

## Claim
The platform-layer hierarchy is shifting. LLM platforms (Claude, ChatGPT, Gemini) are becoming the OS layer — the surface through which enterprise workflows are conducted. Domain-specific agents are becoming the apps. MCP registries are becoming the app stores. SaaS that depends on a UI is being demoted to back-end infrastructure that the LLM-OS calls.

## Mechanism
Once an LLM is the daily driver for knowledge work, the user no longer goes to twelve different SaaS UIs — they ask the LLM, which calls APIs (often via MCP) on its agents' behalf. The SaaS app stops competing for the user's attention; it competes to be the best-callable infrastructure. UI investments depreciate; API surface, data quality, and agent-friendliness appreciate. Same pattern as Windows demoting MS-DOS apps, iOS demoting feature-phone apps.

## Conditions
Holds when:
- LLM platforms continue to invest in tool-using and multi-step workflows (current trajectory of Anthropic + OpenAI + Google).
- Enterprises adopt LLM-platform clients as default knowledge-work surfaces (already true at the margin).

Fails when:
- LLM platforms hit a regulatory ceiling that forces them back into narrower assistant roles.
- Closed-data enterprises (regulated finance, healthcare) maintain UI-bound workflows because data residency and audit trails forbid LLM-mediated calls.
- A vertical's complexity exceeds what an agent layer can mediate — UI primacy returns where domain depth dominates.

## Evidence
> "Every SaaS product that depends on a user interface is about to become back-end infrastructure."
>
> "Claude, ChatGPT, and Gemini are competing to become the surface through which all enterprise workflows are conducted. The same way Windows became the surface for desktop computing."
>
> "The LLM platform is the new OS. Domain-specific agents are the new apps. MCP registries are the new app stores."
>
> "Anthropic and OpenAI are building operating systems."

— Mark Petty, Gartner (G00828648), 2026-02-27.

## Signals
- Vendor product roadmaps prioritise MCP servers, OpenAPI specs, and agent-friendly auth over UI redesigns.
- Pricing discussions shift from seat-based UI usage toward API/token consumption models.
- Customer references describe their workflow as "I asked Claude…" rather than "I logged into the tool…".
- Analyst categories add "agent-readable" as an evaluation dimension.

## Counter-evidence
The OS analogy under-weights the lock-in counter-pressure: incumbents (Salesforce, Microsoft) are racing to be their own LLM-OS rather than ceding the surface to Anthropic/OpenAI. Whether the OS layer consolidates to 2–3 LLM platforms or fragments across 10+ vertical agents is unsettled. Operators should plan for both shapes. Also, "demoted to infrastructure" still sustains substantial businesses (AWS, Stripe) — the demotion isn't extinction.

## Cross-references
- `ins_software-is-not-a-moat` — Evan Spiegel; software alone doesn't defend the position.
- `ins_post-training-as-the-moat` — Asha Sharma; the data layer is what survives the demotion.
- `ins_rebuild-gtm-around-ai` — Kieran Flanagan; GTM has to follow the platform shift, not bolt onto it.
