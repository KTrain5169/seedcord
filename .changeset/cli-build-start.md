---
'seedcord': minor
---

**BREAKING:** `entry` in `seedcord.config.ts` is now `build.start`, like `build: { start: './index.ts' }`, and `build.bootstrap` is gone (#359). The built entry is always `index.mjs` in `outDir`, and without `build.start` it default exports the bot, typed by `index.d.mts`, for your own node app to import and start. An http bot run this way should set `port: false` and pass each request from your app to `bot.fetch()`.
