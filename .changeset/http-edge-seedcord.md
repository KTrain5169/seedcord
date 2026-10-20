---
'@seedcord/http': minor
'@seedcord/errors': minor
---

Added edge bots for Cloudflare Workers, made with `new Seedcord(config)` from `@seedcord/http` through the `workerd` export condition and able to take plugins like a node bot. An edge bot reads its public key, command ids and emoji ids from the worker `seedcord build` wrote, and throws `CoreEdgeUnbuilt` on its first POST when built some other way. Removed `createSeedcord`, the `Manifest` type, and the `@seedcord/http/edge` and `@seedcord/http/manifest` subpaths.
