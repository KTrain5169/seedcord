import { defineConfig } from 'vite-plus';

import { createOxfmtConfig } from '@seedcord/eslint-config/oxfmt';

import { runEslint } from './scripts/src/lint-staged.ts';

export default defineConfig({
    staged: {
        '*': 'vp fmt --no-error-on-unmatched-pattern',
        '*.{ts,tsx,js,jsx,cjs,mjs}': runEslint
    },
    fmt: createOxfmtConfig({
        overrides: [
            {
                files: ['*.yml', '*.yaml'],
                options: { tabWidth: 2 }
            },
            {
                // files: ['tooling/ui/**/*.{ts,tsx,json,md,css}'],
                files: [
                    'tooling/ui/**/*.ts',
                    'tooling/ui/**/*.tsx',
                    'tooling/ui/**/*.json',
                    'tooling/ui/**/*.md',
                    'tooling/ui/**/*.css'
                ],
                options: {
                    sortTailwindcss: { stylesheet: './tooling/ui/src/styles/globals.css' }
                }
            },
            {
                // files: ['apps/docs/**/*.{ts,tsx,json,md,css}'],
                files: [
                    'apps/docs/**/*.ts',
                    'apps/docs/**/*.tsx',
                    'apps/docs/**/*.json',
                    'apps/docs/**/*.md',
                    'apps/docs/**/*.css'
                ],
                options: {
                    sortTailwindcss: { stylesheet: './apps/docs/src/app/globals.css' }
                }
            },
            {
                // files: ['apps/home/**/*.{ts,tsx,json,md,css}'],
                files: [
                    'apps/home/**/*.ts',
                    'apps/home/**/*.tsx',
                    'apps/home/**/*.json',
                    'apps/home/**/*.md',
                    'apps/home/**/*.css'
                ],
                options: {
                    sortTailwindcss: { stylesheet: './apps/home/src/app/globals.css' }
                }
            },
            {
                // files: ['apps/guide/**/*.{ts,tsx,json,md,css}'],
                files: [
                    'apps/guide/**/*.ts',
                    'apps/guide/**/*.tsx',
                    'apps/guide/**/*.json',
                    'apps/guide/**/*.md',
                    'apps/guide/**/*.css'
                ],
                options: {
                    sortTailwindcss: { stylesheet: './apps/guide/src/app/globals.css' }
                }
            },
            {
                // 68 characters is what the 680px code column fits at the 1280px shell
                files: ['apps/guide/content/**/*.mdx'],
                options: { printWidth: 68 }
            }
        ]
    })
});
