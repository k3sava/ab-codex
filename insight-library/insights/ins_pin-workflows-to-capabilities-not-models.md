---
id: ins_pin-workflows-to-capabilities-not-models
operator: Ethan Mollick
operator_role: Professor, Wharton; author of Co-Intelligence
source_url: https://www.oneusefulthing.org/p/sign-of-the-future-gpt-55
source_type: essay
source_title: Sign of the Future — GPT-5.5
source_date: 2026-04-23
captured_date: 2026-05-02
domain: [ai-native, strategy]
lifecycle: [ai-workflow, strategy-bets]
maturity: applied
artifact_class: framework
score: { originality: 3, specificity: 3, evidence: 3, transferability: 5, source: 4 }
tier: B
related: []
raw_ref: 
---

# Pin workflows to capabilities you re-baseline quarterly, not to a model snapshot

## Claim
Model progress is not tapering; every few months something previously impossible becomes easy, and the size of the leaps grows. The operating implication for any AI-native flywheel commitment: pin workflows to capability classes you can re-baseline each quarter, not to one model snapshot.

## Mechanism
Workflows hardcoded to a specific model version inherit that model's failure modes and miss the gains of the next release. Capability-pinned workflows (e.g. "long-context summarization at quality X") survive model swaps and benefit from each upgrade.

## Conditions
Holds when: the team has a quarterly cadence to re-evaluate model choice per workflow.
Fails when: a workflow depends on a model-specific quirk that capability framing doesn't capture (rare).

## Evidence
> "Every few months a new model arrives... something that was impossible becomes easy, while the size of the leaps grows each new release cycle."
— Ethan Mollick, One Useful Thing, 2026-04-23

## Signals
- Workflow specs name capability requirements, not model IDs.
- Quarterly model bake-offs run as a standing scheduler task.
- Long-form fiction or other rough-edge tasks flagged with explicit caveats per release.

## Counter-evidence
For regulated or audited workflows, model-pinning is required for reproducibility — capability framing can't override compliance.

## Cross-references
- (none in current corpus)
