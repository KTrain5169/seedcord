---
'seedcord': patch
---

Fixed `seedcord dev` skipping the restart prompt for an `hmr.restart` or plugin pattern written as `./config/**` or as an absolute path. Saving a matching file used to hot-reload it while the bot kept running on what it read from that file at startup.
