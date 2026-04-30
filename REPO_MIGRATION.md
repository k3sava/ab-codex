# Repository Migration: `ttc` -> `codex`

This branch content has been migrated into a new local repository:

- Source: `/workspace/ttc`
- Target: `/workspace/codex`
- Target repo default branch: `main`

## Migration method
- Copied all files excluding `.git` from source to target.
- Initialized a new Git repository in `/workspace/codex`.
- Created initial commit with imported content.

## Verification commands
- `git -C /workspace/codex status --short`
- `git -C /workspace/codex log --oneline -n 1`
