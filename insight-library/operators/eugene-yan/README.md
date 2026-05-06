---
name: Eugene Yan
slug: eugene-yan
roles:
  - Senior Applied Scientist
  - Long-running technical writer at eugeneyan.com on AI/ML systems
  - Frequent collaborator and reference for LLM eval and feedback-loop discussions
domains_active: [ai-native, engineering, research]
captured_first: 2026-05-06
external:
  blog: https://eugeneyan.com/writing/
---

# Eugene Yan

## Bio
Eugene Yan writes about applied AI/ML systems with the practitioner's bias of someone who actually has to keep them running. His through-line is that the cheap step in modern LLM systems is producing output, and the slow step is figuring out which outputs were good and getting the system to do more of them. He spends most of his writing on the operational mechanics that close that loop, transcript capture, evaluator design, rubric calibration, the move from "we have logs" to "the system is improving on its own cadence."

## Operating themes
- **Operating thesis:** the corpus is the gym. Transcripts are the reps. Config promotions are the strength gain.
- **Closing the feedback loop**, transcript review as a routine, not an event.
- **Promotion-as-PR**, improvements ship as reviewable, attributable, reversible config diffs.
- **Eval rubrics**, written from observed transcripts, not from theory.

## Cards
- `ins_mine-transcripts-to-promote-config`, Close the feedback loop by mining session transcripts for patterns to promote into config [Tier A]
- `ins_middle-is-hollowing-out`, The middle of the workflow gets automated; spec-writing and verification stay expensive [Tier A]

## Sources captured
- 2026-05-03, *Closing the feedback loop, mining session transcripts for promotable patterns* (eugeneyan.com)
- 2026-05-03, *Working with AI, five practices that compound* (https://eugeneyan.com/writing/working-with-ai/)
