---
'@seedcord/logger': patch
---

Fixed an `Error` in a JSON log's `extras` coming out as just `{"name":"TypeError"}`. It now carries its `message` and `stack` too.
