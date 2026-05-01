---
title: What happens after coding is solved
type: raw
source_url: https://www.youtube.com/watch?v=We7BZVKbCVw
guest: Boris Cherny (Head of Claude Code, Anthropic)
host: Lenny Rachitsky
publication: Lenny's Podcast
published: 2026-04-27
captured: 2026-04-28
captured_via: yt-dlp auto-subtitles
domain: justcall|personal
attribution: verified
related: [concepts/principal-marketer-flywheel.md, concepts/ai-native.md, projects/flywheel.md, raw/podcasts/lenny/2026-04-27-cat-wu-anthropic-product-team.md]
transcript_file: We7BZVKbCVw.transcript.txt
relevance_to_flywheel: Direct parallel to flywheel — engineering's "everyone codes" → marketing's "everyone is a builder"; latent demand + bet-on-six-months-out + underfund mechanisms.
---

# Boris Cherny — What happens after coding is solved

## Why this is in the wiki
Boris ran the Claude Code 0→$2B journey. His operating principles (latent demand, build-for-six-months-out, underfund-on-purpose, agents-not-workflows) map almost 1:1 onto what flywheel is doing for marketing. Read alongside Cat Wu's episode — same culture, different surface area.

## Full text source
Transcript at `We7BZVKbCVw.transcript.txt` (20,042 words). VTT source: `We7BZVKbCVw.en.vtt`.

## 12 load-bearing insights for flywheel

1. **"100% of my code is written by Claude Code. I have not edited a single line by hand since November."** Boris ships 10-30 PRs/day, runs ~5 agents in parallel at any moment, and is still one of the most prolific committers on his team. The end-state is not "AI-assisted coding," it's coding-as-prompt-orchestration. Marketing's equivalent target is the flywheel.

2. **"Productivity per engineer increased 200% while we 4x'd the team."** Anthropic compound growth — both more people *and* more output per person. Counter to the "AI replaces headcount" frame. The flywheel pitch should land here: revenue-per-employee goes up, headcount can also go up if the work expands.

3. **Underfund deliberately.** "There's this interesting thing that happens when you underfund everything a little bit — people are forced to clarify, and the way they ship really quickly is just intrinsic motivation." Putting one engineer on a project with Claude Code beats putting four engineers on it. Flywheel implication: don't add humans to a workstream the substrate can absorb.

4. **Latent demand is the single most important principle in product.** Two flavors: (a) traditional — observe how users hack/abuse the product, build for that (Facebook Marketplace from 40% of group posts being buy/sell; Co-work from non-engineers using Claude Code in a terminal). (b) Modern AI flavor — observe what *the model* is trying to do and clear the path. "In research we call this being on distribution." For flywheel: watch what teammates work around with Claude vs the substrate; that's the next loop to build.

5. **Build for the model six months out, not today.** "Your product market fit won't be very good for the first 6 months, but when that model comes out you're going to hit the ground running." Quad Code felt mediocre under Sonnet 3.5; inflected at Opus 4. Flywheel parallel: build the demo-floor, evidence ladder, taste-leaderboard *now* against the model that's coming, not the one shipping today.

6. **Don't box the model in.** "A lot of people's instinct when they build on the model is to make it behave a particular way... almost always you get better results if you give the model tools, give it a goal, and let it figure it out." Strict workflows and orchestrators are scaffolding that gets wiped out by the next model. Bet on the general model. For flywheel: keep humans in the loop on taste; don't hard-code marketing playbooks into rigid pipelines.

7. **"The product is the model."** Cloud Code's design choice — minimal scaffolding around the LLM, expose its capability, give it the smallest possible toolset. This is why it scaled: it wasn't a chat-with-AI product, it was an agent product. Flywheel must follow the same pattern: substrate exposes Claude directly to the marketer, not behind a wrapped UI.

8. **Tokens per knowledge worker > salary cost (still).** Some Anthropic engineers spend hundreds of thousands per month in tokens. Boris's advice to other CTOs: "Don't try to optimize. Don't cost-cut at the beginning. Start by giving engineers as many tokens as possible." Optimization comes after the idea works. Flywheel: don't gate teammates on token cost during the bet phase.

9. **Co-work was built in 10 days using Claude Code.** Including a virtual machine sandbox for safety guardrails — "Claude Code wrote all of this code." Time-to-build collapsed; the bottleneck shifted to safety review and product taste. Flywheel parallel: time-to-publish collapses; the bottleneck shifts to taste + brand-safety review.

10. **"Use plan mode" — one-sentence prompt change = product feature.** Plan mode is literally "please don't write any code yet" injected into the system prompt. Boris uses it for ~80% of tasks, then auto-accepts edits. The simplest possible thing works because the model is the engine. Marketing analog: a "plan mode" before any external send — prompt-level, not workflow-level.

11. **Release earlier than feels safe — to learn safety AND latent demand.** Cloud Code was used internally for 4-5 months, but they still released it externally before they were ready, branded as research preview. The third layer of safety (real-world behavior) cannot be tested in a lab. Same logic for flywheel demos: ship to teammates earlier than "polished" allows.

12. **The next role to be most impacted is everything adjacent to engineering — PMs, designers, data science.** "Anyone whose work involves a computer." Boris's prediction: by end of year the title "software engineer" starts to disappear, replaced by "builder." Marketing has the same path; flywheel is just the marketing-team version of Claude Code-meets-Co-work.

## Other notable threads

