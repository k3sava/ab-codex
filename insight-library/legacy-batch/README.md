# Legacy Batch — 504 Seeded Insights (pre-2026-05-01)

This directory holds the original scaffold from the ttc-branch ingest, before codex was rescoped as a cross-domain primary-source corpus.

## Why archived
The original cards were:
- Bulk-generated stubs (limited primary-source attribution)
- Scoped to PMM/GTM/AEO only
- Scored against an OS-alignment dimension that no longer exists in the new schema

## Disposition
- **Re-score and promote** any card that already has primary-source attribution. Move to `insights/` with new ID and full schema compliance.
- **Merge into operator profiles** any card that is really an operator-attributed claim (move to `operators/<slug>/` index).
- **Archive** everything else here. Public-facing UI does not surface this directory.

## Subdirs preserved
- `01_thought-leaders/` — thought leader stubs by lane
- `02_domains/` — domain-shaped stubs
- `03_synthesis/` — early synthesis attempts (batch-progress-counter, comb-library-map, etc.)
- `04_playbooks/` — early playbook stubs
- `05_application-to-your-os/` — original consumption-layer docs (now in `00_meta/ROADMAP.md` Phase 8)

## Re-scoring protocol
See `00_meta/INGEST-PROTOCOL.md` § "Legacy promotion".
