import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { Drizzle } from '#src/Drizzle';

import { createFakeDb } from './utils/fake-db';
import { pluginsPath } from './utils/source-path';
import { TestEnvironment } from './utils/test-env';

import type { CoreBase } from '@seedcord/core';

describe('Drizzle Plugin Integration', () => {
    let testEnv: TestEnvironment;

    let plugin: Drizzle;
    let mockCore: CoreBase;

    beforeEach(async () => {
        testEnv = new TestEnvironment('drizzle-test-');
        await testEnv.setup();
        // the plugin reads nothing off core, this only satisfies the constructor
        mockCore = { config: {} } as unknown as CoreBase;
    });

    afterEach(async () => {
        await testEnv.teardown();
        vi.clearAllMocks();
    });

    it('should load drizzle services from directory', async () => {
        const servicesDir = 'services';
        await testEnv.createFile(
            `${servicesDir}/UserService.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('users')
            export class UserService extends DrizzleService {
                public async findUser() {
                    return 'user';
                }
            }
            `
        );

        plugin = new Drizzle(mockCore, {
            db: createFakeDb(),
            dir: testEnv.resolvePath(servicesDir)
        });

        await plugin.init();

        expect(plugin.services).toHaveProperty('users');
    });

    it('should handle HMR updates for drizzle services', async () => {
        const servicesDir = 'services';
        const filePath = await testEnv.createFile(
            `${servicesDir}/UserService.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('users')
            export class UserService extends DrizzleService {
                public async findUser() {
                    return 'user';
                }
            }
            `
        );

        plugin = new Drizzle(mockCore, {
            db: createFakeDb(),
            dir: testEnv.resolvePath(servicesDir)
        });

        await plugin.init();

        expect(plugin.services).toHaveProperty('users');

        // HMR update that changes the registered key
        await testEnv.createFile(
            `${servicesDir}/UserService.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('admins')
            export class UserService extends DrizzleService {
                public async findUser() {
                    return 'admin';
                }
            }
            `
        );

        await plugin.onHmr({
            file: filePath,
            type: 'update'
        });

        expect(plugin.services).not.toHaveProperty('users');
        expect(plugin.services).toHaveProperty('admins');
    });

    it('keeps other tracked services registered when one leaf reloads', async () => {
        const servicesDir = 'services';
        const userFile = await testEnv.createFile(
            `${servicesDir}/UserService.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('users')
            export class UserService extends DrizzleService {
                public async findUser() {
                    return 'user';
                }
            }
            `
        );
        await testEnv.createFile(
            `${servicesDir}/ProductService.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('products')
            export class ProductService extends DrizzleService {
                public async findProduct() {
                    return 'product';
                }
            }
            `
        );

        plugin = new Drizzle(mockCore, {
            db: createFakeDb(),
            dir: testEnv.resolvePath(servicesDir)
        });

        await plugin.init();

        expect(plugin.services).toHaveProperty('users');
        expect(plugin.services).toHaveProperty('products');

        // reload only the user leaf
        await testEnv.createFile(
            `${servicesDir}/UserService.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('admins')
            export class UserService extends DrizzleService {
                public async findUser() {
                    return 'admin';
                }
            }
            `
        );

        await plugin.onHmr({ file: userFile, type: 'update' });

        // the unchanged product leaf is still tracked, so the store survived the single-leaf reload
        expect(plugin.services).toHaveProperty('products');
        expect(plugin.services).toHaveProperty('admins');
        expect(plugin.services).not.toHaveProperty('users');
    });

    it('drops services registered by a failed init when the retry no longer finds them', async () => {
        const servicesDir = 'services';
        // A sorts before Z, so this one registers before the broken file aborts the scan
        await testEnv.createFile(
            `${servicesDir}/AUserService.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('users')
            export class AUserService extends DrizzleService {}
            `
        );
        await testEnv.createFile(`${servicesDir}/ZBroken.ts`, 'export const broken = {{{ not valid');

        plugin = new Drizzle(mockCore, {
            db: createFakeDb(),
            dir: testEnv.resolvePath(servicesDir)
        });

        await expect(plugin.init()).rejects.toThrow();

        await testEnv.removeFile(`${servicesDir}/AUserService.ts`);
        await testEnv.createFile(
            `${servicesDir}/ZBroken.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('products')
            export class ZProductService extends DrizzleService {}
            `
        );

        await plugin.init();

        expect(plugin.services).toHaveProperty('products');
        expect(plugin.services).not.toHaveProperty('users');
    });

    it('keeps the last-good service when a reload throws', async () => {
        const servicesDir = 'services';
        const userFile = await testEnv.createFile(
            `${servicesDir}/UserService.ts`,
            `
            import { DrizzleService, RegisterDrizzleService } from '${pluginsPath}';

            @RegisterDrizzleService('users')
            export class UserService extends DrizzleService {
                public async findUser() {
                    return 'user';
                }
            }
            `
        );

        plugin = new Drizzle(mockCore, {
            db: createFakeDb(),
            dir: testEnv.resolvePath(servicesDir)
        });

        await plugin.init();
        expect(plugin.services).toHaveProperty('users');

        // a broken edit, the reload import throws
        await testEnv.createFile(`${servicesDir}/UserService.ts`, 'export const broken = {{{ not valid');
        await plugin.onHmr({ file: userFile, type: 'update' });

        // the failed reload rolled back, so the last-good service round-trips and stays registered
        expect(plugin.services).toHaveProperty('users');
    });
});
