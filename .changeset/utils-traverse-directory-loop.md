---
'@seedcord/utils': minor
---

**BREAKING:** `@seedcord/utils/node` is gone, and its `traverseDirectory` is now `importFiles` from `@seedcord/utils` (#410). It takes only the folder and returns files for a `for await` loop, sorted by path. A plugin that wrote `await traverseDirectory(dir, (fullPath, relativePath, imported) => {})` should now write `for await (const { fullPath, relativePath, imported } of importFiles(dir)) {}`.
