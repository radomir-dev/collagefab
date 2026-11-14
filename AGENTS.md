# Guidelines

## Worktrees

When working on more than one thing at a time, put worktrees under `.slim/<short-name>`, never in `/tmp` and never outside the repository. `.slim/` and `.slim-*/` are gitignored, so those checkouts stay out of `git status`; skip `.slim/` when searching or globbing the repository root as well.

## Pull requests

Write PR descriptions like a lazy but talented developer who cannot be bothered: a sentence or two on what changed and why, then stop. No headings, no checklists, no bullet lists, no restating the diff — the code and the commits carry the detail.
