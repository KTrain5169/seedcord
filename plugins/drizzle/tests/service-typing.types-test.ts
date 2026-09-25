import { expectTypeOf } from 'vitest';

import { RegisterDrizzleService } from '#src/decorators/RegisterDrizzleService';
import { DrizzleService } from '#src/DrizzleService';

import { createFakeDb } from './utils/fake-db';

import type { Drizzle } from '#src/Drizzle';
import type { DrizzleConnection } from '#src/types/DrizzleDatabase';
import type { FakeDb } from './utils/fake-db';

declare module '#src/types/DrizzleDatabase' {
    interface DrizzleDatabase {
        db: FakeDb;
    }
}

declare module '#src/types/DrizzleServices' {
    interface DrizzleServices {
        users: DrizzleService;
    }
}

class UsersService extends DrizzleService {
    public findUser(id: string): string {
        return this.db.find(id);
    }
}

// the key has to be declared on DrizzleServices
@RegisterDrizzleService('users')
class MatchesKey extends DrizzleService {}

// @ts-expect-error keys must be declared on DrizzleServices
@RegisterDrizzleService('unregistered')
class UnregisteredKey extends DrizzleService {}

void MatchesKey;
void UnregisteredKey;
void UsersService;

// justified: these probes only assert static types, nothing runs
const plugin = null as unknown as Drizzle;

expectTypeOf<DrizzleConnection>().toEqualTypeOf<FakeDb>();

expectTypeOf<UsersService['db']>().toEqualTypeOf<FakeDb>();

expectTypeOf(plugin.connection).toEqualTypeOf<FakeDb>();

expectTypeOf(createFakeDb().find('abc')).toEqualTypeOf<string>();
