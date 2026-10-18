import { createVitestConfig } from '@seedcord/vitest-config';

export default createVitestConfig(import.meta.url, { test: { setupFiles: ['./tests/setup.ts'] } });
