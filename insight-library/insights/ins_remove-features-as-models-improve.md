---
id: ins_remove-features-as-models-improve
operator: Cat Wu
operator_role: Head of Product, Claude Code + Co-work, Anthropic
source_url: https://www.youtube.com/watch?v=PplmzlgE0kg
source_type: podcast
source_title: How Anthropic's product team moves faster than anyone else — Lenny's Podcast
source_date: 2026-04-27
captured_date: 2026-05-01
domain: [product, ai-native, engineering]
lifecycle: [ai-workflow]
maturity: frontier
artifact_class: workflow
score: { originality: 5, specificity: 4, evidence: 4, transferability: 4, source: 5 }
tier: A
related: [ins_build-products-that-dont-yet-work]
raw_ref: raw/podcasts/cat-wu--anthropic-product-team--2026-04-27.md
---

# When a new model lands, re-read the system prompt and remove crutches

## Claim
Most features in an AI product are crutches for a model weakness. When a new model ships, the disciplined response is to re-read the entire system prompt and remove the sections the new model no longer needs. Counterintuitively, model launches are *deletion* events as much as addition events.

## Mechanism
Scaffolding around a weakness encodes that weakness into the product. A todo-list step that exists because the old model stopped after 5 of 20 sites becomes friction once the new model handles all 20 natively. Leaving the scaffolding in place degrades the experience and trains users to think the AI is dumber than it is. Removing it surfaces the new capability immediately.

## Conditions
Holds when:
- The team has the discipline to audit every prompt and feature against the new model's behavior on launch day.
- The product is exposed to users who will notice the upgrade — not buried in batch jobs.

Fails when:
- The crutch was load-bearing for safety or compliance, not capability. Don't delete safety guardrails on the assumption that the model "got better."
- Backwards compatibility is contractually required. Some users depend on the older shape.

## Evidence
> "A lot of the changes with a new model is removing features that are no longer needed."

The to-do list inside Claude Code was added because Claude would stop after 5 of 20 refactor sites. Opus 4 made the 20-site loop natural; the to-do list is now de-emphasized. Every new model launch, Cat's team re-reads the full system prompt and cuts what is no longer needed.

— Cat Wu on Lenny's Podcast, 2026-04-27

## Signals
- Each model launch's release notes include features removed, not just added.
- The system prompt shrinks over the year, not grows.
- User feedback shifts from "the AI gets stuck on X" to "the AI just does X" — and the corresponding crutch is gone.

## Counter-evidence
Removing a feature breaks workflows that depended on it, even if the model now does the work natively. Sherwin Wu's "models eat your scaffolding for breakfast" is the same shape but cuts both ways: it's a warning to *not over-build* the scaffolding in the first place, and a directive to remove it once obsolete. Aggressive removers without good change communication erode user trust faster than slow removers preserve it.

## Cross-references
- `ins_build-products-that-dont-yet-work` — Cat's complementary directive: build things that *don't* work today so you ship the moment they do
