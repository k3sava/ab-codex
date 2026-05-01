---
id: ins_benevolent-dictator-not-committee
operator: Hamel Husain & Shreya Shankar
operator_role: Independent ML consultant and Berkeley PhD researcher
source_url: https://www.lennysnewsletter.com/podcast
source_type: podcast
source_title: Evals as error analysis, the benevolent dictator, LLM judges
source_date: 2026-04-28
captured_date: 2026-05-01
domain: [ai-native, leadership, product]
lifecycle: [hiring-team-design, ai-workflow]
maturity: applied
artifact_class: framework
score: { originality: 4, specificity: 4, evidence: 3, transferability: 5, source: 5 }
tier: B
related: [ins_open-coding-then-axial-coding]
raw_ref: raw/podcasts/hamel-husain-shreya-shankar--evals-error-analysis--2026-04-28.md
---

# Appoint one trusted-taste expert as the eval benevolent dictator — committees stall the loop

## Claim
For LLM eval work, appoint a single person whose taste the team trusts as the benevolent dictator on what counts as a failure. A committee bogged down debating the rubric never ships an eval; one trusted taste arbiter ships and the rubric tightens through use.

## Mechanism
Open coding is judgment work. A committee needs consensus on the definition of "wrong" before any traces get coded, and that conversation rarely converges before the team loses momentum. A single arbiter encodes a coherent taste and writes it down. The rubric then evolves through actual reviews, not through abstract debate. Domain experts — often the product manager — make the best arbiters because they hold both the user perspective and the product reality.

## Conditions
Holds when:
- The arbiter has both domain expertise and team trust.
- The team accepts that the rubric will drift, intentionally, as more traces are reviewed.
- The arbiter is willing to be visibly wrong sometimes and revise.

Fails when:
- The arbiter has authority but not taste (political appointment).
- The team cannot live with one person's judgment and re-litigates every call.
- Multiple stakeholders have legitimate but incompatible quality bars (competing customers, regulators).

## Evidence
> "When you're doing this open coding, a lot of teams get bogged down in having a committee... You can appoint one person whose taste that you trust."

Hamel and Shreya prefer the product manager for the role because PMs hold both user and product context.

— Hamel Husain & Shreya Shankar on Lenny's Podcast, 2026-04-28

## Signals
- Trace reviews ship weekly with one named owner.
- Rubric documents are updated by the arbiter in flight, not in committee meetings.
- The team stops debating the rubric and starts debating specific traces.

## Counter-evidence
For high-stakes regulated domains, single-person arbitration may not be acceptable. Multiple-arbiter calibration (with disagreement tracked and resolved) is the safer path there.

## Cross-references
- `ins_open-coding-then-axial-coding` — the workflow the arbiter runs
- `ins_force-for-positive-momentum` — Claire Hughes Johnson's structurally similar rule for cross-functional decisions
