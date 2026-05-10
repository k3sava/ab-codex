---
name: abcodex-playbook
description: Detailed UX, IA, accessibility, AEO, sharing, QC, and round-structure rules for abcodex (abcodex.iamkesava.com). Load when implementing features, building pages, or auditing surfaces. Anti-fabrication and voice rules are in CLAUDE.md and apply unconditionally.
---

# abcodex playbook (detail layer)

CLAUDE.md has the always-on rules (voice, anti-fabrication, working agreement). This skill carries the detail.

## Build pipeline (run in order, every time)

Every content change requires both steps. Skipping the index build leaves stale data in INDEX.json and silently renders old content.

```
node scripts/build-index.mjs   # reads frontmatter + body H1 → INDEX.json
node scripts/build-static.mjs  # reads INDEX.json → docs/play/*/index.html
```

**Title source:** `build-index.mjs` uses `firstHeading(body)` — the markdown `# H1` — over frontmatter `title:`. To change the page title and browser tab title, change the H1 in the markdown file. Changing only frontmatter does nothing.

**Verify after every build:** `grep -o "<h1>[^<]*" docs/play/{id}/index.html`

## Playbook page defaults (apply before writing a single word)

These are not suggestions. Every playbook ships with all of these in place.

### 1. Title — JTBD statement, not topic label

The markdown H1 (`# Title`) is the canonical title. It controls the page H1, browser tab, OG tags, and JSON-LD.

- **Fail:** `# Competitive analysis` — a topic label
- **Pass:** `# Run competitive analysis that arms sellers and sharpens positioning` — a reader-facing job
- **Test:** does the title tell the reader what they will be able to *do* after reading?

### 2. H2 headings — reader-directed

Every H2 is a signal in the sticky TOC. It must work as a standalone instruction, not a category label.

| Fail | Pass |
|------|------|
| Steps | How to use |
| Outputs | What you get |
| Failure modes | What goes wrong |
| Quality gates | Check your work |
| Template | Compare honestly |

### 3. Intro paragraph — no jargon, no unexplained references

The intro is the first thing a cold reader sees and the first thing a schema scraper indexes. Run this checklist before committing:

- Every named framework is either explained in one clause or cut. "CIA 4-phase cycle" — undefined acronym for a framework not described anywhere — gets cut. "Crayon's battlecard research" — known vocabulary for the target PMM reader — stays bare.
- No abbreviations on first use without expansion. "CI" alone fails; "competitive intelligence (CI)" passes, but only if CI is actually reused. If it isn't, just write the words.
- No throat-clearing openers: "One thing most X miss:", "The practical implication:", "It's worth noting that."
- Target reader is a working PMM or operator. Do not explain what they already know (G2, Crayon, Gartner, SWOT). Do not define industry-standard terms.

### 4. Section content — Hemingway pass before shipping

After writing any section, run these cuts:

- Trailing sentences that repeat what was just said: cut
- "specifically", "actually", "going forward": cut every instance
- Weak trailing sentences after a strong one ("The analysis must account for it", "That is competitive intelligence"): cut
- "attack angles", "displacement sales", "depositioning" and similar PMM jargon: replace with plain English or one-clause definition
- Throat-clearing mid-section: "The more important step is building the feedback loop going forward" → "The more important step: the feedback loop."
- "Not as a named competitor, but as a real option the buyer weighs" → "Not as a named competitor. As a real option the buyer weighs." (short sentences hit harder)

### 5. Visual blocks — placement and count

Playbooks with animated visuals use `splitVisuals(html)` to extract each `<div class="pbv">` block. Current injection logic:

- `visual1` → after `<h2 id="how-to-use">` or `<h2 id="steps">`
- `visual2` → before the 6th `.pb-step` (injects mid-content)
- `visual3` + `visual4` → together after `<h2 id="compare-honestly">`

If a section needs a visual, the H2 id must match the injection selector. Verify in built HTML that the visual appears at the right place.

**Visual link hover:** `main.static a` adds `border-bottom`. Any link inside a `.pbv-step-name` or similar visual element must explicitly reset it:
```css
.pbv-step-name a { text-decoration: none; border-bottom: none; padding-bottom: 0; }
.pbv-step-name a:hover { color: var(--pbv-accent); text-decoration: underline; text-underline-offset: 2px; border-bottom: none; }
```

