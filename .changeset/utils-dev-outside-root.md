---
'@seedcord/utils': minor
'seedcord': minor
---

**BREAKING:** Under `seedcord dev` and in a built bot, `importFiles` now throws `CorePathOutsideRoot` for a folder outside `root`. `importFiles` and `readFiles` throw `CoreDirectorySkipped` for a folder that `seedcord build` leaves out of the bot, like `./locales/.cache`, and `seedcord codegen`, `build` and `commands` run the same checks on the folders in your config.
