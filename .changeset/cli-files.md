---
'seedcord': minor
'@seedcord/utils': minor
'@seedcord/errors': minor
---

Added `files` to `seedcord.config.ts`, like `files: ['./locales']`, for the folders a built bot reads through `readFiles`. `seedcord build` bundles non-code files from only those folders, binary files included, and `readFiles` throws `CoreDirectoryNotListed` for a folder `files` leaves out. A listed folder that is missing or is a file throws `CliListedFolderUnusable`, and one the build skips, like a dot-folder, throws `CoreDirectorySkipped`.
