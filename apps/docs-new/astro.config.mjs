// @ts-check

import { writeFileSync } from 'node:fs';

writeFileSync('C:/Users/KT/AppData/Local/Temp/opencode/hook-debug.log', 'config loaded');

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// the engine's dist loads its own files at module init (tsdoc reads its bundled schema through
// __dirname), which no bundle can carry. it stays external in the server build, which only
// prerenders: node loads it from node_modules with its own dependencies beside it. the adapter
// sets build.rolldownOptions.external to ['sharp'] in its own setup hook, which runs before
// this integration, so the regex appends rather than replaces
const docsEngineExternal = {
    name: 'docs-engine-external',
    'astro:config:setup': () => {
        writeFileSync('C:/Users/KT/AppData/Local/Temp/opencode/hook-debug.log', 'config:setup called');
    },
    'astro:build:setup': ({ vite, target }) => {
        writeFileSync(
            'C:/Users/KT/AppData/Local/Temp/opencode/hook-debug.log',
            JSON.stringify({
                target,
                external: vite.build.rolldownOptions?.external
            })
        );
        if (target !== 'server') return;
        vite.build.rolldownOptions.external = [
            ...(vite.build.rolldownOptions.external ?? []),
            /^@seedcord\/docs-engine(?:\/|$)/
        ];
    }
};

// the worker the deploy binds serves /docs/* urls against these base-relative keys, so the build
// carries no base of its own. the dev middleware rewrites /docs/* the same way
export default defineConfig({
    site: new URL(process.env.PUBLIC_SITE_URL ?? 'https://seedcord.org/docs').origin,
    base: '/docs',
    // docs urls never end in a slash, the root included
    trailingSlash: 'never',
    build: { format: 'file' },
    // every route prerenders. the worker entry the adapter emits answers only the paths no route owns
    output: 'static',
    // the routes read the local docs artifacts from disk while they generate, which workerd cannot.
    // the emitted worker owns none of them, so prerendering in node matches the runtime either way
    adapter: cloudflare({ prerenderEnvironment: 'node' }),
    integrations: [react(), mdx(), docsEngineExternal],
    // each link the old app hovered-prefetched on demand. the router prefetches the same way
    prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
    vite: {
        plugins: [tailwindcss()]
    },
    fonts: [
        {
            provider: fontProviders.google(),
            name: 'Space Grotesk',
            cssVariable: '--font-display',
            weights: ['300 700'],
            styles: ['normal'],
            subsets: ['latin']
        }
    ]
});
