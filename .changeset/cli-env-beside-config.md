---
'seedcord': minor
'@seedcord/gateway': minor
'@seedcord/http': minor
---

A built bot now reads its `.env` files from the folder that holds `seedcord.config.ts`, whichever folder you start it from. A bun binary, or a build copied away from its `seedcord.config.ts`, reads them from the folder you start it in. `bot.ts` no longer needs `Envapter.baseDir = resolve(import.meta.dirname, '..')`, though a `baseDir` you set there still wins.
