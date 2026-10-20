---
'@seedcord/utils': minor
'@seedcord/gateway': minor
'@seedcord/http': minor
---

Added `readFiles` for bots and plugins that read json, markdown, images, or other non-code files from a folder that `files` in `seedcord.config.ts` lists, in dev and in a built bot alike. Each file comes back as a `Buffer`, and `bytes.toString()` turns a text file into a string. `@seedcord/gateway` and `@seedcord/http` now export `readFiles` and `importFiles` too (#410).
