---
id: ins_casey-hill-structural-prominence-llm-citations
operator: Casey Hill
operator_role: CMO, DoWhatWorks
co_operators: []
source_url: "https://www.growthunhinged.com/p/what-s-working-right-now-in-ai-search"
source_type: recap
source_title: What's Working Right Now in AI Search
source_date: 2026-05-03
captured_date: 2026-05-09
domain: [aeo, content-strategy]
lifecycle: [awareness]
maturity: frontier
artifact_class: playbook
score: { originality: 4, specificity: 4, evidence: 4, transferability: 4, source: 3 }
tier: B
related: [ins_crawlability-shapes-everything, ins_aeo-three-layer-presence-readiness-impact, ins_mike-king-ai-crawler-499-speed-gate]
raw_ref: 
---

# Nav and footer placement is a first-class LLM relevance signal, independent of page content.

## Claim
What you place in headers, subheaders, top navigation, and footers is read by LLMs as a relevance signal for citations. Moving a topic into the site's structural chrome lifts citation rates for that topic independently of page-level content changes.

## Mechanism
LLMs processing a page assign higher weight to text in structural positions because those positions signal what the publisher considers most important. Nav and footer appear on every page, so their contents act as persistent topic declarations rather than per-page claims. Adding a topic to the footer is a site-wide statement of competence in that area.

## Conditions
Holds when: the LLM crawls rendered HTML including nav and footer; the topic is within the site's existing domain; the structural element is crawlable and not stripped by JavaScript rendering issues.
Fails when: the crawler processes only the main content body; or when the topic in the footer conflicts with the site's established authority signals.

## Evidence
Hill named three working examples from companies that added topics to structural positions and observed citation rate changes.

> "structural prominence or what you put in your headers, subheaders, top nav, and footer, matters for LLM citations"

Replit added "Vibe Coding 101" as a footer link and saw categorical citation rates rise. Clay and Sundial moved customer use cases into footers and measured citation rate increases. The effect is invisible to a standard content audit because nav and footer are templated chrome, not authored copy.

## Signals
- Citation rate for a topic rises after adding it to footer or global nav, with no other page content changes
- AI-generated answers reference a use case the site names only in nav or footer
- Competitor sites without footer/nav topic links underperform on categorical citations despite similar on-page content

## Counter-evidence
No controlled test separates the structural placement effect from the internal-linking effect of adding a footer link, which also creates a crawlable path to the topic page. The mechanism may be partly link-graph rather than purely structural prominence.
