import path from 'node:path';

import createConfig from '@seedcord/eslint-config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';

import type { ESLint, Linter } from 'eslint';

// justified: exactOptionalPropertyTypes rejects this plugin's RuleModule type
const reactCompilerConfig = reactCompiler.configs.recommended as Linter.Config;
// justified: ESLint's Plugin type rejects this plugin's nested configs.flat
const reactHooksPlugin = reactHooks as ESLint.Plugin;

export default createConfig({
    tsconfigRootDir: import.meta.dirname,
    registerImportPlugin: 'fast',
    registerTypescriptConfigs: false,
    // unicorn needs eslint 10.4 or newer. this app runs eslint 9.
    registerUnicornPlugin: false,
    tailwindEntryPoint: path.resolve(import.meta.dirname, 'src/styles/globals.css'),
    userConfigs: [
        reactCompilerConfig,

        // react-doctor already covers the jsx-a11y strict set
        {
            files: ['src/**/*.{ts,tsx}'],
            plugins: { 'jsx-a11y': jsxA11y, react, 'react-hooks': reactHooksPlugin },
            rules: {
                'jsx-a11y/alt-text': ['error', { elements: ['img'], img: ['Image'] }],
                'react/jsx-no-target-blank': 'error',
                'react-hooks/exhaustive-deps': 'error',
                'import-x/no-anonymous-default-export': 'error',
                'import-x/no-default-export': 'error',
                'react/forbid-elements': [
                    'error',
                    {
                        forbid: [
                            { element: 'button', message: 'use Button from @seedcord/ui' },
                            { element: 'input', message: 'use Input from @seedcord/ui' },
                            { element: 'select', message: 'use Dropdown from @seedcord/ui' }
                        ]
                    }
                ]
            }
        },

        {
            files: [
                'src/app/**/{page,layout,loading,error,global-error,not-found,template,default,route,sitemap,robots,manifest}.{ts,tsx}',
                'src/app/**/{icon,apple-icon,opengraph-image,twitter-image}.{ts,tsx}',
                'src/{middleware,instrumentation}.{ts,tsx}'
            ],
            rules: { 'import/no-default-export': 'off' }
        },

        { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] }
    ]
});
