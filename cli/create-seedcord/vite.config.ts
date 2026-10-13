import { createTsdownConfig } from '@seedcord/tsdown-config';
import { createTestConfig } from '@seedcord/vitest-config';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    test: createTestConfig({
        environment: 'node',
        testTimeout: 20_000
    }),
    // every create call is a cold download
    pack: createTsdownConfig({
        entry: ['src/index.ts'],
        deps: { alwaysBundle: [/./], onlyBundle: false },
        format: ['esm'],
        dts: false
    })
});
