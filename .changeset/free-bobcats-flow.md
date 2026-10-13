---
'create-seedcord': patch
---

Fixed every `pnpm install` failing with `ERR_PNPM_IGNORED_BUILDS` in a bot scaffolded with pnpm. The scaffold now writes a `pnpm-workspace.yaml` that skips the `unrs-resolver` install script.
