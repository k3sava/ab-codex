# codex docs site

This `docs/` directory is the deployable static site used by GitHub Pages.

## Build pipeline

- Content source of truth remains `insight-library/**/*.md`.
- This first pass includes 5 designed cards manually curated from the corpus in `insight-library/01_thought-leaders/*/insights.md`.
- `docs/build.sh` is the build check script used in CI to validate deployable assets exist.
- Existing `.github/workflows/pages.yml` can run `bash docs/build.sh` before publish.

## Add a new card

1. Add or update insight content in `insight-library` matching the schema in `insight-library/00_meta/insight-card-schema.md`.
2. Add card metadata to `docs/app.js` in the `cards` array (`id`, `operator`, `source`, `claim`, mechanism and conditions blocks). Use GitHub blob URLs for `source_url` so source links work in Pages artifacts.
3. Add matching searchable entry to `docs/search-index.json`.
4. Link related cards using `related` ids for graph edges.
5. Run `bash docs/build.sh` and commit.

## Routes

- `#/` home
- `#/ins/<id>` insight card
- `#/o/<operator>` operator page
- `#/d/<domain>` domain view
- `#/graph` graph view
- `#/about` about
