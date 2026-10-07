import path from 'node:path';

import createConfig from '@seedcord/eslint-config';
import reactCompiler from 'eslint-plugin-react-compiler';
import eslintPluginAstro from 'eslint-plugin-astro';

import type { Linter } from 'eslint';

// exactOptionalPropertyTypes rejects this plugin's RuleModule type
const reactCompilerConfig = reactCompiler.configs.recommended as Linter.Config;

export default createConfig({
    tsconfigRootDir: import.meta.dirname,
    registerImportPlugin: 'off',
    registerTypescriptConfigs: false,
    // unicorn needs eslint 10.4 or newer. this app runs eslint 9
    registerUnicornPlugin: false,
    tailwindEntryPoint: path.resolve(import.meta.dirname, 'src/styles/globals.css'),
    userConfigs: [
        reactCompilerConfig,

        // react-doctor already covers the jsx-a11y strict set
        {
            files: ['src/**/*.{ts,tsx}'],
            rules: {
                'jsx-a11y/alt-text': ['error', { elements: ['img'], img: ['Image'] }],
                'react/jsx-no-target-blank': 'error',
                'react-hooks/exhaustive-deps': 'error',
                'import/no-anonymous-default-export': 'error',
                'import/no-default-export': 'error',
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
            settings: {
                "import/core-modules": ["astro:content", "astro:transitions"],
                "import/parsers": {
                    "astro-eslint-parser": [".astro"],
                    "espree": [".js", ".mjs", ".cjs"],
                    "@typescript-eslint/parser": [".ts", ".tsx"]
                }
            }
        },

        { ignores: ['.wrangler/**', '.preview/**', 'build/**'] }
    ]
});
