import { defineConfig } from 'vite-plus';

import { runEslint, runPrettier } from './scripts/src/lint-staged.ts';
import { createOxfmtConfig } from '@seedcord/eslint-config/oxfmt';

export default defineConfig({
    staged: {
        '*': runPrettier,
        '*.{ts,tsx,js,jsx,cjs,mjs}': runEslint
    },
    fmt: createOxfmtConfig({
        overrides: [{ files: ['*.yml', '*.yaml'], options: { tabWidth: 2 } }]
    })
});
