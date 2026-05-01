# Ingest Agent Prompts

Pre-written prompts for dispatching ingest sub-agents on each remaining batch. Each prompt is self-contained — the agent reads codex's protocol files and executes a defined batch. Spawn with `subagent_type: general-purpose` and `isolation: "worktree"` so multiple agents can write in parallel without collision.

**Always before dispatch:** the parent agent runs `node scripts/build-index.mjs` and pushes, so the dispatched agent starts from current state. After each agent completes, parent runs `build-index.mjs` again, dedupes, commits, pushes.

---

## Batch L1 — Lenny's Podcast, episodes A-K (~60 transcripts)

```
Read these first, in order:
- ~/projects/codex/insight-library/00_meta/thesis.md
- ~/projects/codex/insight-library/00_meta/INGEST-PROTOCOL.md
- ~/projects/codex/insight-library/00_meta/insight-card-schema.md
- ~/projects/codex/insight-library/00_meta/scoring-model.md
- ~/projects/codex/insight-library/00_meta/taxonomy.md
- ~/projects/codex/insight-library/INDEX.md

Source: `~/r2d2/wiki/raw/podcasts/lenny/` files where guest's last name starts with A through K (sorted alphabetically by filename, since filenames embed the guest name). Limit: 60 files.

For each transcript:
1. Read it. The wiki files often already have an extracted `## Load-bearing insights` or `## Insights` section — use those as the seed list of atomic claims, but rewrite each into codex schema with verbatim evidence quotes.
2. Skip the file if every claim it contains is JustCall-specific, career-ops, or restated common wisdom.
3. Archive raw to `~/projects/codex/insight-library/raw/podcasts/<operator-slug>--<episode-slug>--YYYY-MM-DD.md`.
4. For each atomic claim that passes the schema bar, write `~/projects/codex/insight-library/insights/ins_<slug>.md`. Slug from claim, not from operator.
5. For each operator, ensure `~/projects/codex/insight-library/operators/<operator-slug>/README.md` exists; create it if missing using the schema in INGEST-PROTOCOL.md § Step 6, or update its `## Cards` and `## Sources captured` sections if it exists.
6. Before writing each new card, grep `~/projects/codex/insight-library/insights/` for the central claim words to dedupe. If a near-duplicate exists, link via `related:` instead of writing a new card. If the new operator's framing adds substantively, write a card and reference the canonical.
7. Skip career-ops, personal-projects, JustCall customer details (see INGEST-PROTOCOL.md § Filters).
8. Score honestly. Tier C+ → ingest. Below → leave in raw only.

Aim for 4-8 cards per high-quality transcript, 1-2 per thinner one. Expected total: 200-400 cards across 60 files.

Commit after each operator's batch with message:
  ingest(<operator-slug>): <N> cards from Lenny's <episode-title>

Report back: counts per operator, dedupe collisions found, any transcripts skipped + why. Under 600 words.
```

---

## Batch L2 — Lenny's Podcast, episodes L-Z (~67 transcripts)

Same prompt as L1 but for guest last name L through Z.

---

## Batch A1 — Wiki articles + Gartner domain-agnostic (~52 files)

```
Read codex 00_meta/ files first (same list as L1).

Sources:
- `~/r2d2/wiki/raw/articles/*.md` (49 files)
- `~/r2d2/wiki/raw/articles/gartner/*.md` (26 files; KEEP ONLY domain-agnostic — see ROADMAP.md)

For Gartner, drop CCaaS-specific reports (magic-quadrant-ccaas, voice-of-the-customer-ccaas). Keep voice-AI, agentic-AI, sales-productivity, marketing-automation, positioning, and other transferable research.

Per source:
1. Archive raw to `raw/essays/` (articles), `raw/research/` (Gartner), `raw/threads/` (linkedin-style content).
2. Extract atomic claims per INGEST-PROTOCOL.md.
3. Author each card with operator attribution (Gartner reports get `operator: Gartner` with `operator_role: <Lead author or research org>`).
4. Dedupe against `insights/` and against any cards already written in the current session.
5. Update operator profiles. Multi-author Gartner reports get one shared operator entry per analyst.
6. Skip JustCall-competitive, career-ops, personal-project content.

Expected total: 80-150 cards.

Commit per article. Report back: counts, dedupe, skips. Under 600 words.
```

---

## Batch O1 — Operator profiles from Artemis experts (~138 profiles)

```
Read codex 00_meta/ files first (same list as L1).

Source: `~/Projects/artemis/knowledge/experts/*.md` (138 files).

These are existing operator profiles with YAML frontmatter (name, slug, expertise, perspective, sources_ingested). Translate each into codex's `operators/<slug>/README.md` schema.

Per file:
1. Read.
2. Check whether `operators/<slug>/README.md` already exists in codex. If yes, MERGE — preserve any cards already linked. If no, create.
3. Translate fields to codex schema (see operators/claire-vo/README.md for the canonical example).
4. Source URLs may be inferred from `sources_ingested:` arrays — if there's a primary URL for the operator (their blog, podcast, X, LI), include it. If not, omit external links rather than guess.
5. Do NOT extract atomic insight cards from artemis/ files. The expert profiles point to sources; cards come from those sources, which is a separate batch.
6. Filter: drop any expert whose substance is heavily JustCall-specific or career-ops. Keep cross-domain operators only.

Expected: 100-130 codex operator profiles after dedupe with existing.