### 6. Image assets in playbook visuals

Images referenced from `animated.html` are served from `/assets/visuals/{playbook_id}/`. The build script calls `copyVisualImages(p.id)` which copies all `.png/.jpg/.webp/.svg` (except `social.png`) from `assets/visuals/{id}/` to `docs/assets/visuals/{id}/`.

- Only commit cropped, optimized images (hero crops ≤30KB preferred). Never commit full-page screenshots.
- Image paths in `animated.html` must be absolute: `/assets/visuals/{id}/filename.png`
- After adding images: rebuild both index and static, then `ls docs/assets/visuals/{id}/` to verify

### 7. Scroll and TOC

- Sticky topbar is 72px. All `h2` and `h3` need `scroll-margin-top: 72px` in the inline CSS block.
- Verify TOC links by clicking each one after build. The target section should appear below the topbar, not behind it.

### 8. Insight chips

Chips render operator + year labels. Dedup by label before rendering — same operator with two insights from the same year produces duplicate chips otherwise. The `seenChipLabels` Set in `build-static.mjs` handles this. If chips look wrong, check that dedup logic is present.

### 9. AEO schema

- `HowToStep` objects must target `### N. Title` H3 headings (numbered steps), not H2 sections. URLs use `#step-NN` anchors (zero-padded).
- Include `speakable: SpeakableSpecification` on the WebPage node.
- Verify with `grep -A5 '"@type":"HowTo"' docs/play/{id}/index.html`

### 10. Comparison page section

Every playbook with a "Compare honestly" section needs:
- A reader-mental-state table showing what each section does for the reader's trust
- A real-world example (not hypothetical) that shows the template applied with actual copy
- Tone calibration note: market leader = maximum deference; direct competitor = contrast, no attacks; adjacent = reframe

The visual blocks for this section are `visual3` (template pipeline) and `visual4` (real-world example). Both inject together after the `compare-honestly` H2.

## QC failure modes (these have all gone wrong)

1. Untested "done." Open browser, click thing, hear audio, see screenshot.
2. Surface vs substance. Don't ship CSS for a feature whose data isn't ready.
3. Pattern vs instance. Define the IA, render every page from same edge model.
4. Wrong counts. Re-count, then write.
5. YAML escape leaks. `'can''t'` rendering as `can"t`. Use shared `unyaml()` helper everywhere a YAML scalar is read.
6. Mobile keyboard dismissal. Programmatic `scrollIntoView` on input events dismisses iOS keyboard. Only scroll on intentional navigation.
7. Filter drawers covering result. Mobile drawer auto-collapses on selection or has explicit close. Active filters render as pill row above list.
8. Layout drift. Any page narrower than others is a bug. Width set once, not per-page.
9. Compound operators. `"Lily Ray + Britney Muller"` wrong. Split into `operator` + `co_operators[]`.
10. Emoji insertion. Never, unless explicitly asked.
11. Named reference without context. If a name, acronym, or framework would be opaque to the target reader — a working PMM or operator — add one clause. Do not explain what the target reader already knows. "Crayon" needs no gloss; "CIA 4-phase cycle" does, because that acronym is not shared vocabulary and the framework is never defined. The test: would the target reader have to search to understand why this is cited? If yes, add context. If no, leave it bare. Do not add parenthetical descriptions that talk down to the reader.
12. Topic-label titles. Every playbook title must be a reader-facing JTBD statement. "Competitive analysis" fails. "Run competitive analysis that arms sellers and sharpens positioning" passes. The H1 in the markdown is the canonical title — frontmatter `title:` is ignored by the index builder.
13. Build pipeline out of order. Any content change requires `build-index.mjs` before `build-static.mjs`. Skipping the index build renders stale content silently. Verify with `grep -o "<h1>[^<]*" docs/play/{id}/index.html`.
14. Overcorrection. Fixing one quality problem by introducing a different one (adding a condescending parenthetical while fixing an undefined acronym). After every fix, re-read the sentence as the target reader and ask: does this insult their intelligence?

## Eye for errors (Kesava's pattern)

