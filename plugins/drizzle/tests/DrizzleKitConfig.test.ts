import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { inferCriticalFiles, toCriticalPattern } from '#src/DrizzleKitConfig';

import { TestEnvironment } from './utils/test-env';

import type { Logger } from '@seedcord/logger';

describe('drizzle-kit config', () => {
    let testEnv: TestEnvironment;
    let root: string;
    let logger: Logger;

    beforeEach(async () => {
        testEnv = new TestEnvironment('drizzle-kit-config-');
        await testEnv.setup();
        root = testEnv.rootDir;
        // justified: the module only calls debug, so that is the whole surface it needs
        logger = { debug: vi.fn() } as unknown as Logger;
    });

    afterEach(async () => {
        await testEnv.teardown();
        vi.clearAllMocks();
    });

    async function writeConfig(name: string, body: string): Promise<void> {
        await testEnv.createFile(name, body);
    }

    describe('toCriticalPattern', () => {
        it('drops the leading ./ the runtime cannot match', async () => {
            await expect(toCriticalPattern('./src/schema.ts', root)).resolves.toBe('src/schema.ts');
        });

        it('matches a folder through its contents', async () => {
            await expect(toCriticalPattern('./drizzle', root)).resolves.toBe('drizzle/**');
        });

        it('treats a path with no extension as a folder even when it does not exist', async () => {
            await expect(toCriticalPattern('./migrations', root)).resolves.toBe('migrations/**');
        });

        it('keeps a path that already holds a wildcard as written', async () => {
            await expect(toCriticalPattern('./src/**\/*.ts', root)).resolves.toBe('src/**/*.ts');
        });

        it('rewrites an absolute path as one relative to the project root', async () => {
            await testEnv.createFile('migrations/0000_init.sql', 'select 1;');

            await expect(toCriticalPattern(testEnv.resolvePath('migrations'), root)).resolves.toBe('migrations/**');
        });

        it('normalizes windows separators', async () => {
            await expect(toCriticalPattern('.\\src\\schema.ts', root)).resolves.toBe('src/schema.ts');
        });
    });

    describe('inferCriticalFiles', () => {
        it('infers the schema and the migrations folder from the config', async () => {
            await writeConfig('drizzle.config.ts', `export default { schema: './src/schema.ts', out: './drizzle' };`);

            await expect(inferCriticalFiles(root, logger)).resolves.toEqual(['src/schema.ts', 'drizzle/**']);
        });

        it('infers every entry when the schema is a list', async () => {
            await writeConfig(
                'drizzle.config.ts',
                `export default { schema: ['./src/schema.ts', './src/extra.ts'], out: './drizzle' };`
            );

            await expect(inferCriticalFiles(root, logger)).resolves.toEqual([
                'src/schema.ts',
                'src/extra.ts',
                'drizzle/**'
            ]);
        });

        it('prefers the first config name when several exist', async () => {
            await writeConfig('drizzle.config.ts', `export default { out: './from-ts' };`);
            await writeConfig('drizzle.config.js', `export default { out: './from-js' };`);

            await expect(inferCriticalFiles(root, logger)).resolves.toEqual(['from-ts/**']);
        });

        it('infers nothing when there is no config', async () => {
            await expect(inferCriticalFiles(root, logger)).resolves.toEqual([]);
        });

        it('infers the schema when the config names no out path', async () => {
            await writeConfig('drizzle.config.ts', `export default { schema: './src/schema.ts' };`);

            await expect(inferCriticalFiles(root, logger)).resolves.toEqual(['src/schema.ts']);
        });

        it('reads a config that exports a factory', async () => {
            await writeConfig('drizzle.config.ts', `export default () => ({ out: './drizzle' });`);

            await expect(inferCriticalFiles(root, logger)).resolves.toEqual(['drizzle/**']);
        });

        it('infers nothing when the config has no default export', async () => {
            await writeConfig('drizzle.config.ts', `export const config = { out: './drizzle' };`);

            await expect(inferCriticalFiles(root, logger)).resolves.toEqual([]);
        });

        it('ignores a schema entry that is not a path', async () => {
            await writeConfig('drizzle.config.ts', `export default { schema: 42, out: './drizzle' };`);

            await expect(inferCriticalFiles(root, logger)).resolves.toEqual(['drizzle/**']);
        });

        it('survives a config that throws while loading', async () => {
            await writeConfig('drizzle.config.ts', `throw new Error('no DATABASE_URL');`);

            await expect(inferCriticalFiles(root, logger)).resolves.toEqual([]);
            expect(logger.debug).toHaveBeenCalledOnce();
        });
    });
});
