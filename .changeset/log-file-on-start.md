---
'seedcord': patch
'@seedcord/core': patch
'@seedcord/gateway': patch
'@seedcord/http': patch
---

Fixed `seedcord codegen`, `seedcord build`, and `seedcord commands` each writing a log file under `logs/` in development. A bot now applies its `logger` config, along with the default log file, when `start()` runs.
