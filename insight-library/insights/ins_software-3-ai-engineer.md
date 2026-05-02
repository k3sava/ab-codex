---
id: ins_software-3-ai-engineer
operator: Swyx (Shawn Wang)
operator_role: Founder Latent Space; coined "AI Engineer" as a distinct role
source_url: https://www.latent.space/
source_type: essay
source_title: "Software 3.0 and the AI Engineer landscape"
source_date: 2026-03-03
captured_date: 2026-05-02
domain: [ai-native, engineering]
lifecycle: [hiring-team-design, ai-workflow]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 3, transferability: 4, source: 4 }
tier: B
related: []
raw_ref: raw/artemis/experts/swyx.md
---

# We are in the transition from Software 2.0 to Software 3.0 — AI Engineers will build the majority of new applications

## Claim
We're transitioning from Software 2.0 (ML models replace hand-written logic) to Software 3.0 (LLMs *control* the application's logic flow). AI engineers — not traditional software engineers — will build the majority of new applications. The key new discipline is *agent engineering*: designing systems where LLMs control flow, with deterministic tools as their action space.

## Mechanism
In Software 1.0, engineers wrote explicit logic. In 2.0, ML replaced parts of that logic with learned models. In 3.0, the LLM is the orchestrator — it reads inputs, plans steps, calls deterministic tools, evaluates outputs, retries. The skill set required: prompt engineering, evaluation/observability, tool design, context management, and graceful degradation. These overlap with traditional engineering but center the LLM as the runtime, which is a fundamentally different mental model.

## Conditions
Holds when:
- The application can tolerate non-deterministic LLM-led flow.
- The team can hire/develop AI Engineer skills (a real bottleneck).

Fails when:
- Highly regulated systems where deterministic flow is required by law or compliance.
- Latency-sensitive paths where LLM-orchestration overhead is unacceptable.

## Evidence
> "We are in the transition from Software 2.0 to Software 3.0, where AI engineers — not traditional software engineers — will build the majority of new applications, and the key discipline is agent engineering."

— Swyx (Shawn Wang) (Artemis expert synthesis)

## Signals
- Engineering org has named "AI Engineer" roles, not just engineers using AI tools.
- Codebase includes evals, observability, and tool-design as first-class concerns.
- Hiring rubrics include prompt-engineering and agent-design competencies.

## Counter-evidence
For most enterprise software, traditional deterministic logic still dominates and 3.0 patterns are inappropriate. The "AI Engineer" framing is also still consolidating; some argue it's a temporary specialization that will dissolve back into general engineering as tools mature.

## Cross-references
- ins_pm-as-orchestrator-of-agents — adjacent operator (Lenny Rachitsky)
