---
title: Hamel Husain & Shreya Shankar — evals as error analysis, the benevolent dictator, LLM judges
type: raw
source: Lenny's Podcast (Dropbox archive)
guest: Hamel Husain (consultant, ex-Github/Airbnb ML) + Shreya Shankar (Berkeley PhD; "Who Validates the Validated?" research)
host: Lenny Rachitsky
captured: 2026-04-28
captured_via: claude-code (sonnet batch)
domain: justcall|personal
attribution: verified
relevance_to_flywheel: Evals are the load-bearing missing skill for the AI Growth lane. Hamel + Shreya's open-coding → axial-coding → LLM-as-judge pipeline is the literal substrate for measuring flywheel output quality, for the JustCall AI agents (Fin parallel), and for the contextDB review loop. Direct external benchmark for the marketing-substrate eval shape.
relevance_tier: HIGH
transcript_file: lenny-dropbox/Hamel Husain & Shreya Shankar.txt
---

# Hamel Husain & Shreya Shankar — evals as the new core skill

## Why this is in the wiki
Evals are the skill that the chief product officers of Anthropic and OpenAI both flagged as the most important new capability for product builders. Hamel + Shreya teach the highest-grossing course on Maven (~2,000 PMs/eng across 500 companies, including OpenAI and Anthropic). The pipeline they describe is directly applicable to: (a) the JustCall flywheel substrate (measuring agent / artifact quality), (b) the AI Growth lane Kesava owns post Q2 reorg, (c) the contextDB promotion boundary, and (d) any clearPMM client deploying AI agents. This is one of the highest-density episodes in the batch.

## Full text source
Transcript at `lenny-dropbox/Hamel Husain & Shreya Shankar.txt`.

## 12 load-bearing insights

1. **Evals = systematic data analysis on your LLM application.** "It really doesn't have to be scary or unapproachable. It really is, at its core, data analytics on your LLM application." Strip the mystique. The reframe matters: what looks like a new AI discipline is just data science on stochastic systems, a technique Andrew Ng was teaching 8 years ago. Direct read for the AI Growth lane: don't build a new evals "discipline" — staff it as marketing data science with LLM-shaped tools.

2. **Start with error analysis, not with tests.** "There's a common trap that a lot of people fall into because they jump straight to the test like, 'Let me write some tests,' and usually that's not what you want to do. You should start with some kind of data analysis to ground what you should even test." Direct mandate for any flywheel iteration: before specifying success metrics, look at 100 traces and write notes. Same shape as the Sourav call-intel work — listen to data, then theorize.

3. **The benevolent dictator: one trusted-taste expert, not a committee.** "When you're doing this open coding, a lot of teams get bogged down in having a committee... You can appoint one person whose taste that you trust." Domain expert preferred; "oftentimes, it is the product manager." Direct read for clearPMM consulting model: the contract structure should put Kesava (or the seat-holder) as the singular taste arbiter, not a co-author. For JustCall flywheel: Aditi as content reviewer = literal benevolent dictator role.

4. **Open coding: just write the first thing wrong, move on.** Sample 100+ traces, write a free-form note on each. "Don't worry about all the errors, just capture the first thing that you see that's wrong, and stop, and move on." Stop only at theoretical saturation (no new categories appearing). Useful operating discipline for any review loop — the iter-batch culture's failure is over-cataloguing per artifact instead of moving fast across artifacts.

5. **An LLM cannot do open coding for you.** "I would bet money... if I put that into ChatGPT and asked, 'Is there an error?' it would say, 'No, did a great job.'" The LLM lacks the product context (e.g., "we don't actually offer virtual tours" — hallucination invisible without domain knowledge). Direct read for substrate design: humans must do the structural-error pass; LLMs can do the categorization pass. Two-stage rule, not one.

6. **Axial coding: LLM categorizes the human notes into clusters.** Open codes (free-form notes) → LLM groups them into axial codes (failure-mode buckets) → human iterates on the categories. Pivot table the counts. "We have gone from chaos to some kind of thinking around, 'Oh, you know what? These are my biggest problems.'" Direct mapping to Kesava's b1/b2/b3 sweep cadence — git-as-ledger entries are the open codes; the AI digest's lane buckets are the axial codes; the weekly synthesis is the pivot table.

7. **LLM-as-judge: one binary judge per pesky failure mode.** Output must be true/false, not 1-7 Likert. "1-2-3-4-5 is a weasel way of not making a decision." Most products end with 4-7 LLM judges total, not dozens — most failures get fixed by prompt edits, not eval scaffolding. Cost-benefit rule: write evals only for the failures that survive prompt fixes. Direct read for the substrate: don't over-eval; eval the pesky drifts (kill-list violations, over-promise, em-dashes), let the prompt handle the rest.

8. **Always align your judge against human labels before trusting it.** "When people lose trust in your evals, they lose trust in you." Build a confusion matrix vs. the human-labeled axial codes. "Agreement %" is misleading on long-tail errors — 90% agreement can hide a judge that always says "pass". Look at the off-diagonal cells. Direct rule for any flywheel quality dashboard: never report a single agreement number; always report the confusion matrix. Aditi-grade content review work depends on this.

9. **Criteria drift is real — you can't write the rubric upfront.** Shreya's "Who Validates the Validated?" research finding: people's opinions of good and bad change as they review more outputs. "You can't ever dream up everything in the first place." Direct implication for clearPMM contract design: the rubric is co-developed with the client during error analysis, not specified at SoW signing. Match the contract structure to this reality (working-session billing, not deliverable billing).

