---
'@seedcord/core': patch
'@seedcord/errors': patch
---

Fixed a guild command deploy that Discord refused with a 401 telling you to check the guild id. The error now shows Discord's reason and tells you to check `DISCORD_BOT_TOKEN`.
