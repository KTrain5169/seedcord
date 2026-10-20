---
'create-seedcord': minor
'@seedcord/errors': patch
---

A failed step in `create-seedcord` now prints the command that failed in bold and its output in color under its row, with stack frames left out. Pass `--verbose` to show them.
