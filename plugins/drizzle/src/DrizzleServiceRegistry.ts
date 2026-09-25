import { paint } from '@seedcord/errors';
import { traverseDirectory } from '@seedcord/utils/node';

import { DrizzleServiceMetadataKey } from './decorators/RegisterDrizzleService';
import { DrizzleService } from './DrizzleService';

import type { Drizzle, DrizzleArtifact } from './Drizzle';
import type { DrizzleServiceConstructor } from './DrizzleService';
import type { DrizzleServices } from './types/DrizzleServices';
import type { CoreBase } from '@seedcord/core';
import type { Logger } from '@seedcord/logger';

export class DrizzleServiceRegistry {
    // the augmented interface has no index signature, hence Reflect below
    private readonly services = Object.create(null) as DrizzleServices;

    constructor(
        private readonly plugin: Drizzle,
        private readonly core: CoreBase,
        private readonly logger: Logger
    ) {}

    public get map(): DrizzleServices {
        return this.services;
    }

    public register(key: string, instance: unknown): void {
        Reflect.set(this.services, key, instance);
    }

    public clear(): void {
        for (const key of Object.keys(this.services)) Reflect.deleteProperty(this.services, key);
    }

    public async loadFromDirectory(dir: string): Promise<void> {
        this.logger.debug(paint.mute(dir));

        await traverseDirectory(dir, (fullPath, rel, mod) => {
            for (const Service of Object.values(mod)) {
                if (!this.isServiceClass(Service)) continue;

                this.initializeService(Service);
                this.logger.utils.registration(Service.name, rel, undefined, 'trace');
                this.plugin.trackServiceFile(fullPath, Service);
            }
        });

        this.logger.utils.list(
            [`${paint.iris.bold(Object.keys(this.services).length)} services`],
            paint.mint.bold('Loaded'),
            'debug'
        );
    }

    public unregister(Service: DrizzleServiceConstructor, artifacts?: DrizzleArtifact): void {
        const key = artifacts?.key ?? (Reflect.getMetadata(DrizzleServiceMetadataKey, Service) as string | undefined);
        if (key && Reflect.get(this.services, key)) {
            Reflect.deleteProperty(this.services, key);
        }
    }

    public initializeService(Service: DrizzleServiceConstructor): void {
        // eslint-disable-next-line no-new -- the base ctor calls _register, so constructing is the registration
        new Service(this.plugin, this.core);
    }

    public isServiceClass(obj: unknown): obj is DrizzleServiceConstructor {
        return (
            typeof obj === 'function' &&
            obj.prototype instanceof DrizzleService &&
            Reflect.hasMetadata(DrizzleServiceMetadataKey, obj)
        );
    }
}
