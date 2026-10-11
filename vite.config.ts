import { defineConfig } from 'vite-plus';

import { runEslint } from './scripts/src/lint-staged.ts';
import { createOxfmtConfig } from '@seedcord/eslint-config/oxfmt';

export default defineConfig({
    staged: {
        '*': 'vp fmt --no-error-on-unmatched-pattern',
        '*.{ts,tsx,js,jsx,cjs,mjs}': runEslint
    },
    fmt: createOxfmtConfig({
        overrides: [
            { files: ['*.yml', '*.yaml'], options: { tabWidth: 2 } },
            {
                files: ['tooling/ui/**/*.{ts,tsx,json,md,css}'],
                options: {
                    sortTailwindcss: { stylesheet: './tooling/ui/src/styles/globals.css' }
                }
            }
        ]
    })
});
