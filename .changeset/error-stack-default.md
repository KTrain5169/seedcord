---
'@seedcord/types': patch
'@seedcord/core': patch
'@seedcord/gateway': patch
'@seedcord/http': patch
---

An unknown fault now prints its whole stack in your terminal, since `errors.errorStack` defaults to `true`. Set `errorStack: false` for the one-line log.
