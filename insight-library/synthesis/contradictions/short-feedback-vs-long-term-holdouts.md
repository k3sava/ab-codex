---
id: con_short-feedback-vs-long-term-holdouts
title: No-such-thing-as-long-feedback-loop vs. one-year holdouts evaporate
captured_date: 2026-05-01
---

# No-such-thing-as-long-feedback-loop vs. one-year holdouts evaporate

## Position A — Find a correlated short signal; there is no such thing as a long feedback loop
- Operator: Annie Duke
- Card: `ins_no-such-thing-as-long-feedback-loop`
- Claim: There is no such thing as a long feedback loop; the operator's job is to find a correlated short-term signal that proxies for the long outcome. Don't wait a year to learn.

## Position B — 30-40% of growth experiments with short-term lift evaporate at one year
- Operator: Archie Abrams (Shopify)
- Card: `ins_long-term-holdouts-30-40-evaporate`
- Claim: When you run long-term holdouts (12-month), 30-40% of experiments with short-term lift turn out to have no incremental value. Short signals systematically over-attribute.

## Conditions distinguishing them
- **Decision type**: Duke addresses *strategic decisions where you cannot afford to wait*. Abrams addresses *growth experiments where the org defaults to optimising the short-term metric*.
- **Risk shape**: Duke's risk is paralysis (waiting for perfect signal). Abrams's risk is over-shipping (declaring victory on a noisy short-term lift that doesn't compound).
- **Mechanism**: Duke says "find a *correlated* signal" — implying validated correlation. Abrams's evidence is that operators *believe* their short-term signal correlates and 30-40% of the time it doesn't.

## Resolution / synthesis
Genuine tension. Duke's prescription (find a short signal) is precisely the move Abrams's data shows fails 30-40% of the time. They cannot both be right *unless* the correlated-short-signal claim is conditioned on validation.

Resolution: Duke is right *if* the correlation is validated against a long-term holdout; Abrams's data shows that most teams skip the validation. The synthesised rule:
1. Find a candidate short signal (Duke).
2. Validate the correlation against a one-year holdout *before* using it to ship decisions (Abrams's evidence).
3. Re-validate quarterly because correlation drifts.

Without step 2, Duke's advice produces Abrams's evaporation. With step 2, the two cards are compatible: short signals work, but only the validated ones, and validation requires a long loop somewhere in the system. The genuine contradiction is whether *most teams* should trust their short-term signals — Duke implicitly yes, Abrams explicitly no.
