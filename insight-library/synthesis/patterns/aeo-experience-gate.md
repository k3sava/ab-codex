---
id: pat_aeo-experience-gate
title: AEO experience and structure gate
captured_date: 2026-05-09
convergence_count: 4
tier: A
uses_cards: [ins_casey-hill-aeo-structural-prominence, ins_kyle-poyar-ai-recommendation-share, ins_lily-ray-firsthand-experience-ai-overviews, ins_mike-king-499-ai-bot-silence]
domains: [pmm, content-strategy, seo]
---

# AEO experience and structure gate

## Convergence
Four practitioners converged independently in the same week on a single frame: AEO candidacy is determined by page behavior and structure before content quality is ever assessed. Mike King found that AI bots emit 499 responses when pages exceed patience thresholds, silently excluding them from the candidate set. Casey Hill observed citation rate lifts from structural placement changes in nav and footer. Lily Ray read Google's AI Mode launch as confirmation that first-hand experience is now a distinct ranking primitive. Kyle Poyar reframed the outcome metric as recommendation-share rather than citation count. None cited the others; all arrived at the same ordered gate.

## Operators
- Casey Hill, `ins_casey-hill-aeo-structural-prominence`. Structural placement in nav and footer predicts citation rates; use-case anchors in persistent site chrome outperform body mentions.
- Kyle Poyar, `ins_kyle-poyar-ai-recommendation-share`. Track recommendation-share, not citation count; AI responses recommend specific products rather than listing links.
- Lily Ray, `ins_lily-ray-firsthand-experience-ai-overviews`. First-hand experience drives incremental clicks from AI Overviews and AI Mode beyond its role as an E-E-A-T input.
- Mike King, `ins_mike-king-499-ai-bot-silence`. A 499 from an AI bot UA silently removes a page from the LLM candidate set before any quality judgment.

## Variation
- Casey Hill: the fix is structural. Move use-case anchors to nav and footer.
- Kyle Poyar: the fix is metric. Track recommendation-share, not citations.
- Lily Ray: the fix is content type. First-hand practitioner content over aggregated synthesis.
- Mike King: the fix is infrastructure. TTFB and HTML payload size for AI-bot UAs.
- Convergence: all four agree that content investment is downstream of passing performance, structural, and experiential gates. The LLM candidate set is the precondition; keyword strategy does not address it.

## Implication
Run an infrastructure and structure audit before commissioning new AEO content. Check server logs for 499s filtered to AI bot UAs (GPTBot, PerplexityBot, ClaudeBot). Audit nav and footer for explicit use-case anchors. Confirm that high-traffic templates have TTFB under 1,000 ms. Add first-hand practitioner perspectives to pages that already pass the structural and performance gates. The content work is the last step, not the first. A useful diagnostic: which pages appear in AI recommendations today, and do any of them have 499s from AI bot UAs in your server logs?

## Sources
- ins_casey-hill-aeo-structural-prominence, Casey Hill (Growth Unhinged roundup, 2026-05-03)
- ins_kyle-poyar-ai-recommendation-share, Kyle Poyar (Growth Unhinged, 2026-05-03)
- ins_lily-ray-firsthand-experience-ai-overviews, Lily Ray (ppc.land, 2026-05-06)
- ins_mike-king-499-ai-bot-silence, Mike King (iPullRank, 2026-05-08)
