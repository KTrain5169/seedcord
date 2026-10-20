---
'@seedcord/utils': patch
---

Fixed `formatFilePath` printing backslashes on Windows. It now prints `./src/bot.ts` where it printed `.\src\bot.ts`.