Commit per ~10 profiles. Report back: created vs merged counts, drops + why, missing-source warnings. Under 600 words.
```

---

## Batch P1 — Methodology layer (Artemis playbooks + Flywheel skills + Team-brain workflows)

```
Read codex 00_meta/ files first (same list as L1).

Sources:
- `~/Projects/artemis/knowledge/playbooks/*.md` (15 files; all in scope)
- `~/r2d2/flywheel/skills/*/SKILL.md` (~31 files; strip JustCall examples)
- `~/r2d2/flywheel/DOCTRINE.md`, `~/r2d2/flywheel/CONSTITUTION.md`
- `~/r2d2/team-brain/workflows/*.md` (~32 files; HEAVY DEDUPE with artemis playbooks — single canonical only)

These are methodology documents, not operator transcripts. They become **playbook entries** in codex `playbooks/`, not insight cards. The atomic claims they contain often originate with named operators (Dunford, Schwartz, Pierri) — those should already be cards from prior batches; the playbook entry references the cards.

Per playbook:
1. Archive raw if there's a primary-source version (e.g., a Dunford essay) — usually skip, since these are syntheses.
2. Write `playbooks/<topic>/<slug>.md` with frontmatter:
   ```
   ---
   id: pb_<slug>
   title: <Short title>
   maintained_by: <name or "codex maintainers">
   captured_date: YYYY-MM-DD
   domain: [pmm, gtm, ...]
   uses_cards: [ins_<slug>, ins_<slug>, ...]
   ---
   ```
3. Body: sequenced steps + conditions + named cards inline. The playbook is a procedural document; insight cards are its atoms.
4. Run heavy dedupe: positioning appears 3-4x across sources. Pick the strongest source per topic, link the others.

Expected: 12-20 unique playbooks after dedupe.

Commit per playbook. Report back: dedupe collisions resolved, source preference rationale. Under 600 words.
```

---

## Batch S1 — Synthesis (cross-source patterns + contradictions + coverage matrix)

```
Read codex 00_meta/ files first (same list as L1).

Goal: build the synthesis layer ON TOP of the corpus once L1, L2, A1, O1, P1 are complete. Do NOT run this until all five prior batches are merged.

Tasks:
1. **Patterns** — group cards where 3+ operators say the same thing. For each pattern, write `synthesis/patterns/<topic>.md`:
   - `## Convergence` — the shared claim
   - `## Operators` — who said it, with card refs
   - `## Variation` — how each operator framed it differently
   - `## Implication` — what this convergence means

2. **Contradictions** — find pairs of cards that disagree. For each:
   - `synthesis/contradictions/<topic>.md`
   - `## Position A` (operator + card)
   - `## Position B` (operator + card)
   - `## Conditions distinguishing them` — when each applies

3. **Coverage matrix** — `synthesis/coverage-matrix.md` — a table: rows = lifecycle tags, columns = domains, cells = card count. Surface gaps.

4. **Index regen** — run `node scripts/build-index.mjs` after all synthesis is in.

Expected: 20-40 patterns, 5-15 contradictions, 1 coverage matrix.

Commit per synthesis file. Report back: gap list, top contradictions surfaced. Under 600 words.
```

---

## Batch L7 — Legacy promotion (the existing 504 cards in `legacy-batch/`)

```
Read codex 00_meta/ files first (same list as L1) plus:
- ~/projects/codex/insight-library/legacy-batch/README.md
- INGEST-PROTOCOL.md § "Legacy promotion"

Source: `~/projects/codex/insight-library/legacy-batch/01_thought-leaders/` and `02_domains/`.

Most legacy entries are stub-grade (lane-named slugs like aeo-01, ai-native-pmm-01, with generic operator names like "Rory Woodbridge"). Many will not pass the new schema bar.

Per legacy file:
1. Does it name a real, public operator? If not (e.g., "aeo-01" is a lane stub) → skip and leave archived.
2. Does it have a real source URL? If no, can one be found via web search? If still no → skip.
3. Run scoring. Tier C+ → promote. Otherwise leave archived.
4. Write a new `insights/ins_<slug>.md` with full schema. Note `legacy_origin: legacy-batch/<old-path>` in frontmatter for audit.
5. DEDUPE against insights already written in earlier batches. If duplicate, do NOT promote — link the legacy file as `legacy_origin` to the existing card.

Expected: 30-80 promotions out of 504. Most should remain archived.

Commit per ~10 promotions. Report back: promote counts by lane, top reasons for skip. Under 600 words.
```

---

## Dispatch order

Recommended sequence (parent must wait for prior batch to merge before dispatching the next):

1. **L1 + L2 in parallel** (both read-only on `~/r2d2/wiki/raw/podcasts/lenny/`, write to non-overlapping operator files)
2. Merge + index rebuild
3. **A1 + O1 in parallel** (different sources, non-overlapping)
4. Merge + index rebuild
5. **P1 alone** (playbooks reference cards from L1/L2/A1/O1; dedupe needs full corpus)
6. Merge + index rebuild
7. **L7 alone** (legacy promotion needs full corpus for dedupe)
8. Merge + index rebuild
9. **S1 alone** (synthesis is last; needs everything)

## Token-budget guidance

Each batch is 1-3 hours of agent time. Don't dispatch more than 2 in parallel (Kesava's rule). Pace dispatches across sessions; finishing the full corpus is a multi-session project, not a one-shot.
