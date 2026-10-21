---
'@seedcord/core': patch
---

Fixed the health check rejecting with node's raw `EADDRINUSE` when its port is taken. It now throws `PortInUse`.
