---
id: pat_context-not-capability
title: Context, not capability, is the bottleneck
captured_date: 2026-05-01
last_updated: 2026-05-10
convergence_count: 8
tier: A
uses_cards: [ins_bottleneck-is-context-not-capability, ins_llm-wiki-pattern, ins_personal-pattern-hoarding, ins_red-green-tdd-shorthand-for-agents, ins_dotclaude-as-deployable-artifact, ins_remove-features-as-models-improve, ins_maja-voje-substrate-first-content-engineering, ins_poyar-voje-context-engineering-gap]
domains: [ai-native, engineering]
---

# Context, not capability, is the bottleneck

## Convergence
When an AI agent fails in production, four operators independently say the same thing: don't change the model, change the context. Codify tribal knowledge into greppable artifacts (wikis, .md, .claude/, shorthand jargon files); the team's quality is gated by how complete and curated this substrate is.

## Operators
- Sherwin Wu (OpenAI), `ins_bottleneck-is-context-not-capability`. The dominant failure mode is missing context; encode tribal knowledge as greppable files.
- Andrej Karpathy, `ins_llm-wiki-pattern`. Replace stateless RAG with a persistent wiki the LLM owns and edits.
- Simon Willison, `ins_personal-pattern-hoarding` and `ins_red-green-tdd-shorthand-for-agents`. Hoard a personal repo of things that worked; encode jargon shorthand once to save tokens forever.
- Pawel Huryn, `ins_dotclaude-as-deployable-artifact`. Treat `.claude/` as a deployable artifact with versioning and rollback.
- Cat Wu, `ins_remove-features-as-models-improve`. The reciprocal: when the model improves, *remove* context that's now redundant.

## Variation
- Sherwin from inside a model lab argues capability isn't the gate.
- Karpathy proposes the architectural shape (wiki vs RAG).
- Willison frames it personally (hoarding) and at the team level (shorthand).
- Huryn productises the artifact (treat .claude/ like code).
- Cat Wu adds the curation discipline (prune as models improve).
- Convergence: the contextDB is a first-class deliverable, not a config file.

## Implication
Your AI quality budget should fund context curation more than it funds model upgrades. Maintain a `.claude/` or equivalent as a deployable artifact: versioned, reviewed, pruned. When agents fail, the first investigation is the context, not the prompt or model. Treat the wiki as the unit of compounding leverage.

## Sources
- ins_bottleneck-is-context-not-capability, Sherwin Wu
- ins_llm-wiki-pattern, Andrej Karpathy
- ins_personal-pattern-hoarding, Simon Willison
- ins_red-green-tdd-shorthand-for-agents, Simon Willison
- ins_dotclaude-as-deployable-artifact, Pawel Huryn
- ins_remove-features-as-models-improve, Cat Wu
