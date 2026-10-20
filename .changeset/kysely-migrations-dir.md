---
'@seedcord/plugin-kysely-postgres': minor
---

**BREAKING:** `migrations.path` is now `migrations.dir`, and the plugin now runs the migrations in its subfolders too. Every code file in it has to export `up` by name or on a default export object, or the plugin throws `PluginKyselyInvalidMigrationModule`, and `down` is now optional. A `.cjs` or `.cts` migration no longer loads.
