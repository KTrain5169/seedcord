// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  integrations: [react(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});