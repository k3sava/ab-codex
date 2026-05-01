---
title: Simon Willison — Agentic engineering and the November inflection
type: raw
source: Lenny's Podcast (Dropbox archive shared by Gaurav)
guest: Simon Willison (co-creator of Django, creator of Datasette, prolific blogger)
host: Lenny Rachitsky
publication: Lenny's Podcast
published: 2026-04-02
captured: 2026-04-28
captured_via: Dropbox transcript bundle
domain: justcall
attribution: verified
related: [raw/podcasts/lenny/2026-04-28-boris-cherny-claude-code-after-coding-solved.md, raw/podcasts/lenny/2026-04-05-amol-avasare-anthropic-growth-cash.md, raw/podcasts/lenny/2026-04-28-jenny-wen-design-process-is-dead.md, concepts/ai-native.md, projects/flywheel.md]
transcript_file: lenny-dropbox/Simon Willison.txt
relevance_to_flywheel: HIGH. Simon names the November 2025 inflection point (GPT 5.1 + Opus 4.5 crossed "almost always works" threshold) and provides the cleanest articulation of the agentic engineering pattern stack — dark factory testing, hoarding patterns, Red/Green TDD, template starts. Also: explicit prediction that the bottleneck has migrated from coding to everywhere else, and the "Challenger disaster" warning on responsible deployment.
---

# Simon Willison — Agentic engineering and the November inflection

## Why this is in the wiki

Simon is the rare 25-year engineer who's *fully* migrated to AI-mediated development and writes about it daily. This is the canonical reference for "what does it look like when nobody types code anymore" — and the reasoning behind why that's not the same as vibe-coding-and-praying.

## Insights

### 1. The November 2025 inflection point

GPT 5.1 + Claude Opus 4.5 crossed a threshold: not "incrementally better" but "previously coding agents mostly worked, now they almost always do what you told them to do." That single qualitative shift detonates over the holidays. By Jan/Feb everyone wakes up to "I can produce 10,000 lines a day." This *is* the dating signal for "AI-native" as an operating reality, not aspiration.

### 2. Code came first because code is verifiable

Code can be run and tested — it's obviously right or wrong. Essays, lawsuits, plans cannot. So engineering is the bellwether for every other knowledge-work field. Whatever happened to engineering in November 2025 is the preview for marketing, design, ops, legal, etc. — at the rate the eval problem is solved for each.

### 3. Vibe coding vs. agentic engineering — the boundary

