import { createPrettierConfig } from '@seedcord/eslint-config/prettier';

const config = createPrettierConfig({ tailwind: { stylesheet: './src/styles/globals.css' } });

export default {
    ...config,
    plugins: [...config.plugins!, 'prettier-plugin-astro']
};
