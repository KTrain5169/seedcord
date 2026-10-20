---
'seedcord': minor
'@seedcord/errors': minor
---

`seedcord build` now bundles an edge bot into `.cloudflare/output` for `cf deploy --prebuilt`, with the public key and command ids it reads from Discord written in. It then starts the worker once in workerd and stops with workerd's error when the worker fails to load. Every command in your code has to be deployed first, and an edge bot's config can't set `build.outDir` or `build.start`.