- **Vibe coding** (Karpathy's original): you don't look at code, don't care about code, maybe don't understand it. Fine when only *you* get hurt by bugs. Bad when others do.
- **Agentic engineering**: a professional uses coding agents to build production-ready software with full review and quality bar. Different discipline; takes 25 years of experience to do well.
- Conflating the two devalues both terms.

### 4. The dark factory pattern (StrongDM)

Two-rule progression:
- Rule 1: nobody types code. ~95% of Simon's own code is now not typed by him. Practical today.
- Rule 2: nobody *reads* code. Practiced by StrongDM since Aug 2025 — security software, no less.

How they pulled it off: simulated QA swarm. ~$10K/day in tokens running thousands of simulated employees in a *simulated* Slack/Jira/Okta (also vibe-coded against API docs). 24/7 robust testing of access-management software. The cost of simulating dependencies → effectively zero, because the simulators are agent-built Go binaries.

### 5. The bottleneck moved everywhere else

The bit that used to take three weeks now takes three hours. So now the bottleneck is: ideation, prototyping the right idea, picking which prototype wins, alignment, deployment safety. Simon's pattern: prototype every feature 3 different ways (free now), then test with humans (still better than AI-simulated users for usability).

### 6. The brainstorm pattern

AI is great at the first two-thirds of a brainstorm — the obvious 20 ideas. The interesting work starts when you ask for 20 *more*. Cross-domain prompting (e.g. "marketing my SaaS, inspired by marine biology") generates the divergent sparks. Direct echo of David Placek's three-team naming method.

### 7. Hoarding: the personal-pattern repository

Lifelong career advice that AI multiplies. Build a public-or-private backlog of *things that worked*: SimonW/tools (193 small HTML/JS tools), SimonW/research (75 AI-driven research projects, each markdown report after running real code). Two GitHub repos as the durable substrate. Now Claude Code can search those repos to combine prior solutions for new problems. "The code is cheap now."

For Kesava: this is the substrate analogue. clearPMM evaluations, flywheel pages, evidence files — all hoarded, all greppable by future agents. The wiki *is* the hoard.

### 8. Red/Green TDD as a pre-canned prompt

Simon hated TDD as a human; loves it for agents. They don't get bored writing 1000 lines of test boilerplate. The phrase "Red/Green TDD" compresses a paragraph of testing instructions into 4 words the agents already understand. Operating principle: invest in jargon-shorthand the agents recognize, save tokens + cognitive load.

Adjacent rule: keep tests *generously*. Over-testing used to be a code smell because updating tests was expensive. Updating tests is now free. So the tolerance for verbose test suites went up.

### 9. Template-first project starts

Coding agents are "phenomenally good at sticking to existing patterns." A new project starts with a single trivial test (1+1=2), preferred indentation, a few boilerplate files. That single example is enough for the agent to mimic style across the whole codebase.

### 10. Cognitive ceiling is real

"I can fire up four agents in parallel … by 11 AM I am wiped out." There is a hard human limit on how many parallel agents you can supervise even when you're not reviewing every line. Burnout / addiction risk is real ("agents could be doing work for me, I'll stay up another half hour"). Pacing is now a personal skill.

### 11. The Challenger disaster prediction

Repeat use of agents in increasingly unsafe contexts → small failures get normalized → at some point a Challenger-class disaster. The O-rings worked until they didn't. He believes it's coming and that the industry's response will be the inflection that forces real practices.

### 12. Search-via-LLM beats Google

For research, Simon now nearly never uses Google directly. Models with parallel search integration are simply better at finding + synthesizing answers than humans Googling. He still verifies before publishing. Adjacent: ChatGPT-to-Claude memory export was a *prompt*, not a feature ("tell me everything you've remembered about me" → paste into Claude). Whole migration moves now happen via prompt copy-paste.

### 13. The Pelican benchmark

Joke benchmark — "draw an SVG of a pelican riding a bicycle" — turned out to correlate strongly with overall model quality. AI labs now race for it. Lesson is method-shaped: a load-bearing benchmark can be silly and visual, doesn't need to be statistical. Whimsy as a survival strategy in this transition.

## Other threads

- **Security models that are NOT publicly released** — both Anthropic and OpenAI maintain invite-only security-research models because they're too dangerous. Anthropic + Mozilla shipped a Firefox release with 100 verified vulnerabilities found this way.
- **Reasoning models change the game for code** specifically — being able to "think through" code before producing is what crossed the threshold.
- **Most of what makes agents write better code also makes humans write better code** — Simon's book is "secretly about software engineering."

## Why this matters for the flywheel

This is the cleanest external articulation of the *operating mechanics* underneath the flywheel pitch. Replace "engineering" with "marketing" and the same patterns hold:
- November-style inflection is coming for marketing crafts as eval-rigor improves
- Dark factory pattern → flywheel substrate (humans don't review every artifact, but quality bar is enforced systemically)
- Hoarding → the wiki + Commons repos as institutional memory the substrate searches
- Template starts → the CFO Showcase template, Iteration scaffolds, sales-cadence skeletons
- Red/Green TDD → encoded jargon-shorthand for the substrate (publish, ship, debrief)
- Cognitive ceiling → why "scale humans" is a real cap; the substrate is what raises the ceiling

Top transferable rules:
- The bottleneck always moves; identify the new one and design for it
- Verifiability is the gating factor — invest in evals, simulated users, test-like artifacts for marketing work
- Encode shorthand once, save tokens forever

## Related

- `raw/podcasts/lenny/2026-04-28-boris-cherny-claude-code-after-coding-solved.md` — Boris on what comes after coding is solved
- `raw/podcasts/lenny/2026-04-05-amol-avasare-anthropic-growth-cash.md` — Amol on the four-stage growth automation loop
- `concepts/ai-native.md` — workflow collapse, revenue-per-employee
- `projects/flywheel.md` — direct application
