---
'seedcord': patch
---

Fixed `seedcord dev` leaving the interactions endpoint on the old application when you change the bot token. A restart now sets the tunnel's URL on the new token's application if it has changed.
