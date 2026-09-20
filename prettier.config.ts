import { createPrettierConfig } from '@seedcord/eslint-config/prettier';

export default createPrettierConfig({
    overrides: [{ files: '*.{yml,yaml}', options: { tabWidth: 2 } }]
});
