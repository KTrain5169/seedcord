---
'seedcord': minor
'@seedcord/errors': minor
---

A `cloudflare.config.ts` beside `seedcord.config.ts` now makes the bot an edge bot. It needs `cf` and `@cloudflare/vite-plugin` installed, Node compat on, and `"customConditions": ["workerd"]` in its tsconfig, and the CLI loads it under Cloudflare's `workerd` conditions with `env` from `cloudflare:workers` filled from your local env files. A stray `cloudflare.config.ts` or `workerd` condition in a node bot stops the CLI with an error that points at it.
