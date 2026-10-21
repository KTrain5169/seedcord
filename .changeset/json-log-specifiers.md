---
'@seedcord/logger': patch
---

Fixed the JSON log format writing `logger.info('ran %s', 'ping')` with `ran %s` as its message. It now writes `ran ping`, and `extras` holds only the arguments left over after the specifiers.
