// @ts-check
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
// eslint-disable-next-line import-x/no-rename-default
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';


// https://astro.build/config
export default defineConfig({
    output: 'static',
    trailingSlash: 'always',
    integrations: [sitemap(), react()],
    adapter: cloudflare(),

    fonts: [
        {
            provider: fontProviders.google(),
            name: 'JetBrains Mono',
            cssVariable: '--font-mono',
            subsets: ['latin'],
            display: 'swap'
        },
        {
            provider: fontProviders.google(),
            name: 'Space Grotesk',
            cssVariable: '--font-display',
            subsets: ['latin'],
            display: 'swap'
        }
    ],

    vite: {
        plugins: [tailwindcss()]
    }
});
