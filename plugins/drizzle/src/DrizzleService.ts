import { SeedcordErrorCode } from '@seedcord/errors';
import { SeedcordError } from '@seedcord/errors/internal';

import { DrizzleServiceMetadataKey } from './decorators/RegisterDrizzleService';

import type { Drizzle } from './Drizzle';
import type { DrizzleConnection } from './types/DrizzleDatabase';
import type { CoreBase } from '@seedcord/core';
import type { TypedConstructor } from '@seedcord/types';

/**
 * Base class for Drizzle services.
 *
 * Provides a typed shim around the shared Drizzle instance and ensures that
 * subclasses have been decorated with `@RegisterDrizzleService`.
 *
 * @typeParam TDb - Your Drizzle database instance type. Defaults to the declared
 * {@link DrizzleConnection}, or `unknown` until it is declared.
 *
 * @example
 * ```typescript
 * \@RegisterDrizzleService('users')
 * export class UsersService extends DrizzleService {
 *   public async findById(id: string) {
 *     return this.db.select().from(users).where(eq(users.id, id));
 *   }
 * }
 *
 * // Usage inside handlers:
 * const user = await this.core.db.services.users.findById('abc');
 * ```
 */
export abstract class DrizzleService<TDb = DrizzleConnection> {
    public constructor(
        protected readonly drizzle: Drizzle,
        protected readonly core: CoreBase
    ) {
        const ctor = this.constructor;

        const key = Reflect.getMetadata(DrizzleServiceMetadataKey, ctor) as string | undefined;
        if (!key) {
            throw new SeedcordError(SeedcordErrorCode.PluginDrizzleServiceDecoratorMissing, [ctor.name]);
        }

        this.drizzle._register(key, this);
    }

    /**
     * Shared Drizzle instance used to interact with the database.
     */
    public get db(): TDb {
        // the registry only constructs services through the plugin holding this TDb
        return this.drizzle.connection as TDb;
    }
}

export type DrizzleServiceConstructor = TypedConstructor<typeof DrizzleService<DrizzleConnection>>;
