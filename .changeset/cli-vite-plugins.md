---
'seedcord': minor
'@seedcord/errors': minor
---

Added `vitePlugins` to `seedcord.config.ts`. `seedcord dev`, `build`, `codegen` and `commands` run the Vite plugins it returns on your bot's code, like `vitePlugins: () => [yaml()]` with `@rollup/plugin-yaml` for a command that imports a `.yaml` file. A plugin that throws stops the CLI with `CoreVitePluginThrew`, and one that rewrites Vite's `seedcord` environment away throws `CliViteEnvironmentMissing` (#406).
