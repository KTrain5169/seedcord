---
'seedcord': minor
'@seedcord/errors': minor
---

When `seedcord.config.ts` has two or more missing or invalid fields, the CLI now lists all of them in one `CliProblems` error, like a config with no `instance` and a `tunnel` of `'yes'`. `seedcord codegen` does the same for command files whose constructors throw, like `ban.ts` and `roll.ts` in one run.
