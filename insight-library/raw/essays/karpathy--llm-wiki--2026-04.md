---
type: raw
source: gist
source_url: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
author: Andrej Karpathy
captured: 2026-04-11
attribution: verified
tags: [llm-wiki, karpathy, obsidian, pattern, memex]
---

# Karpathy — LLM Wiki (gist summary + notes)

> Archived here as the load-bearing citation for `wiki/CLAUDE.md`.
> Full content of the gist was fetched via WebFetch on 2026-04-11 and reduced
> to a structured outline below. For the original, read the gist directly.

## Source

`https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f`

## Structured outline

### Sections in the gist

1. LLM Wiki
2. The core idea
3. Architecture
4. Operations
5. Indexing and logging
6. Optional: CLI tools
7. Tips and tricks
8. Why this works
9. Note

### The core idea

- Traditional RAG rediscovers knowledge repeatedly rather than accumulating it.
- The LLM builds and maintains a persistent wiki instead of just retrieving
  documents.
- Knowledge compiles once and stays current, not re-derived per query.
- User sources and explores. LLM handles summarizing and cross-referencing.
- "The wiki is a persistent, compounding artifact" — cross-references,
  flagged contradictions, and synthesis already reflecting all consumed
  sources.
- Division of labor: humans curate sources, direct analysis, ask questions.
  LLMs handle everything else.

### Example use cases

- Personal tracking (goals, health, psychology) with journal entries
- Research deep-dives — evolving theses built incrementally from papers
- Book reading — chapter files, character pages, theme pages
- Business / team wikis — fed by Slack threads and meeting transcripts
- Competitive analysis, due diligence, trip planning, course notes

### Architecture — three layers

1. **Raw sources** — immutable curated documents (pdfs, articles, transcripts,
   screenshots, images). Never edited after landing.
2. **The wiki** — LLM-generated markdown files. The synthesis layer. Pages
   are re-edited freely as new sources land and reality changes.
3. **The schema** — a configuration document (`CLAUDE.md` or `AGENTS.md`)
   that defines structure, page conventions, and workflows. This is what
   makes the LLM a disciplined wiki maintainer instead of a generic chatbot.

### Operations

- **Ingest** — process new sources, update 10-15 related wiki pages, append
  to `log.md`.
- **Query** — search wiki pages and synthesize answers with citations.
  Valuable query outputs (comparisons, analyses) should be filed as new
  wiki pages rather than disappearing into chat history.
- **Lint** — periodic health check for contradictions, stale claims,
  orphaned pages, missing cross-references, data gaps.

### Indexing and logging

- `index.md` — content-oriented catalog organized by category. Lists all
  pages with summaries. Helps the LLM find relevant pages.
- `log.md` — append-only chronological record. Parseable prefixes (e.g.
  `## [2026-04-02] ingest | Article Title`) make it greppable. Tracks
  ingests, queries, and lint passes over time.

### Optional CLI tools

- `qmd` — local search engine with BM25 / vector search and LLM re-ranking.
  Useful once a wiki grows past what grep can handle.
- Custom search scripts for smaller wikis.

### Tips and tricks

- **Obsidian Web Clipper** — converts articles to markdown for the raw
  source collection.
- **Download images locally** — LLMs can reference them directly instead
  of relying on breakable URLs. Attachment folder (`raw/assets/`) keeps
  them colocated.
- **Obsidian graph view** — visualizes wiki structure, hub pages, and
  orphans.
- **Marp plugin** — markdown-based slide decks generated from wiki pages.
- **Dataview plugin** — creates dynamic tables and lists from YAML
  frontmatter.
- **Git version control** — automatic history, branching, collaboration.

### Why this works

- Maintenance burden (cross-references, consistency, contradiction tracking)
  has near-zero cost for LLMs versus humans.
- Spiritual ancestor: Vannevar Bush's Memex (1945). Bush imagined curated
  personal knowledge stores with associative document trails. He lacked a
  practical maintenance solution. LLMs provide that missing piece.
- Obsidian is the IDE. The LLM is the programmer. The wiki is the codebase.

### Note

- The gist describes a pattern, not a specific implementation. Users
  customize structure, schema, and tools per domain.
- All features are optional. Pick useful elements and ignore others.
- Share this document with your LLM agent and co-develop a version matching
  your use case.

## Files / paths mentioned in the gist

- `CLAUDE.md`
- `AGENTS.md`
- `index.md`
- `log.md`
- `raw/assets/`
- `qmd` (tool repository reference)

## Why this is archived here

`wiki/CLAUDE.md` cites this gist as the origin of Kesava's wiki schema.
The rules in `CLAUDE.md` adapt the pattern to Kesava's world: multi-harness
hygiene, operator voice, evidence ladder, exit clock, token budget, and
anti-fabrication. Anything in `CLAUDE.md` that looks generic came from here.
Anything that looks Kesava-specific is a local extension.

## History

- 2026-04-11 — captured via WebFetch, structured into this outline. The
  Karpathy gist site returned a length-limit warning on the verbatim
  request, so this file is a structured extract, not a byte-for-byte copy.
  Re-fetch if the gist is updated upstream.
