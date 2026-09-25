import { SeedcordErrorCode } from '@seedcord/errors';
import { SeedcordTypeError } from '@seedcord/errors/internal';

import type { DrizzleServiceKeys, DrizzleServices } from '../types/DrizzleServices';
import type { Constructor } from 'type-fest';

export const DrizzleServiceMetadataKey = Symbol.for('seedcord:drizzle:service');

/**
 * Registers a Drizzle service with the specified key.
 *
 * Associates a service class with a key for dependency injection.
 * The service becomes available via `core.db.services[key]`.
 *
 * @typeParam TKey - Service key for registration and type-safe access
 * @param key - Service key for registration and type-safe access
 * @decorator
 * @example
 * ```typescript
 * \@RegisterDrizzleService('users')
 * export class UsersService extends DrizzleService {
 *   // Some code
 * }
 * ```
 *
 * @see {@link DrizzleService}
 */
export function RegisterDrizzleService<TKey extends DrizzleServiceKeys>(key: TKey) {
    return <Ctor extends Constructor<DrizzleServices[TKey]>>(ctor: Ctor): void => {
        if (String(key).length === 0) {
            throw new SeedcordTypeError(SeedcordErrorCode.PluginDrizzleServiceKeyMissing, [ctor.name]);
        }

        Reflect.defineMetadata(DrizzleServiceMetadataKey, key, ctor);
    };
}
