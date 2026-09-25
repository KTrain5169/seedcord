import { Plugin } from '@seedcord/core/plugin';
import { SeedcordErrorCode } from '@seedcord/errors';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { Drizzle } from '#src/Drizzle';

import { createFakeDb } from './utils/fake-db';
import { pluginsPath } from './utils/source-path';
import { TestEnvironment } from './utils/test-env';

import type { DrizzleOptions } from '#src/types/DrizzleOptions';
import type { FakeDb } from './utils/fake-db';
import type { CoreBase } from '@seedcord/core';

describe('Drizzle lifecycle', () => {
    let testEnv: TestEnvironment;
    let mockCore: CoreBase;
    let db: FakeDb;

    beforeEach(async () => {
        testEnv = new TestEnvironment('drizzle-lifecycle-');
        await testEnv.setup();
        await testEnv.createFile('services/.keep', '');
        // the plugin reads nothing off core, this only satisfies the constructor
        mockCore = { config: {} } as unknown as CoreBase;
        db = createFakeDb();
    });

    afterEach(async () => {
        await testEnv.teardown();
        vi.clearAllMocks();
    });

    function build(overrides?: Partial<DrizzleOptions>): Drizzle {
        return new Drizzle(mockCore, {
            db,
            dir: testEnv.resolvePath('services'),
            ...overrides
        });
    }

    it('throws when services is read before init', () => {
        const plugin = build();

        expect(() => plugin.services).toThrow(
            expect.objectContaining({ code: SeedcordErrorCode.PluginDrizzleServicesNotReady })
        );
    });

    it('exposes the passed instance as the connection once init resolves', async () => {
        const plugin = build();

        await plugin.init();

        expect(plugin.connection).toBe(db);
        expect(plugin.services).toEqual({});
    });

    it('keeps the same connection across repeated init calls', async () => {
        const plugin = build();

        await plugin.init();
        const first = plugin.connection;
        await plugin.init();

        expect(plugin.connection).toBe(first);
    });

    it('shares one init across racing callers and runs migrate once', async () => {
        const migrate = vi.fn();
        const plugin = build({ migrate });

        await Promise.all([plugin.init(), plugin.init()]);

        expect(migrate).toHaveBeenCalledTimes(1);
    });

    it('runs the migrate callback before loading services', async () => {
        const order: string[] = [];
        (globalThis as { drizzleOrder?: string[] }).drizzleOrder = order;
        try {
            await testEnv.createFile(
                'services/UserService.ts',
                `
                import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

                (globalThis.drizzleOrder as string[]).push('service');

                @RegisterDrizzleService('users')
                export class UserService extends DrizzleService {}
                `
            );

            const plugin = build({
                migrate: () => {
                    order.push('migrate');
                }
            });

            await plugin.init();

            expect(order).toEqual(['migrate', 'service']);
            expect(plugin.services).toHaveProperty('users');
        } finally {
            delete (globalThis as { drizzleOrder?: string[] }).drizzleOrder;
        }
    });

    it('wraps a migrate failure in PluginDrizzleMigrationFailed', async () => {
        const failure = new Error('migration exploded');
        const plugin = build({
            migrate: () => {
                throw failure;
            }
        });

        const caught = await plugin.init().catch((error: unknown) => error);

        expect(caught).toMatchObject({ code: SeedcordErrorCode.PluginDrizzleMigrationFailed, cause: failure });
    });

    it('leaves no services behind when migrate fails', async () => {
        const plugin = build({
            migrate: () => {
                throw new Error('migration exploded');
            }
        });

        await expect(plugin.init()).rejects.toThrow(
            expect.objectContaining({ code: SeedcordErrorCode.PluginDrizzleMigrationFailed })
        );

        expect(() => plugin.services).toThrow(
            expect.objectContaining({ code: SeedcordErrorCode.PluginDrizzleServicesNotReady })
        );
    });

    it('retries after a failed init', async () => {
        const plugin = new Drizzle(mockCore, { db, dir: testEnv.resolvePath('late-services') });

        await expect(plugin.init()).rejects.toThrow(
            expect.objectContaining({ code: SeedcordErrorCode.CoreDirectoryUnreadable })
        );

        await testEnv.createFile('late-services/.keep', '');
        await plugin.init();

        expect(plugin.services).toEqual({});
    });

    it('reports services unavailable after dispose', async () => {
        const plugin = build();
        await plugin.init();

        await plugin.dispose();

        expect(() => plugin.services).toThrow(
            expect.objectContaining({ code: SeedcordErrorCode.PluginDrizzleServicesNotReady })
        );
    });

    it('reloads services when init runs after dispose', async () => {
        await testEnv.createFile(
            'services/UserService.ts',
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('users')
            export class UserService extends DrizzleService {}
            `
        );
        const plugin = build();
        await plugin.init();
        await plugin.dispose();

        await plugin.init();

        expect(plugin.services).toHaveProperty('users');
    });

    it('disposes without throwing when init never ran', async () => {
        const plugin = build();

        await expect(plugin.dispose()).resolves.toBeUndefined();
    });

    it.each([{ criticalFiles: ['./drizzle', './src/schema.ts'] }, { criticalFiles: './drizzle' }])(
        'registers critical files $criticalFiles so schema edits force a full restart in dev',
        ({ criticalFiles }) => {
            // the method is protected, so reach it through the prototype for the assertion
            const spy = vi.spyOn(
                Plugin.prototype as unknown as { registerCriticalFiles(patterns: string[]): void },
                'registerCriticalFiles'
            );
            try {
                build({ criticalFiles });

                expect(spy).toHaveBeenCalledWith(Array.isArray(criticalFiles) ? criticalFiles : [criticalFiles]);
            } finally {
                spy.mockRestore();
            }
        }
    );

    it('registers no critical files when the option is omitted', () => {
        // the method is protected, so reach it through the prototype for the assertion
        const spy = vi.spyOn(
            Plugin.prototype as unknown as { registerCriticalFiles(patterns: string[]): void },
            'registerCriticalFiles'
        );
        try {
            build();

            expect(spy).not.toHaveBeenCalled();
        } finally {
            spy.mockRestore();
        }
    });
});
