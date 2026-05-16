#!/usr/bin/env bash
# build-all.sh — local equivalent of the GitHub Pages CI build pipeline.
# Run after editing any .md in insight-library/ to refresh docs/ end-to-end.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ validate corpus"
node scripts/validate.mjs
echo "→ voice-lint (informational; set STRICT=1 to gate)"
node scripts/voice-lint.mjs | tail -5 || true
echo "→ stage corpus into docs/"
mkdir -p docs/insight-library
rm -rf docs/insight-library/insights docs/insight-library/operators docs/insight-library/synthesis docs/insight-library/playbooks docs/insight-library/daily docs/insight-library/00_meta 2>/dev/null || true
cp insight-library/INDEX.json docs/insight-library/INDEX.json 2>/dev/null || true
cp insight-library/INDEX.md docs/insight-library/INDEX.md 2>/dev/null || true
cp insight-library/latest.json docs/insight-library/latest.json 2>/dev/null || true
cp -r insight-library/insights docs/insight-library/
cp -r insight-library/operators docs/insight-library/
cp -r insight-library/synthesis docs/insight-library/
cp -r insight-library/playbooks docs/insight-library/
cp -r insight-library/daily docs/insight-library/
[ -d insight-library/00_meta ] && cp -r insight-library/00_meta docs/insight-library/ || true
echo "→ build-index"
node scripts/build-index.mjs
echo "→ stage refreshed index files"
cp insight-library/INDEX.json docs/insight-library/INDEX.json
cp insight-library/INDEX.md docs/insight-library/INDEX.md
cp insight-library/latest.json docs/insight-library/latest.json 2>/dev/null || true
echo "→ build-static"
node scripts/build-static.mjs
echo "→ build-og (per-page OG images)"
node scripts/build-og.mjs
echo "→ build-feeds"
node scripts/build-feeds.mjs
echo "✓ done"