- Fabricated URLs / identifiers
- AI patterns in body text outside operator verbatim
- Parser errors leaking through (curly where straight, escapes visible)
- Buttons that look right but don't work
- Layout drift
- Compound nouns shipping as single fields
- Counts that drift from reality
- Things shipped without verification
- Named references a cold reader cannot evaluate (QC #11)
- Title is a topic label not a JTBD statement (QC #12)
- Build index not run before static build (QC #13)
- Fix introduced a new problem (QC #14)

## UX & design

- Max content width `min(1600px, 80vw)`. Every page obeys, About included.
- Body fills the section container. Do NOT cap paragraphs at 60ch / 65ch / 72ch on data-dense pages — that wraps text at ~520px inside a 1500px section. Prose-only pages (about) use a single column container (e.g. 60rem) but never per-element `ch` caps because `ch` is font-size relative.
- Typography: Newsreader serif body, Inter UI, JetBrains Mono labels.
- Tier badge: pill with leading color dot (A green, B slate, C sand). Same component everywhere.
- Animations <280ms. `prefers-reduced-motion: reduce` skips, doesn't shorten.
- Paper-first palette. Warm sienna accent. No saturated primary blues.
- Drop caps, pull quotes, in-card TOC for long bodies. Print stylesheet must work.
- Industrial-design thinking: nothing decorative.

## Information architecture

Cross-linking masterpiece. Every primitive is a node with explicit edges:

- Forward: insight → operator, domain, patterns, playbooks
- Reverse: operator → insights/patterns/playbooks; domain → all
- Sibling: same operator, same domain, same source
- Ancestor: domain page. Descendant: derived patterns

Edges render the same way on every page. A user entering through any door must always see ≥4 next doors.

## Accessibility (floor, not ceiling)

- WCAG AA contrast verified. `--muted: #5a6757` (5.44:1 on paper). Don't lighten.
- Skip-link is first focusable element. `main[tabindex=-1]`. Focus shifts on route change.
- Keyboard: g+h home, g+t today, g+o operators, g+p patterns, g+b browse, g+m map, j/k next/prev sibling, l listen, [/] read rate, s share, c copy citation, / search, ? help, esc close.
- ARIA: `role=status`, `aria-live=polite`. `aria-pressed` flips on actual event (e.g. `utterance.onstart`), never optimistically.
- Speech API: 60ms gap between `cancel()` and `speak()` in Chrome. Body-loaded guard before reading.
- Real device test on iOS Safari + Android Chrome before "done."

## Sharing & AEO

- Per-page share menu: native, copy, LinkedIn, X, email. Native falls back gracefully.
- Per-page OG image, distinct per insight/operator/pattern/playbook/domain.
- `Schema.org @graph` on every static page: Article + BreadcrumbList + FAQPage + Speakable per insight; Person + sameAs per operator; HowTo per playbook; CollectionPage per index; DefinedTerm per domain.
- `llms.txt`, `sitemap.xml`, `rss.xml`, `robots.txt` (all AI bots allowed), `.well-known/agent-permissions.json`, `search-index.json`.
- Site must answer correctly when an AI agent fetches it.

## Loop discipline

Re-apply Ogilvy / Feynman / DaVinci / Jobs lenses at end of every iteration. Not what they did when they lived — what they would do today, on the team.

Loop continues until site is twice as good as Wikipedia + Substack + LinkedIn + Medium + Podcasts combined:

- Wikipedia: every page ≥6 outbound links, reverse-links visible
- Substack: every insight has operator verbatim + plain-English distillation
- LinkedIn: tier + claim + operator readable in 3 seconds
- Medium: 65ch lines, drop caps, pull quotes, in-card TOC, reading progress
- Podcasts: listen + rate control + voice picker, working in 3 browsers, every page

Exit when all six axes hold on real devices and a fresh AI agent fetch produces correct answers from `@graph` alone.

## Round structure (active plan)

Six rounds, each = one primitive × one journey:

1. Insight page × first-time visitor
2. Operator page × returning bookmarker
3. Domain page × cross-domain explorer
4. Patterns + playbooks × synthesis seeker
5. Browse + search + timeline × directed searcher
6. AEO surface (llms.txt, schema, sitemap, OG) × AI agent

Each round commits separately. Within each, the primitive gets full IA + voice + visual + friction + schema + mobile + listen + perf, and the journey gets walked end-to-end on a real device before moving on.