- **Underfunding > overfunding for AI-era teams.** One engineer + Claude Code beats a normal four-engineer team. Lever for low headcount + high token budget.
- **Bitter Lesson (Sutton) is the operating philosophy.** General model > specific model; scaffolding gains get wiped by next model release. Flywheel should not hard-code workflows that the next model will make obsolete.
- **Common sense as life motto.** "The best results I see are people thinking from first principles and developing their own common sense. If something smells weird, it's probably not a good idea."
- **Generalists win.** "On the Quad Code team, everyone codes — PM, EM, designer, finance guy, data scientist. The strongest engineers are hybrid product+infra, or product+design, or eng+business sense." Marketing version: every flywheel teammate uses the substrate; the strongest are hybrid PMM+content+ops.
- **Twitter as a customer-feedback channel.** Boris ships bug fixes within minutes of a Twitter complaint. Marketing analog: Slack feedback rooms with same minutes-to-fix cycle.
- **No competitor-watching.** "We don't really try the other products. I love talking to users." Permission slip to ignore competitive obsession during build.

## Augmented from Dropbox transcript 2026-04-28

The original synthesis was built from YouTube auto-subtitles (~1.3K words). The Dropbox-archived full transcript (~19K words) surfaces additional load-bearing material below.

### 13. **The Bitter Lesson as operational philosophy** — Boris explicitly names Richard Sutton's blog post "The Bitter Lesson" as the Claude Code operating philosophy. Sutton's claim: the more general model always out-performs the more specific one. Corollary: "almost always try to bet on the more general model if you can, if you have that flexibility." For flywheel: never hard-code marketing workflows or decision trees. Keep humans in the loop because humans have general taste; as models improve, scaffolding gets wiped anyway. The flywheel substrate should expose Claude directly to the marketer, not wrap it in PMM-specific workflow rules.

### 14. **Plan mode: one-sentence prompt injection = product feature** — Boris uses plan mode ("please don't write any code yet" injected into system prompt) on ~80% of tasks. It's not a checkbox or UI toggle. It's literally a sentence in the prompt. The simplicity is the point: "There's actually nothing fancy going on. It's just the simplest thing." Flywheel equivalent: "before any external send" mode where the substrate runs in read-only, generates a draft, and human approves before publishing. One-prompt-line diff between draft and live modes.

### 15. **Four to five months internal-only testing before external release** — Claude Code was internally dogfooded for 4-5 months, but they still released it externally (as research preview) before "ready." Reason: "The third layer of safety (real-world behavior) cannot be tested in a lab." Flywheel parallel: demo the substrate to customers (even if it's scruffy) sooner than a polished playbook-driven launch would allow. Research preview framing is a permission slip for shipping before polish.

### 16. **Engineers spending $100K-$300K/month in tokens and staying productive** — Some Anthropic engineers rack up hundreds of thousands in tokens monthly. Boris's advice to CTOs: "Don't try to optimize. Don't cost-cut at the beginning. Start by giving engineers as many tokens as possible." Optimization comes after proof of concept. Implication for flywheel: do not gate teammates on token budget during the bet phase. The cost-optimization conversation happens if/when the bet fails, not before.

### Concrete operational details missed in original
- Co-work built in 10 days using Claude Code (including a virtual machine sandbox for safety guardrails — Claude wrote all of it). But "10 days" refers to final assembly; months of internal prototypes preceded it (todo-list form factors, multiple-choice UIs, use-case flows). Pattern: long discovery internally, sudden shipping window, ship-everything-at-once.
- Claude Code: 100% of Boris's code written by Claude since November (at time of recording). Runs ~5 agents in parallel, ships 10-30 PRs/day. Still one of the most prolific committers on the team.

### Notable side-quests
- Twitter as real-time bug-report channel. Boris fixes bugs within minutes of Twitter complaints. Marketing analog: Slack feedback rooms with same minutes-to-fix cycle.
- Generalists win on the Claude Code team. Everyone codes — PM, EM, designer, finance person, data scientist. Strongest engineers are hybrids (product+infra, product+design, eng+business sense). Marketing version: every flywheel teammate uses the substrate; strongest are hybrid PMM+content+ops.

## Why this matters for flywheel

Three things to bake in:

1. The "100% Claude-written" milestone is the right target for flywheel — not "AI-assisted marketing" but "marketing as prompt-orchestration where Claude does the work and humans do taste + decisions." Cat Wu and Boris both already live there for engineering. Marketing is 6-12 months behind on the same curve.

2. Latent demand (the modern AI flavor) is the search algorithm for flywheel's next loops. Watch what marketers do *outside* the substrate that they're trying to make work — that's the next bet. Same way Co-work was discovered by watching non-engineers use a terminal.

3. The underfund + tokens-not-headcount pattern is the actual mechanism behind revenue-per-employee gains. The pitch isn't "AI replaces marketers" — it's "give your best marketers unlimited Claude tokens and one engineer/PMM hybrid teammate, and they'll out-produce a six-person team." This is the structure-agnostic frame Kesava already wants for the Deepan demo.

## Related

- `raw/podcasts/lenny/2026-04-27-cat-wu-anthropic-product-team.md` — same operating model from the Claude Code product side
- `concepts/principal-marketer-flywheel.md` — append: latent-demand search algorithm + build-for-six-months-out + underfund principle + The Bitter Lesson + Bitter Lesson as defense against hard-coded workflows
- `concepts/ai-native.md` — append: "the product is the model" framing; scaffolding gets wiped by next model
