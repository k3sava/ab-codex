---
id: ins_taleb-iatrogenics
operator: Nassim Nicholas Taleb
operator_role: Risk theorist; former options trader; author Fooled by Randomness, Black Swan, Antifragile, Skin in the Game
source_url: https://www.fooledbyrandomness.com/
source_type: book
source_title: "Antifragile — Iatrogenics"
source_date: 2012-11-27
captured_date: 2026-05-05
domain: [product, engineering, leadership]
lifecycle: [risk-quality, productisation, change-management]
maturity: foundational
artifact_class: framework
score: { originality: 4, specificity: 5, evidence: 5, transferability: 5, source: 5 }
tier: A
related: [ins_taleb-via-negativa, ins_antifragile-barbell, ins_taleb-skin-in-the-game]
raw_ref: raw/expert-content/experts/nassim-taleb.md
---

# Iatrogenics — when the intervention causes more harm than the disease — most "fixes" in complex systems are net-negative

## Claim
Iatrogenics is harm caused by the healer — intervention that causes more damage than doing nothing. In medicine, in policy, in product, and in management, intervention is often net-negative because complex systems have side effects, cascading failures, and hidden dependencies that the intervener does not see. The default move in poorly-understood systems should be inaction, not aggressive correction.

## Mechanism
A complex system has many interacting components, most of which the intervener does not understand. Any change introduces second-order effects (changes in other components reacting to the changed one) and third-order effects (interactions between the second-order changes). The intervener typically optimises for the first-order effect they can see, while the second- and third-order effects often produce harm that exceeds the benefit. Iatrogenics is the structural reason that "wait and observe" beats "do something" in many complex situations — the something usually does more than intended, and the unintended part is usually worse than the intended part.

## Conditions
Holds when:
- The system is poorly understood and complex (most large software systems, most organisational dynamics, most market behaviour).
- The intervention is aggressive (large feature rewrite, org restructure, sweeping policy change).
- The "problem" being solved is self-limiting or has unclear root cause — intervening on a symptom often introduces a new disease.

Fails when:
- The problem is simple and well-understood (a broken bone needs setting; a clear bug needs a clear fix).
- Inaction would lead to certain catastrophe (security incident, regulatory violation, irreversible customer loss).
- The intervention is small, reversible, and bounded — the iatrogenic risk is proportional to the intervention size.

## Evidence
> "Iatrogenics is Taleb's term for harm caused by the healer: intervention that causes more damage than doing nothing."

— see `raw/expert-content/experts/nassim-taleb.md` line 18.

## Signals
- Engineering reviews include "what is the smallest possible intervention?" alongside "what is the right fix?" — and prefer the smaller version unless evidence forces otherwise.
- Org-design changes include explicit hypotheses about second-order effects, and post-mortems track whether those hypotheses held.
- Product roadmap rejects "improvements" that lack a measurable problem signal — defaulting to inaction on speculative fixes.

## Counter-evidence
Iatrogenic caution can become an excuse for organisational inertia. Companies that wait too long to intervene on real problems suffer different failure modes (declining metrics, accumulated tech debt, eroded customer trust). The discipline is matching intervention size to confidence: small interventions are often safe even under uncertainty; large interventions need correspondingly large confidence in the diagnosis.

## Cross-references
- `ins_taleb-via-negativa` — via negativa is the default safe move when iatrogenics is the risk; remove rather than add.
- `ins_antifragile-barbell` — barbell allocation is structural protection against iatrogenic intervention in the middle of the risk spectrum.
- `ins_taleb-skin-in-the-game` — skin-in-the-game forces interveners to internalise iatrogenic costs they would otherwise externalise.
