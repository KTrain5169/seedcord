---
'create-seedcord': minor
---

`create-seedcord` now asks for the servers to test your commands in, or reads them from `--testing-guilds`, and writes them to `TESTING_GUILD_IDS` in `.env`. The new `bot.ts` deploys commands to those servers and no longer sets `Envapter.baseDir` (#403).
