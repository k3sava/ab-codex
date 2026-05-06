---
id: ins_traces-need-feedback-to-learn
operator: Harrison Chase
operator_role: Co-founder & CEO, LangChain
source_url: https://www.langchain.com/blog/agent-observability-needs-feedback-to-power-learning
source_type: essay
source_title: "Agent observability needs feedback to power learning"
source_date: 2026-05-05
captured_date: 2026-05-06
domain: [ai-native, engineering, research]
lifecycle: [ai-workflow, measurement-experimentation, llm-evals]
maturity: applied
artifact_class: framework
score: { originality: 4, specificity: 5, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_mine-transcripts-to-promote-config, ins_llm-wiki-pattern]
raw_ref: 
---

# A trace alone teaches nothing; learning requires feedback attached to the trace

## Claim
Agent observability infrastructure that captures traces without attaching feedback to them is not a learning system. A trace records what happened; it does not record whether what happened was good. Without a feedback signal bound to each trace, every run is undifferentiated data — there is no gradient to learn from, no way to promote successful patterns into config, no way to demote regressions. Trace + feedback together is the minimum learning unit; either one alone is logging.

## Mechanism
Learning is differential: you need to compare runs that worked against runs that didn't, then change the system to produce more of the first kind. A trace gives you the run record, but not the label. Labels can come from explicit user feedback (thumbs / verdicts / replies), implicit feedback (downstream task completion, retention), or evaluator runs (LLM-as-judge against a rubric). All of those have to be attached to the specific trace they describe — otherwise you're rolling up averages across heterogeneous behaviour and losing the signal in aggregation. Most agent stacks ship the trace half cleanly (OTel-style spans, full I/O capture) and leave the feedback half as an afterthought, which is why so many production agents have rich logs and zero compounding improvement.

## Conditions
Holds when:
- The agent runs frequently enough that a feedback corpus accrues.
- There is a meaningful signal of "good vs not good" available (human reply, downstream metric, evaluator).
- The team is willing to wire the feedback path into the same store as the trace, not a parallel one.

Fails when:
- Runs are one-shot and unrepeated (no learning loop to close).
- The signal is too noisy or too delayed to attach reliably to a specific trace.
- The team treats feedback as a product feature only ("collect ratings") and not as a learning input.

## Evidence
> "A trace tells you what happened. It does not, by itself, tell you whether what happened was good. To learn from traces, you need feedback attached to them."
— Harrison Chase, LangChain blog, 2026-05-05.

The same week, Eugene Yan reached the same conclusion from the opposite direction — see `ins_mine-transcripts-to-promote-config`. Independent convergence from a frameworks operator and an evals operator on the same gap is itself a signal that the gap is structural, not stylistic.

## Signals
- Every trace in the store has a feedback row joined to it (verdict, evaluator score, user reply, or null with a reason).
- Promotion / demotion of prompts and tools to "stable" is gated on aggregate feedback, not run count.
- Drift detection alarms compare current feedback distribution to a known-good window, not just trace volume.

## Counter-evidence
- For deterministic, well-tested code paths inside an agent, traces alone can be adequate (tests already encode the "good" labels).
- Some teams successfully bootstrap with evaluator-only feedback and never collect explicit user signal; that works at small scale but typically calibrates poorly to user-perceived quality once the agent is in real production.

## Cross-references
- `ins_mine-transcripts-to-promote-config` — Eugene Yan's same-week framing of the same gap from the evals side.
- `ins_llm-wiki-pattern` — Karpathy's wiki pattern is one place where promoted patterns can land permanently.
