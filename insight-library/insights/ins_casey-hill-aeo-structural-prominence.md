---
id: ins_casey-hill-aeo-structural-prominence
operator: Casey Hill
operator_role: B2B growth advisor
co_operators: []
source_url: "https://www.growthunhinged.com/p/what-s-working-right-now-in-ai-search"
source_type: post
source_title: What's Working Right Now in AI Search
source_date: 2026-05-03
captured_date: 2026-05-09
domain: [pmm, content-strategy, seo]
lifecycle: [awareness]
maturity: applied
artifact_class: playbook
score: { originality: 3, specificity: 4, evidence: 4, transferability: 4, source: 3 }
tier: B
related: [ins_ghost-citation-gap, ins_manual-action-propagates-to-ai-surfaces, ins_crawlability-shapes-everything, ins_aeo-decided-off-your-domain]
raw_ref: 
---

# Structural prominence in nav, headers, and footer predicts LLM citation rates more reliably than body content alone

## Claim
Structural prominence in headers, subheaders, top navigation, and footers predicts LLM citation rates more reliably than body content alone. Moving use-case anchors into persistent site chrome lifts citation rates measurably.

## Mechanism
LLMs extract entity-attribute relationships from structural signals before reading full body text. Navigation and footer elements appear consistently across multiple URL contexts on a domain, reinforcing the association between a product and a capability category. Use-case anchors placed in persistent site chrome get processed as categorical identifiers, not just content mentions.

## Conditions
Holds when: The page is crawlable and AI bots can read structural HTML. The product has a defined categorical frame an LLM can match to a query.
Fails when: The page has blocking TTFB or 499 responses that prevent crawl completion. The use-case framing in navigation is generic rather than specific.

## Evidence
Casey Hill observed citation rate lifts at Replit, Clay, and Sundial after each moved use cases into footer and navigation elements. Reported in Kyle Poyar's Growth Unhinged roundup, May 3.

> "structural prominence or what you put in your headers, subheaders, top nav, and footer, matters for LLM citations"

## Signals
- Citation rates in AI tools rise after adding use cases to footer and nav without publishing new content
- "Best tool for X" queries return your product without new backlinks
- Competitor URLs without structural use-case anchors appear less often in AI recommendations

## Counter-evidence
Body content depth still matters for longer-tail and expert queries. Structural placement is a floor signal, not a ceiling. Thin nav labels with no specificity do not produce the effect.

## Cross-references
- `ins_ghost-citation-gap`: third-party mention density is a parallel citation signal
- `ins_manual-action-propagates-to-ai-surfaces`: structural changes propagate to AI surfaces over time
- `ins_crawlability-shapes-everything`: structural signals only count if the page is crawled
