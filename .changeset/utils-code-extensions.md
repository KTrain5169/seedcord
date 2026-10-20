---
'@seedcord/utils': minor
'seedcord': minor
'@seedcord/plugin-mongoose': minor
'@seedcord/plugin-kysely-postgres': minor
---

**BREAKING:** `importFiles`, and with it every handler, command, subscriber, service and migration folder, now loads `.tsx`, `.mts`, `.jsx` and `.mjs` files as well as `.ts` and `.js`. A stray `.mjs` file left in a handler folder starts loading too. `seedcord build` writes each one as a `.js` file and throws `CoreDuplicateName` for two files that would build to the same one, like `Roll.ts` and `Roll.tsx`.
