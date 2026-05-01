---
id: pat_eval-as-data-analysis
title: Evals are data analysis — single judge, binary rubrics, error analysis first
captured_date: 2026-05-01
convergence_count: 3
tier: A
uses_cards: [ins_evals-are-data-analysis-on-llm-apps, ins_benevolent-dictator-not-committee, ins_llm-as-judge-binary-not-likert, ins_open-coding-then-axial-coding, ins_100-percent-automation-rule, ins_transparency-in-uncertainty]
domains: [ai-native, engineering, research]
---

# Evals are data analysis — single judge, binary rubrics, error analysis first

## Convergence
Three operators (Hamel/Shreya as a unit, plus Cat Wu and Reganti at the edges) converge on the same eval-shop pattern: evals are systematic data analysis on traces, not test suites. One trusted-taste judge. Binary rubrics, one judge per failure mode. Error analysis before metric-building. Open-coding on traces before automation.

## Operators
- Hamel Husain & Shreya Shankar — `ins_evals-are-data-analysis-on-llm-apps`, `ins_benevolent-dictator-not-committee`, `ins_llm-as-judge-binary-not-likert`, `ins_open-coding-then-axial-coding`. The complete eval methodology: data analysis frame, single judge, binary rubrics, qualitative-first coding.
- Cat Wu — `ins_100-percent-automation-rule`. An automation that works 95% of the time is not an automation — adjacent discipline of binary thresholds.
- Aishwarya Naresh Reganti — `ins_transparency-in-uncertainty`. Show model uncertainty in the UI — the production-side companion of the eval rubric.

## Variation
- Hamel/Shreya provide the *full methodology*.
- Cat Wu provides the *production threshold* (95% isn't automation).
- Reganti provides the *user-facing companion* (uncertainty must reach the UI).
- Convergence: eval is rigorous qualitative-then-quantitative work with a named owner — not a metric dashboard.

## Implication
Stand up an eval shop with one trusted-taste owner. Sample 100+ traces. Open-code first, axial-code second, automate third. Build LLM-as-judge as binary T/F per pesky failure mode. Validate every judge against human labels. Production threshold for automation is 100%, not 95%; everything below is a human-in-loop decision.

## Sources
- ins_evals-are-data-analysis-on-llm-apps — Hamel Husain & Shreya Shankar
- ins_benevolent-dictator-not-committee — Hamel Husain & Shreya Shankar
- ins_llm-as-judge-binary-not-likert — Hamel Husain & Shreya Shankar
- ins_open-coding-then-axial-coding — Hamel Husain & Shreya Shankar
- ins_100-percent-automation-rule — Cat Wu
- ins_transparency-in-uncertainty — Aishwarya Naresh Reganti
