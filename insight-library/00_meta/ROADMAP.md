# Codex Ingestion Roadmap

**Status:** Phase 0 audit complete (2026-05-01). Phase 1 execution in progress.

## Audit summary

| Source | Total files | Ingestible | % Ready | Notes |
|--------|------------|-----------|---------|-------|
| `wiki/raw/podcasts/` (Lenny's etc.) | 127 | 121 | 95% | Richest seam. Transcripts + extracted atomic claims already structured. |
| `wiki/raw/articles/` | 49 | 38 | 78% | 11 missing source_url. Includes Karpathy, Yamini, Kieran, Rand, Brian Balfour. |
| `wiki/raw/articles/gartner/` | 26 | 14 | 54% | Domain-agnostic subset only (voice, agentic, sales, GTM, leadership). Skip CCaaS-specific. |
| `wiki/raw/operators/` | 129 | ~110 | 85% | Rand Fishkin, Florin Tatulea, others. Frontmatter inconsistent, needs normalization. |
| `wiki/concepts/` | 22 | 9 | 41% | Only cross-domain concepts. Skip career-ops/JustCall/personal. |
| `wiki/raw/linkedin-posts/` | 5 | 2 | 40% | 3 stubs need verbatim text completion. |
| `artemis/knowledge/playbooks/` | 15 | 15 | 95% | Domain-agnostic PMM/GTM playbooks with primary-source attribution. |
| `artemis/knowledge/experts/` | 138 | ~125 | 90% | Operator profiles: Andrew Chen, April Dunford, Hormozi, etc. |
| `artemis/knowledge/own-work/` | 937 | ~5 | 0.5% | Heavy client-scoping; only artemis-offer-gtm + craft extractions. |
| `flywheel/skills/` + `DOCTRINE.md` | 32 | ~20 | 70% | Skills cite masters (Dunford, Pierri, Schwartz). Strip JustCall examples. |
| `team-brain/workflows/` | 32 | ~8 | 25% | Heavy dedupe with artemis playbooks. Pick unique only. |
| `team-brain/skills/` | 70 | ~10 | 14% | Mostly tool-specific. Pick domain-agnostic subset. |
| `miniu/` | — | 0 | — | Operational/code only. Skip entirely. |

**Estimated unique post-dedupe volume:** **~480 atomic insight cards** + **~125 operator profiles** + **~30 raw transcripts/articles** archived in `raw/`.

## Dedupe map

Same framework appears in multiple sources:

| Framework | Canonical source | Secondary refs |
|-----------|-----------------|----------------|
| Obviously Awesome / Context-of-Use Positioning | April Dunford (book + own essays) | playbooks/positioning, flywheel/positioning-forge, team-brain/copywriting-mastery |
| 5-Level Awareness | Eugene Schwartz (Breakthrough Advertising) | playbooks/copywriting-mastery, flywheel/ad-ship, team-brain/workflows/copywriting-mastery |
| Pierri Messaging Stack | Diane Pierri | playbooks/messaging-matrix, flywheel/positioning-forge |
| Halbert Specificity | Gary Halbert | playbooks/copywriting-mastery, team-brain/workflows |
| JTBD | Christensen + Moesta | playbooks/positioning, flywheel/positioning-forge |
| Cold Start Problem | Andrew Chen | experts/andrew-chen, own-work extractions |
| Crossing the Chasm | Geoffrey Moore | flywheel skills, playbooks, expert profiles |

**Rule:** one canonical card per framework. Secondary references link to it via `related:` and don't restate the claim.

## Repository structure (post-restructure)

```
insight-library/
├── 00_meta/                  ← thesis, taxonomy, scoring, schema, ROADMAP, INGEST-PROTOCOL
├── raw/                       ← immutable sources
│   ├── podcasts/             ← Lenny's + others (127 files batch 1)
│   ├── essays/               ← Substack, blog posts (38 from wiki)
│   ├── talks/
│   ├── threads/              ← LinkedIn / X (5 from wiki)
│   ├── books/
│   └── research/             ← Gartner domain-agnostic (14 files)
├── operators/                 ← profile per operator, indexes their cards
│   ├── april-dunford/
│   ├── andrew-chen/
│   └── …
├── domains/                   ← cross-operator views per domain
│   ├── product/
│   ├── pmm/
│   ├── gtm/
│   ├── growth/
│   ├── design/
│   ├── ai-native/
│   ├── leadership/
│   ├── sales-cs/
│   └── research/
├── insights/                  ← atomic insight cards, the corpus body
│   └── ins_<slug>.md          ← flat list, one card per file
├── synthesis/                 ← cross-source patterns, contradictions, coverage
│   ├── patterns/
│   ├── contradictions/
│   └── coverage-matrix.md
├── playbooks/                 ← promoted multi-card sequenced artifacts
│   ├── positioning/
│   ├── messaging/
│   └── …
└── INDEX.md                   ← machine-readable index of every card

```

## Phased execution plan

### Phase 1 — Foundation ✅ (2026-05-01)
- [x] Schema + scoring + taxonomy locked (00_meta/)
- [x] Audit complete (this doc)
- [x] Restructured directories per layout above
- [x] INGEST-PROTOCOL.md written
- [x] 5 sample insight cards built (3 Claire Vo, 1 Karpathy, 1 Kieran). Sample size proves schema; bulk ingest deferred to Phase 2-7 sub-agents.
- [x] 3 operator profiles built (Claire Vo, Andrej Karpathy, Kieran Flanagan). 7 more (Lenny, Dunford, Andrew Chen, Hormozi, Schwartz, Halbert, Pierri) come from Batch O1.
- [x] INDEX.md generator built (`scripts/build-index.mjs`); generates INDEX.md + INDEX.json from frontmatter
- [x] 3 raw transcripts archived (Claire Vo podcast, Karpathy gist, Kieran thread)
- [x] INGEST-AGENT-PROMPTS.md written — pre-built prompts for all remaining batches

### Phase 2 — Bulk podcast ingest (next session, ~3-4hr)
- Spawn 2 parallel ingest agents
- Batch 1 (agent A): wiki/raw/podcasts/ Lenny's episodes 1-60 → atomic cards + raw archive
- Batch 2 (agent B): wiki/raw/podcasts/ Lenny's episodes 61-127 → atomic cards + raw archive
- Target: 200+ insight cards + 127 raw files

### Phase 3 — Operator profiles + experts (~2hr)
- Ingest 138 expert profiles from artemis/knowledge/experts/
- Normalize against any duplicates from Phase 2
- Cross-link operator → insight cards

### Phase 4 — Articles + Gartner + LinkedIn (~2hr)
- 38 articles → atomic cards
- 14 Gartner reports → research-class cards
- 5 LinkedIn posts (complete the 3 stubs first)

### Phase 5 — Methodology layer (playbooks + skills) (~2hr)
- artemis/knowledge/playbooks/ → 15 playbook entries (promoted from cards, not duplicating)
- flywheel/skills/ → ~20 unique workflow cards
- DOCTRINE.md → distilled into ~5 cards
- team-brain unique workflows → ~8 cards

### Phase 6 — Synthesis + cross-linking (~3hr)
- Run dedupe pass (collapse Dunford/Schwartz/Pierri duplicates)
- Build patterns/ in synthesis/ (cross-operator convergences)
- Build contradictions/ (where operators disagree)
- Build coverage-matrix.md (which domains have N+ cards)
- Generate INDEX.md from all card frontmatter

### Phase 7 — Re-score legacy 504 (~2hr)
- Walk existing `01_thought-leaders/` and `02_domains/` (504 seeded insights)
- Re-score against new schema; promote to `insights/` if Tier C+, archive otherwise
- Or merge into operator profiles if duplicate

### Phase 8 — UI hand-off prep
- INDEX.md is build-friendly JSON-shaped
- Every card has consistent frontmatter
- Operator profiles + domain pages are auto-generatable from cards
- Hand off to UI agent (UI-BRIEF.md already in `docs/`)

## Filters (always applied)

**Drop:**
- JustCall customers, deals, pricing, ICP, battlecards, vertical playbooks
- SaaS Labs internal context, team names, Slack channels
- Career-ops, exit-clock, portfolio, applications
- Personal projects (miniu, nanoclaw, ghost-os, kurry, diggy, app-studio, oolala)
- Wiki content tied to a specific person's career arc

**Keep:**
- Operator-attributed wisdom transferable across companies
- Frameworks, playbooks, mental models with named author
- Verbatim quotes with timestamps from public sources
- Research findings with methodology + sample size

## Definition of done (whole corpus)
- Every card validates against `insight-card-schema.md`
- Every card has operator + source URL + date
- Every card is scored on 5 dimensions and tier-assigned
- Every card has at least one cross-reference where related cards exist
- INDEX.md is machine-readable (frontmatter-derived)
- Operator pages auto-list every card they authored
- Domain pages auto-list every card tagged to that domain
- No duplicate canonical claims (single source per framework, secondary refs link back)
- Nothing client-specific anywhere in the public-facing corpus

## Hand-off to UI agent
The UI agent reads:
- `00_meta/insight-card-schema.md` to understand the data model
- `INDEX.md` for the full corpus listing
- `operators/`, `domains/`, `insights/`, `synthesis/` for content
- `docs/UI-BRIEF.md` for design and motion direction

It does not need to understand source provenance — every card already carries its source. The UI is a citation surface, not an editor.
