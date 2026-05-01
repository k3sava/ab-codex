# Ingest Protocol — Codex

This protocol is the contract for any agent (human or LLM) ingesting content into codex. Read it before any ingest pass. If a step is unclear, stop and ask — do not improvise. Improvisation is how attribution drift starts.

## Pre-flight

Before reading any source, confirm you have:
- Read `00_meta/insight-card-schema.md` (the data model)
- Read `00_meta/scoring-model.md` (5-dim scoring + tier bands)
- Read `00_meta/taxonomy.md` (domain + lifecycle + maturity tags)
- Read `00_meta/thesis.md` (what codex is and is not)

If you can't say in one sentence what the operator argued and where they argued it, you are not ready to write a card.

## Step 1 — Archive raw

For every source you process, copy the original into `raw/<type>/<filename>.md`:
- `<type>` ∈ podcasts, essays, talks, threads, books, research
- Filename: `<operator-slug>--<title-slug>--YYYY-MM-DD.md`
- Frontmatter (raw):
  ```yaml
  source_type: podcast|essay|talk|thread|book|research
  source_title: <Title>
  source_url: <https://…>
  source_date: YYYY-MM-DD
  operators: [Name1, Name2]
  captured_date: YYYY-MM-DD
  license_note: <fair use | open license | author permission | unknown>
  ```
- Body: full text (or excerpt with link to canonical for long sources).

Raw is append-only. Never edit raw after capture. Corrections go in `raw/<path>.correction.md`.

## Step 2 — Extract atomic claims

Read the source and extract atomic claims. Rules:
- **One claim per card.** If you can split it into two with a "and also", split it.
- **Operator-grounded.** Every claim has a named operator. No "industry experts say" claims. No composite/synthesized voice.
- **Verbatim where possible.** If the operator stated the claim, use their wording in the `## Evidence` block (with timestamp for podcasts). The claim sentence may be reframed for clarity but must not change the meaning.
- **Skip restatements of common wisdom.** "Talk to customers" is not a claim. "Run 5 customer interviews per week, log them in a shared sheet, code 3 themes weekly" is a claim.
- **Skip hot takes.** Skip outrage, vibes, and pure opinion. Keep claims with a mechanism + at least one piece of evidence or condition.

Aim for 5-15 atomic claims per long-form source (60-90min podcast, 3000+ word essay). Fewer for short threads and posts.

## Step 3 — Write the card

Path: `insights/ins_<slug>.md`. Slug = short, kebab-case, claim-derived (e.g., `ins_agents-as-team-not-tools`, not `ins_claire-vo-1`).

Use the schema from `00_meta/insight-card-schema.md`. Required sections:
- `## Claim` — one sentence
- `## Mechanism` — why it works
- `## Conditions` — when it applies / when it doesn't
- `## Evidence` — verbatim quote, example, or data; timestamp if podcast
- `## Signals` — how to tell it's working
- `## Counter-evidence` — required for Tier A; optional otherwise
- `## Cross-references` — at least one if a related card exists

Frontmatter must be complete. Missing fields are not allowed.

## Step 4 — Score and tier

Score on 5 dimensions (1-5 each):
1. Originality
2. Operational specificity
3. Evidence depth
4. Transferability
5. Source integrity

Sum and map to band:
- 22-25 → Tier A
- 17-21 → Tier B
- 12-16 → Tier C
- <12 → do not ingest, leave in raw only

Be honest. A card with `score: { 5,5,5,5,5 }` should make you nervous unless the source is exceptional.

## Step 5 — Cross-link

Before saving, search `insights/` and `operators/` for related cards:
- Use grep on key terms from the claim and mechanism
- Check the operator's own existing card list
- Check the domain folder for the relevant domains

For each related card, add to `related:` frontmatter and reference in `## Cross-references`. Bidirectional — if you add `ins_a` → `ins_b`, edit `ins_b` to also reference `ins_a`.

## Step 6 — Update operator profile

Path: `operators/<operator-slug>/README.md`. If the operator has no profile yet, create one:

```markdown
---
name: <Full Name>
slug: <operator-slug>
roles: [<Role at Company1>, <Role at Company2>, ...]
domains_active: [product, gtm, ...]
captured_first: YYYY-MM-DD
---

# <Full Name>

## Bio
<3-5 sentences. Public-facing context. No personal speculation.>

## Operating themes
<2-4 themes the operator returns to across sources.>

## Cards
- ins_<slug> — <one-line claim summary> [Tier <X>]
- ...

## Sources
- <source title>, <date> — <raw path>
- ...

## External
- <link to operator's primary platform: their blog, podcast, X, LI>
```

Add the new card to the `## Cards` list (sorted by tier, then date).

## Step 7 — Update domain pages

Each domain in `domains/<domain>/README.md` is an auto-generatable index. For now, manually add the card under the relevant section. The Phase 6 generator will rebuild from frontmatter.

## Step 8 — Dedupe check

Before finalizing, confirm:
- This claim is not already in the corpus under another operator (check `synthesis/patterns/` for known convergences)
- If two operators say substantially the same thing, the canonical card goes to whoever said it first (or in the strongest source). The second operator gets a card that links to the canonical and notes the convergence.
- If the claim contradicts an existing card, write a `synthesis/contradictions/<topic>.md` entry and link both cards into it.

## Step 9 — Commit

Commit message format:
```
ingest(<operator-slug>): <N> cards from <source>

<source title>, <date>. Tier A: <N>. Tier B: <N>. Tier C: <N>.
```

One commit per source. Don't batch multiple sources unless they're a single thread.

## Filters (always applied)

**Drop:**
- Anything client-specific (real customer names, deals, internal channels)
- Career-ops, exit timelines, personal portfolio framing
- Personal projects (miniu, nanoclaw, ghost-os, kurry, diggy, app-studio, oolala)
- Wiki content tied to a specific person's career arc rather than transferable wisdom
- Vendor pitches dressed as insights (promotional content from companies about themselves)

**Keep:**
- Operator-attributed wisdom transferable across companies
- Frameworks, playbooks, mental models with a named author and source
- Verbatim quotes with timestamps from public sources
- Research findings with methodology + sample size

## Legacy promotion (for `legacy-batch/` content)

For each legacy stub:
1. Does it name a real operator and a real source? If not → skip.
2. Run it through Step 4 scoring. Tier C+ → promote. Otherwise archive in place.
3. If promoted, rewrite to full schema (Step 3). Source URL is mandatory; if missing, find it or skip.
4. Cross-link to existing operator profile and domain.
5. Note `legacy_origin: <old-path>` in frontmatter for audit.

## Anti-patterns

Watch for these. They're how a corpus rots:
- ❌ "Operators agree that…" — there is no "operators". There are named individuals.
- ❌ Restating an idea in your own voice when you could quote — quote.
- ❌ Composite claims like "the modern PMM should…" — that's an editorial, not a claim.
- ❌ Round numbers without sources ("60% of PMs…").
- ❌ Cards without conditions — every claim has a context where it fails.
- ❌ Tier A without counter-evidence — strong claims must have known limits.
- ❌ Multiple "claims" stacked into one card — split.
