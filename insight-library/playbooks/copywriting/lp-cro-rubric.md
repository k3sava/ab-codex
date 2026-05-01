---
id: pb_lp-cro-rubric
title: Landing-page CRO — 7-section rubric
maintained_by: codex maintainers
captured_date: 2026-05-01
domain: [conversion, copywriting, landing-page]
uses_cards: [ins_homepage-five-second-trinity, ins_pain-solution-proof-interleaved-pitch, ins_friction-as-feature]
originating_operators: [anthony-pierri]
secondary_sources:
  - flywheel/skills/lp-cro/SKILL.md
---

# Landing page CRO rubric playbook

A section-by-section audit of a landing-page draft that produces weighted scores, a prioritized fix list, and a ship/block decision. Use as a gate inside the LP ship workflow — runs after voice enforcement, before any synthetic-audience or live test.

Source synthesis: Peep Laja (Wynter, quantified message testing), Craig Sullivan (CRO audit framework), Joanna Wiebe (above-the-fold copy), Brian Massey (Conversion Sciences rubric), and the ai-marketing-claude `market-landing` 7-point framework.

## When to use

- Any new LP draft before publish.
- Audit of an existing LP with declining CVR.
- Pricing page or comparison page revision.
- Pre-flight on paid-traffic landing pages.

## The 7-section rubric

Each section scored 1–5 with rationale. Weights reflect conversion impact.

| Section | Weight | Scoring focus |
|---|---|---|
| 1. Hero | 25% | Headline clarity, CTA above fold, visual relevance, trust signal visible |
| 2. Value proposition | 20% | Outcome-specific, differentiates from alternatives, matches buyer language |
| 3. Social proof | 15% | Specificity of testimonials, logo trust, review count and recency |
| 4. Objection handling | 15% | Top 3 objections addressed, FAQ quality, pricing transparency |
| 5. CTA clarity | 10% | Button copy outcome-led (not "Submit"), placement, repetition |
| 6. Trust and risk reversal | 10% | Security badges, guarantees, refund policy, privacy commitment |
| 7. Page mechanics | 5% | Load-speed signals, mobile readiness, form-friction count |

## Page-type thresholds

| Page type | Primary goal | Threshold (weighted) |
|---|---|---|
| SaaS trial signup | Free trial start | ≥ 3.8 |
| Demo request | Meeting booked | ≥ 3.5 |
| Lead capture | Email / form submit | ≥ 3.5 |
| Pricing page | Plan selection | ≥ 3.8 (CTA + objection weights doubled) |
| Feature comparison | Alternative displacement | ≥ 4.0 |

## Process

1. Identify page type, or infer from asset content.
2. Score each section 1–5 with rationale.
3. Compute weighted score.
4. Identify the weakest section (lowest weighted contribution).
5. Generate prioritized fix list: top 3 specific changes, highest impact first.
6. Gate: if weighted < threshold, BLOCK with fix list. If hero scores 1 on any dimension, automatic BLOCK regardless of weighted score.
7. Log the audit.

## Output template

```
PASS / BLOCK — weighted score: X.X / 5.0

Section scores:
  Hero              (25%): N/5 — [key finding]
  Value proposition (20%): N/5 — [key finding]
  Social proof      (15%): N/5 — [key finding]
  Objection handling(15%): N/5 — [key finding]
  CTA clarity       (10%): N/5 — [key finding]
  Trust/risk reversal(10%): N/5 — [key finding]
  Page mechanics     (5%): N/5 — [key finding]

Weakest section: [name]
Priority fixes:
1. [Hero fix]
2. [Value-prop fix]
3. [Weakest-section fix]
```

## Gates

- Below page-type threshold → BLOCK. Operator fixes and re-runs.
- "Just approve it" requests → reject. Re-run is an independent read.
- Hero score of 1 on any dimension → automatic BLOCK.

## Composes with

- LP ship workflow (CRO gate, after voice enforce, before synth-audience).
- Preflight composite gate.
- Synthetic-audience panel (buyer-reaction test runs after CRO passes).

## Common failure modes

- Single conversion-rate number with no section attribution.
- Auditor approves the page out of timeline pressure.
- Hero "looks fine" but fails the 5-second test (`ins_homepage-five-second-trinity`).
- Social proof segregated to a single block instead of interleaved (`ins_pain-solution-proof-interleaved-pitch`).
- Generic "Submit" or "Learn more" CTAs.
- Form fields beyond what the conversion event requires.
- Friction missing where it would help users self-qualify (`ins_friction-as-feature`).
