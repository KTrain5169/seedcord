---
'@seedcord/plugin-drizzle': minor
'@seedcord/errors': patch
---

Adds `@seedcord/plugin-drizzle`, a database plugin that holds your Drizzle ORM instance from any driver, runs an optional `migrate` callback on startup, and loads `@RegisterDrizzleService` classes. `criticalFiles` marks schema and migration paths for a full dev restart so migrations rerun. Adds the `PluginDrizzle*` error codes it throws.
