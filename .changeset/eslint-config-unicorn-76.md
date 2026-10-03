---
'@seedcord/eslint-config': minor
---

Because `eslint-plugin-unicorn` 76 widened its early-return and grouping rules, lint now flags an `if` that wraps the rest of a function or loop body. It also flags a `for...of` loop that pushes items into a `Map` of arrays.
