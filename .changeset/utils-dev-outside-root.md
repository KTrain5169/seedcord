---
'@seedcord/utils': minor
'seedcord': minor
---

**BREAKING:** Under `seedcord dev` and in a built bot, `importFiles` and `readFiles` now throw `CorePathOutsideRoot` for a folder outside `root`, and `CoreDirectorySkipped` for a folder that `seedcord build` leaves out of the bot, like `./locales/.cache`. `seedcord codegen`, `build` and `commands` run the same checks on the folders in your config.
