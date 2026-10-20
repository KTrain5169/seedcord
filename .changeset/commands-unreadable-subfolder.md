---
'seedcord': minor
'@seedcord/errors': minor
---

**BREAKING:** The command scan in `seedcord codegen`, `dev`, `build` and `commands` now throws `CorePathUnreadable` on any folder under your commands path it can't read. It used to skip a subfolder with a warning. A class with `@RegisterCommand` whose component is not a command now throws the new `CliCommandNotACommand`.
