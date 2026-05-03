# codex — Front-End UI Brief

You are building the public-facing front end for **codex**, an open-corpus operator insight library. Lenny's-style transcripts, atomic insight cards, cross-domain knowledge graph. Every claim attributed to a real operator with a real source.

The repo lives at `github.com/k3sava/codex`. Content is markdown under `insight-library/`. Schema is in `insight-library/00_meta/insight-card-schema.md`. Read it before designing the components — the data model drives the UI.

## North star
> A library card catalog from 2042. Quiet, confident, useful. Reads like Stripe docs, moves like Linear, breathes like a Rauno page.

If a visitor lands on the home page and doesn't immediately know **whose insight they're reading and where it came from**, the design has failed.

## Design references
- **whisprflow.ai** — copywriting voice. Confident, terse, lowercase-friendly, zero marketing throat-clearing. Sentences end before you expect them to. No exclamation marks. No "unlock", "transform", "seamless".
- **mindmarket** — GSAP motion. Specifically: scroll-driven reveals, type-in headlines, magnetic cursor on cards, parallax depth on the graph, easing that lands soft (power3.out / expo.out, not bounce). Motion exists to focus attention, never to entertain.
- **Linear / Vercel / Stripe docs** — information density baseline. Clean grid, monospace for IDs, real typography, no stock illustration.
- **Are.na** — connection-first browsing. Cards link to cards link to operators link to sources.

## Voice rules (copywriting)
1. Lowercase product name: `codex`. Always.
2. Claim → mechanism → condition. Never lead with the operator's name; lead with the idea.
3. No em-dashes in body copy (use commas or periods).
4. Killed words: `unlock`, `transform`, `seamless`, `holistic`, `synergy`, `bespoke`, `leverage`, `orchestration`, `strategic`, `revolutionary`.
5. Numbers are quoted from the source verbatim, never rounded for emphasis.
6. Every quote has an operator + source link inline. Never a floating insight.
7. CTA verbs: `read`, `cite`, `link`, `open`, `browse`. Not `discover`, `explore` (too marketing).

## Information architecture

**Five primary surfaces:**
1. **Home** — what codex is, latest insights, featured operators, the graph as a hero element.
2. **Insight card** — the atomic unit. Operator badge, claim, mechanism, conditions, evidence, signals, counter-evidence, related cards, source link.
3. **Operator page** — profile, role-at-time, all their insights ranked by tier, source trail.
4. **Domain page** — e.g. `/d/ai-native`, `/d/positioning`. Filterable. Coverage matrix.
5. **Graph** — full corpus as a force-directed knowledge graph. Operators as nodes, insights as nodes, edges by `related:` field. Click a node to peek the card; double-click to navigate.

**Secondary:**
- Search (Cmd-K). Type, instant. Operator / claim / domain / source. Powered by a static index.
- About / how-to-cite / contributing / license.

## Tech expectations
- Static site, deploys via GitHub Pages (workflow already exists at `.github/workflows/pages.yml`).
- Markdown is the source of truth — build pipeline reads `insight-library/**/*.md`, parses frontmatter, generates routes + JSON index.
- No CMS. No backend. Search index is a single JSON file.
- Stack suggestion (decide based on motion needs): **Astro + GSAP + Tailwind + Pagefind** for search. Alternative: Next.js static export. Avoid heavy SPA frameworks for content this static.
- Graph: `cytoscape.js` or `d3-force`. Existing `docs/graph.json` is a starting point but schema will be regenerated from frontmatter.
- Type: a serif for body (Tiempos / Söhne Mono / Inter Serif equivalent open option = Newsreader or Source Serif), a quiet sans for UI (Inter / Söhne / Geist), monospace for IDs and source-type tags (JetBrains Mono / IBM Plex Mono).
- Color: paper-white default, near-black ink, single signal accent (sienna / burnt-orange — cf. Diggy paper theme). Dark mode required, parchment-dark not pure black.

## Motion system (GSAP)
- **Page enter**: stagger reveal of nav + hero text by 60ms, ease `expo.out`, duration 800ms.
- **Card hover**: subtle lift (translateY -2px), shadow bloom, 200ms.
- **Graph idle**: slow drift, nodes breathe ±2% scale on a 4s loop, randomized phase.
- **Insight card open**: source URL underline draws in left-to-right, 400ms, easing `power2.out`.
- **Scroll**: pin sections only when content benefits (e.g. domain coverage matrix scroll-tells). Don't pin for the sake of motion.
- **Reduced-motion**: respect `prefers-reduced-motion` — disable parallax, drift, cursor effects; keep fades.

## Insight card layout (the most important screen)

```
┌─────────────────────────────────────────────────┐
│ ins_<id>          [Tier A]    [Frontier]   ●    │
│                                                 │
│ One-sentence claim, set in serif display,       │
│ 32–40px, generous leading.                      │
│                                                 │
│ — <Operator Name>, <Role at time>               │
│   <Source title>, <YYYY-MM-DD>  ↗               │
│                                                 │
│ ┌─ Mechanism ──────────────────────────────────┐│
│ │ <body copy>                                  ││
│ └──────────────────────────────────────────────┘│
│ ┌─ Conditions ─────────────────────────────────┐│
│ │ <body copy>                                  ││
│ └──────────────────────────────────────────────┘│
│ ┌─ Evidence ───────────────────────────────────┐│
│ │ > "verbatim quote"                           ││
│ │   timestamp 24:13                            ││
│ └──────────────────────────────────────────────┘│
│ ┌─ Counter-evidence ───────────────────────────┐│
│ │ <body, with link to dissenting card>         ││
│ └──────────────────────────────────────────────┘│
│                                                 │
│ Related: ins_x · ins_y · ins_z                  │
│ Domains: product · ai-native                    │
│ Source: <full URL>                              │
└─────────────────────────────────────────────────┘
```

Right-rail on desktop: scoring badges (5 dimensions visualized as five small bars), captured-on date, raw-source link.

## Acceptance criteria
- Lighthouse: 95+ on all four axes (perf, a11y, best practices, SEO).
- Time to first insight (home → card) ≤ 2 clicks.
- Cmd-K search returns under 50ms on a 1000-card index.
- Every card page has a copy-citation button (`Author, "Title," Source, Date. codex/ins_id`).
- Graph renders 1000 nodes at 60fps idle.
- Print stylesheet — cards print as proper citations, not as web layout.
- Reduced-motion fully respected, tested with system flag.
- WCAG AA color contrast.

## Out of scope
- Auth, accounts, comments, likes — codex is a citation layer, not a community.
- AI summaries on top of insights — the corpus is the artifact; don't paraphrase what's already atomic.
- Newsletter capture, marketing modals, exit-intent popups — never.

## Deliverables
1. `docs/` directory rebuilt as the deployable site.
2. Build script triggered on push by existing `pages.yml`.
3. README in `docs/` documenting the build pipeline + how to add a new card and have it appear in the UI.
4. A first-pass of 5 fully designed insight cards (pick the strongest 5 from the existing 504-seed corpus) so the visual system is proven, not theoretical.

## Voice example (use this energy)

> codex is a record of what operators said. not a feed. not a course. not a take.
> every claim has a name on it.
> read one. cite it. move on.

That's the tone for the home hero. Match it.
