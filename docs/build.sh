#!/usr/bin/env bash
set -euo pipefail
echo "docs build: static assets verified"
test -f docs/index.html && test -f docs/app.js && test -f docs/style.css && test -f docs/search-index.json
