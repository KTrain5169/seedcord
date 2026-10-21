---
'@seedcord/eslint-config': patch
---

Fixed every file failing to lint with `Cannot find module '@typescript-eslint/parser'` when your package manager didn't hoist that parser, like pnpm with `hoist: false`.
