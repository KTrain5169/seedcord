---
'@seedcord/plugin-drizzle': minor
'@seedcord/errors': patch
---

Adds `@seedcord/plugin-drizzle`, a database plugin that holds your Drizzle ORM instance from any driver, runs an optional `migrate` callback on startup, and loads `@RegisterDrizzleService` classes. `criticalFiles` marks schema and migration paths for a full dev restart so migrations rerun, and a drizzle-kit config in the project root now contributes its `schema` and `out` paths on its own. Adds the `PluginDrizzle*` error codes it throws.
