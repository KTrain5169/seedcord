---
'seedcord': minor
'@seedcord/errors': minor
---

**BREAKING:** `seedcord build` now bundles the bot with Vite and empties `outDir` before it writes. It throws `CliBuildOutDirNotEmpty` when `outDir` holds anything other than an earlier `seedcord build`, like the `dist` an older version wrote. Delete that folder once after you upgrade.
