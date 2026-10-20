---
'@seedcord/utils': minor
'@seedcord/core': minor
'seedcord': minor
'@seedcord/plugin-mongoose': minor
'@seedcord/plugin-kysely-postgres': minor
---

**BREAKING:** `importFiles` now skips dotfiles, dot-folders, `node_modules`, `outDir` and the logs folder, the same way a built bot does. That covers handler, command and service folders, the command scan in `seedcord codegen` and `commands`, and hot reload in `seedcord dev`. Move a handler out of a folder like `.drafts/` to keep it loading.
