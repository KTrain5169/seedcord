---
'@seedcord/core': patch
'@seedcord/gateway': patch
'@seedcord/http': patch
---

Fixed `attach` rejecting a free key like `token` as already taken, as in `seedcord.attach('token', MyPlugin)` on an http bot.
