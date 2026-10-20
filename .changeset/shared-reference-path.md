---
'@seedcord/utils': patch
---

Fixed `filterCirculars` printing a child that two fields share as `[Circular]`. Both fields now show that child's contents, in `decycle` and `json` mode.