10. **Evals as the new PRD.** Lenny's framing, Hamel + Shreya endorsed: the LLM-as-judge prompt is the most precise product specification you can write. "It's derived from our own data, so of course it's a product manager's expectations." But Shreya's correction matters: the PRD changes as you see data. "You don't really know what you want until you see it with these LLMs." Direct read for substrate-driven PMM work: ship spec → review traces → revise spec, not the other way.

11. **Use evals online, not just in CI.** Sample 1000 production traces daily, run the LLM judge, watch the failure rate in real time. "This is not a unit test, but still now we get an extremely specific measure of application quality." Direct mandate for the flywheel dashboard: production traces from JustCall AI features (Fin equivalents, sales workflows, AI Growth substrate) get sampled and judged daily. Same loop as commons + ledger.

12. **Make the data-looking tool frictionless. Vibe-code your own.** Nurture Boss vibe-coded a custom annotation app in hours. "Make it as easy as possible because... it's the highest ROI activity you can engage in." Direct alignment with miniu's role: any time looking at traces / commons rows / ledger entries should be as low-friction as possible. The annotation surface IS the substrate.

## Other notable threads

- **Theoretical saturation is the right stopping rule for trace review, not 100.** 100 is a mental unblock; the real number is "until you stop seeing new categories", which usually lands between 15 and 60 once you have intuition. Same shape as Kesava's "evaluate before draft" — the 7-section per-target evaluation is the pre-saturation work.
- **A/B tests are evals.** The "evals vs A/B tests" debate is a category error. Both are systematic measurement of quality. The mistake: A/B testing without prior error analysis tests the wrong hypotheses. "I would encourage people to go and rethink that and ground your hypotheses." Direct check on Shirley's CRO work — the A/B program is strong because it sits on top of error analysis (call recordings, support tickets); the failure mode is when teams skip the analysis.
- **Coding agents are not generalizable.** Claude Code's "we just vibe" is partly because the developer IS the domain expert AND the daily user, so the dogfood loop closes inside one head. "It's a mistake to try to generalize that at large." Marketing artifacts don't have this property — the buyer is not the marketer. Don't import Claude Code's eval-light culture into the flywheel.
- **Dogfooding is dangerous when it's claimed but not actual.** "A lot of people will say they're dogfooding... but are they, really?" Quick test: are you using your own product to do real work daily? For JustCall PMM, the answer should be yes for the flywheel substrate and the agent surfaces; for help-center AI, it requires explicit dogfood routines.
- **Generic eval tools (cosine similarity, hallucination score) don't work.** "They have a suite of generic tools, cosine similarity, hallucination score, whatever, and that doesn't work." Application-specific evals always beat generic. Same lesson Boris Cherny / Cat Wu describe: build for your context.
- **Lab-side benchmarks (MMLU, HumanEval) don't correlate with product evals.** Foundation-model benchmarks are decoupled from product-specific failures (handoff confusion, kill-list violations, brand voice drift). Direct mandate for clearPMM pitches: do not anchor success on model-version uplift; anchor on application-specific eval lift.

## Why this matters for flywheel

Three direct loads. First, the open-coding → axial-coding → LLM-as-judge pipeline is the literal substrate for measuring flywheel quality. Today, the iter-batch culture audits artifacts ad-hoc; the Hamel/Shreya pipeline is what turns that into a repeatable loop. Step one: pick 100 recent flywheel artifacts (LP variants, sales cadences, vertical playbooks). Step two: Aditi (or rotating reviewer) writes one note per artifact. Step three: AI clusters into axial codes. Step four: pivot the counts. Step five: build 4-7 binary LLM judges for the pesky failures (kill-list, over-promise, voice drift, structural omissions). Step six: run daily on production. The same loop applies to the JustCall AI agents (Fin and successors) and to the contextDB promotion boundary.

Second, the "evals as the new PRD" framing is the right shape for clearPMM contracts. The deliverable is not a deck; it's a co-built LLM judge prompt that encodes what "good" looks like for the client. The contract changes from "produce 5 LPs" to "build the eval suite, then iterate against it." Higher leverage, recurring revenue, and the artifact compounds across clients.

Third, the criteria-drift insight is the operational reason the flywheel needs trace review built into every workstream, not bolted on. The rubric for "good content" at JustCall today is not the rubric for next quarter. Build the loop, not the rubric.

## Related

- `concepts/operator-voice.md` — kill-list violations are the canonical pesky-failure-mode for Kesava-side evals
- `concepts/anti-fabrication.md` — the eval that catches invented metrics
- `concepts/evidence-ladder.md` — attribution drift is the second-order eval target
- `projects/clearpmm.md` — the productized version of the eval-as-deliverable contract
- `projects/justcall-content.md` — the artifact corpus this pipeline gets applied to
- `raw/podcasts/lenny/2026-04-28-sherwin-wu-openai-codex-engineers-as-managers.md` — the engineering analog, code review collapsing under substrate
- `raw/podcasts/lenny/2026-04-28-cat-wu-anthropic-product-team.md` — context-engineering thesis intersecting evals
- `raw/podcasts/lenny/2026-04-28-aishwarya-naresh-reganti-kiriti-badam-ai-product-design-non-determinism.md` — non-determinism as the underlying constraint that makes evals load-bearing
