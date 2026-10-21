---
'@seedcord/core': patch
---

Health checks now report a configured port conflict as `PortInUse` while preserving the underlying listen error as its cause.
