import { SeedcordErrorCode } from '@seedcord/errors';
import { describe, it, expect } from 'vitest';

import { RegisterDrizzleService } from '#src/decorators/RegisterDrizzleService';
import { DrizzleService } from '#src/DrizzleService';

import type { Drizzle } from '#src/Drizzle';
import type { CoreBase } from '@seedcord/core';

declare module '#src/types/DrizzleServices' {
    interface DrizzleServices {
        '': EmptyKeyService;
    }
}

class EmptyKeyService extends DrizzleService {}

// justified: both guards throw before either argument is read
const drizzle = {} as unknown as Drizzle;
const core = {} as unknown as CoreBase;

class Undecorated extends DrizzleService {}

describe('DrizzleService constructor guards', () => {
    it('throws when the class has no decorator', () => {
        expect(() => new Undecorated(drizzle, core)).toThrow(
            expect.objectContaining({ code: SeedcordErrorCode.PluginDrizzleServiceDecoratorMissing })
        );
    });

    it('throws when the key is empty', () => {
        expect(() => RegisterDrizzleService('')(EmptyKeyService)).toThrow(
            expect.objectContaining({ code: SeedcordErrorCode.PluginDrizzleServiceKeyMissing })
        );
    });
});
