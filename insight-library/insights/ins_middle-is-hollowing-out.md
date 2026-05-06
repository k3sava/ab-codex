---
id: ins_middle-is-hollowing-out
operator: Eugene Yan
operator_role: Senior Applied Scientist; writes at eugeneyan.com on AI/ML systems
source_url: https://eugeneyan.com/writing/working-with-ai/
source_type: essay
source_title: "Working with AI — five practices that compound"
source_date: 2026-05-03
captured_date: 2026-05-06
domain: [ai-native, engineering, leadership, research]
lifecycle: [ai-workflow, decision-making]
maturity: frontier
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 4, transferability: 5, source: 5 }
tier: A
related: [ins_judgment-doesnt-compress, ins_judgment-vs-understanding, ins_traces-need-feedback-to-learn, ins_mine-transcripts-to-promote-config]
raw_ref: 
---

# The middle is hollowing out — execution gets automated, leaving spec-writing and verification as the high-value human tasks

## Claim
The structural shift across software, marketing, and analytic work is that the *middle* of the workflow — the stretch between "we have a clean spec" and "the work is verified done" — is what AI is automating. The two endpoints are not. Spec-writing (knowing the right thing to do, and stating it cleanly) and verification (calibrating whether the output is actually right) remain expensive, judgement-loaded human work. Operators who keep training and headcount on the middle layer are optimising the part of the pipeline that's about to compress to near-zero; operators who reallocate to the endpoints get the AI leverage.

## Mechanism
Two ends of a workflow stay expensive for different reasons. The spec end is expensive because it requires context the model can't see — what does this team actually need, what political constraints exist, what's the implicit standard, what does "done" mean for *this* customer. The verification end is expensive because the cost of being wrong is asymmetric — a model can produce confidently wrong output at near-zero cost, but the cost of acting on it can be enormous. The middle — translating spec to output — is where the model's capability lands cleanly: it can read the spec, generate the output, iterate on critique. So the curve flattens in the middle and stays steep at both ends. Teams keep paying for the flat middle out of habit; the leverage move is to pay more for the steep ends.

## Conditions
Holds when:
- The work has a meaningful judgement load at either end (most knowledge work).
- The team has the discipline to actually move humans off middle-layer execution and into spec / verification roles.
- The org's pricing or hiring isn't structurally locked to "people doing the middle."

Fails when:
- The middle is itself the value (some craft work, some highly customised tasks where the doing IS the judgement).
- The endpoints are also automatable in this category (commodity content, simple classification — the whole pipeline collapses).
- The org's distinction between spec/middle/verification is unclear and humans end up doing all three at lower quality each.

## Evidence
> "Execution gets automated, leaving spec-writing and verification as the high-value human tasks."
— Eugene Yan, paraphrasing the structural diagnosis in his five-practices essay, 2026-05-03 (https://eugeneyan.com/writing/working-with-ai/).

The same week Karpathy independently framed it as "automate what you can verify" (Sequoia Ascent, Apr 30) and Indig as "judgement is the part that doesn't compress" (Growth Memo, May 4). Three operators, three lanes, same call.

## Signals
- The team's work is described in terms of spec / middle / verification, not "tasks."
- Hiring plans fund spec roles (PMM, principal IC, senior strategist) and verification roles (reviewer, evaluator, gate-holder) as primary categories — not as overhead on top of executor headcount.
- Performance reviews evaluate spec quality and verification calibration, not throughput.

## Counter-evidence
- Some workflows have value concentrated in the middle (live performance, real-time customer interaction, anything where the doing is the product). Don't apply the framing to those without thinking.
- Treating "middle" as a single homogeneous layer over-simplifies — the middle of a complex workflow has its own internal structure and human judgement may be load-bearing in pieces of it. Use the frame as a diagnostic, not a religion.

## Cross-references
- `ins_judgment-doesnt-compress` — Indig's parallel framing for marketing / distribution.
- `ins_judgment-vs-understanding` — Karpathy's parallel framing for engineering / research.
- `ins_traces-need-feedback-to-learn` and `ins_mine-transcripts-to-promote-config` — the verification end of the workflow needs trace + feedback to actually compound.
