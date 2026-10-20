---
'seedcord': minor
'@seedcord/errors': minor
---

**BREAKING:** `seedcord commands --clean` is now `seedcord commands clean`, with `--guilds` for `--guild` and `--yes` for `--apply`, and `--purge` moved to `seedcord commands purge`. With flags, `clean` lists what it would delete until you pass `--yes`, however many guilds the bot is in. With no flags in a terminal it opens a wizard, and a bare `seedcord commands` asks whether to deploy, list, clean or purge.
