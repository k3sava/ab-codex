---
id: ins_rebaseline-quarterly-not-pin-to-snapshot
operator: Ethan Mollick
operator_role: Professor, Wharton; author of *Co-Intelligence* and One Useful Thing
source_url: https://www.oneusefulthing.org/p/sign-of-the-future-gpt-55
source_type: essay
source_title: Sign of the Future — GPT-5.5
source_date: 2026-04-23
captured_date: 2026-05-01
domain: [ai-native, strategy]
lifecycle: [planning-resourcing, tooling-config]
maturity: applied
artifact_class: framework
score: { originality: 3, specificity: 3, evidence: 3, transferability: 5, source: 5 }
tier: B
related: [ins_build-for-next-model-not-current, ins_remove-features-as-models-improve, ins_dotclaude-as-deployable-artifact]
raw_ref: raw/essays/ethan-mollick--gpt55-leaps-grow--2026-04-23.md
---

# Pin AI workflows to capabilities you can re-baseline quarterly, not to one model snapshot

## Claim
Each new model release moves capabilities discontinuously — what was impossible becomes easy, and the size of leaps grows each cycle — so AI workflows must be pinned to capability targets you re-baseline quarterly, not to one model snapshot whose performance you optimize against.

## Mechanism
A workflow optimized for the current model's exact behavior (its prompt patterns, context-window tricks, output shapes) accumulates dependencies that break when the next model arrives. The next model often makes the workaround unnecessary — the capability is now native — but the workflow has hardened around the workaround. Re-baselining quarterly means: define the capability target (e.g., "produce a credible 15-page strategy doc with primary research"), test it against the current model, then strip workarounds whose justification disappeared. Workflows pinned to capabilities outlive their underlying model snapshots; workflows pinned to a snapshot decay.

## Conditions
Holds when:
- The team uses AI tooling for a sustained workflow (not one-off prompts).
- Model release cadence is fast enough that quarterly re-baselining catches real capability shifts.
- The team has the discipline to strip workarounds rather than accumulate them.

Fails when:
- The workflow has hard regulatory constraints that lock it to one model version.
- Re-baselining cost exceeds the value of capturing each leap.
- The team can't measure capability vs workaround coupling and re-baselines reflexively without removing dead config.

## Evidence
> "Every few months a new model arrives... something that was impossible becomes easy, while the size of the leaps grows each new release cycle."

Honest concession: rough edges remain in long-form fiction generation. The frame applies to capability-led workflow design, not blind upgrade.

— Ethan Mollick, *Sign of the Future: GPT-5.5*, https://www.oneusefulthing.org/p/sign-of-the-future-gpt-55, 2026-04-23

## Signals
- A standing quarterly re-baseline task strips workarounds when their justification disappears.
- Workflow specs name the capability target separately from the model used to deliver it.
- New-model arrivals trigger a structured eval pass, not panic re-tooling.

## Counter-evidence
Frequent re-baselining costs operator time and can destabilize workflows that depend on consistent behavior. For high-stakes regulated workflows, pinning to a known model snapshot is the safer move. The cadence (quarterly) is a default, not a universal.

## Cross-references
- `ins_build-for-next-model-not-current` — Anthropic's parallel framing.
- `ins_remove-features-as-models-improve` — companion: strip the workaround when the model catches up.
- `ins_dotclaude-as-deployable-artifact` — Huryn's config-layer hygiene that makes re-baselining tractable.
