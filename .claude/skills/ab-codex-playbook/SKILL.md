---
name: ab-codex-playbook
description: Detailed UX, IA, accessibility, AEO, sharing, QC, and round-structure rules for ab-codex (codex.iamkesava.com). Load when implementing features, building pages, or auditing surfaces. Anti-fabrication and voice rules are in CLAUDE.md and apply unconditionally.
---

# ab-codex playbook (detail layer)

CLAUDE.md has the always-on rules (voice, anti-fabrication, working agreement). This skill carries the detail.

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

## Eye for errors (Kesava's pattern)

- Fabricated URLs / identifiers
- AI patterns in body text outside operator verbatim
- Parser errors leaking through (curly where straight, escapes visible)
- Buttons that look right but don't work
- Layout drift
- Compound nouns shipping as single fields
- Counts that drift from reality
- Things shipped without verification

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
