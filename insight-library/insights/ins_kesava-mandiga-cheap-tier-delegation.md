---
id: ins_kesava-mandiga-cheap-tier-delegation
title: 'Cheap external model for grunt work; Claude only sees judgment'
operator: Kesava Mandiga
operator_role: 'Founder, [unnamed]'
source_url: https://www.linkedin.com/in/k3sava/
source_type: thread
source_title: 'Kesava on cheap-tier delegation as routing pattern'
source_date: 2026-05-03
captured_date: 2026-05-03
domain: [ai-native, engineering]
lifecycle: [routing, cost-quality]
maturity: applied
artifact_class: pattern
score: { originality: 5, specificity: 5, evidence: 4, transferability: 5, source: 4 }
tier: A
related: [ins_kesava-mandiga-workflow-collapse-not-speedup]
raw_ref: ../delegation/README.md
---

# Cheap external model for grunt work; Claude only sees judgment

## Claim

Claude Code's weekly limit is the constraint. The fix isn't a smaller Claude, Haiku still hits the same meter. The fix is a different provider for the dumb-pipe work. DeepSeek V4 Flash reads files, summarizes transcripts, generates boilerplate at $0.001 a call against a separate balance, and Claude only spends its limited tokens on the things that need judgment. Subagents don't help. Bash-shell-out to a non-Anthropic API does.

## Mechanism

The two limits (token budget and weekly cap) are coupled today because everything routes through Anthropic. Decoupling them via an external dumb-pipe is the only architecture that touches the cap. Once decoupled, Opus-as-orchestrator becomes worthwhile because Opus stops being spent on grunt.
