---
'@seedcord/plugin-kysely-postgres': patch
---

Fixed `migrateDown({ steps: 3 })` skipping the same migration three times when the newest applied one has no `down`. It now logs that migration as skipped once and stops.
