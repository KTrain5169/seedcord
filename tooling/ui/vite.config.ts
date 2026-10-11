import { createOxfmtConfig } from '@seedcord/eslint-config/oxfmt';
import { createTsdownConfig } from '@seedcord/tsdown-config';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    pack: createTsdownConfig({
        entry: ['src/**/*.{ts,tsx}'],
        format: ['esm'],
        platform: 'neutral',
        shims: false,
        target: 'esnext',
        dts: true,
        unbundle: true
    }),
    fmt: createOxfmtConfig({
        tailwind: { stylesheet: './src/styles/globals.css' }
    })
});
