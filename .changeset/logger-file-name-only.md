---
'@seedcord/logger': minor
'@seedcord/errors': minor
---

**BREAKING:** `WinstonFileSink` now always writes inside the `logs` folder beside `seedcord.config.ts`, and `filename` takes only a file name. Change `filename: 'logs/bot-{date}.log'` to `filename: 'bot-{date}.log'`. A name with a folder in it throws the new `LoggerFileNameHasFolder`.
