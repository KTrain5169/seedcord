<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.seedcord.org/assets/wordmark-dark.webp" />
    <img src="https://cdn.seedcord.org/assets/wordmark-light.webp" alt="seedcord" width="440" />
  </picture>
</div>

<div align="center">
  <h3>The whole Discord bot, wired and typed</h3>
  <a href="https://seedcord.org">Website</a> ·
  <a href="https://guide.seedcord.org">Guide</a> ·
  <a href="https://docs.seedcord.org">Reference</a> ·
  <a href="https://discord.gg/DzFxY58WXf">Discord</a>
</div>

<br />

<div align="center">

[![npm](https://img.shields.io/npm/v/@seedcord/plugin-drizzle?style=flat-square&logo=npm&logoColor=c8341f&label=&labelColor=1f1f1f&color=c8341f)](https://www.npmjs.com/package/@seedcord/plugin-drizzle) [![node](https://img.shields.io/node/v/@seedcord/plugin-drizzle?style=flat-square&label=node&labelColor=1f1f1f&color=4d7d33)](https://nodejs.org) [![license](https://img.shields.io/npm/l/@seedcord/plugin-drizzle?style=flat-square&label=license&labelColor=1f1f1f&color=f8f6e8)](LICENSE)

</div>

## About

`@seedcord/plugin-drizzle` connects a seedcord bot to any database through Drizzle ORM. You bring the Drizzle instance you configured for your driver, the plugin runs your `migrate` callback during startup, loads every class under `dir` that carries `@RegisterDrizzleService`, and exposes them under the key you attached it on.

It never opens or closes connections, so it works with every driver Drizzle supports. Drizzle types every query off your schema, so a renamed column breaks the build.

It runs on the gateway transport and on http's server runtime. Attaching it to an edge host is a compile error.

Until v1.0.0, minor versions can break.

## Installation

```sh
pnpm add @seedcord/plugin-drizzle drizzle-orm
```

Then add your driver's client package, for example `pg` for `drizzle-orm/node-postgres`.

`drizzle-orm`, `envapt`, `typescript`, and `@seedcord/core` are peer dependencies.

The examples below assume this layout:

```text
src/
├── bot.ts          the attach call
├── db.ts           your configured Drizzle instance
├── schema.ts       your table definitions
└── services/       one file per service class
drizzle/            the folder drizzle-kit generates migrations into
```

## Attach

`attach` takes a property name, the plugin class, and its options. Chain it off the constructor:

```ts
// bot.ts
import { resolve } from 'node:path';

import { Seedcord } from '@seedcord/gateway';
import { Drizzle } from '@seedcord/plugin-drizzle';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from './db';

export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') })
});

export default seedcord;
```

```ts
// index.ts
import seedcord from './bot';

await seedcord.start();
```

`attach` returns the instance widened with the key, and `seedcord codegen` writes `db: (typeof Bot)['db']` into `seedcord-gen.d.ts` off a default import of that module. Calling `attach` as a bare statement drops the widened type. A named-only export leaves codegen with nothing to import.

Attach before startup. A call after initialization throws `CorePluginAfterInit`.

`migrate` is optional. Omit it when you run migrations another way, for example through `drizzle-kit`. A `migrate` callback that throws fails startup with `PluginDrizzleMigrationFailed`, keeping the original error as its cause.

A complete attach, with every option in play:

```ts
// bot.ts
import { resolve } from 'node:path';

import { Seedcord } from '@seedcord/gateway';
import { Drizzle } from '@seedcord/plugin-drizzle';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { db } from './db';

export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') })
});

export default seedcord;
```

In dev, anything matched by `criticalFiles` gets a full restart instead of a hot swap, so an edit to a migration or a schema file reruns `migrate` on the next start. The option does nothing outside development:

```ts
export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') }),
    criticalFiles: ['drizzle', 'src/schema.ts']
});
```

Paths are relative to the project root and the plugin normalizes them for you: a leading `./` is dropped, an absolute path inside the root is made relative, and a folder gains `/**` so the files inside it match. Write `'drizzle'` and get `drizzle/**`; write `'drizzle/**'` and it is left alone.

### Inferring from drizzle.config.ts

If your project has a drizzle-kit config, the plugin reads it and registers its `schema` and `out` paths as critical files, so you do not have to repeat them. `criticalFiles` and the config are merged, and the result is deduplicated:

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: { url: process.env.DATABASE_URL! }
});
```

That config alone gets you `src/schema.ts` and `drizzle/**`, with no `criticalFiles` at all. The config is looked for in the project root, in drizzle-kit's own preference order, and reading it is best effort: a config that fails to load logs at debug and contributes nothing, because a broken config is no reason to take the bot down. A config that exports a function instead of an object is called and awaited.

Registration happens during `init`, not in the constructor, since reading the config is asynchronous.

## Dialects

The plugin takes whatever your driver's `drizzle()` returns, so every dialect attaches the same way: build your `db`, then pass it with a `migrate` callback imported from your driver's `/migrator` entry. Almost every driver in `drizzle-orm` ships one.

The plugin targets Node server runtimes (gateway and the http server runtime), so pick a driver that runs there.

### Postgres (`node-postgres`)

```sh
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

```ts
// db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({ client: pool, schema });
```

```ts
// bot.ts
import { migrate } from 'drizzle-orm/node-postgres/migrator';

export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') })
});
```

### MySQL (`mysql2`)

```sh
pnpm add drizzle-orm mysql2
pnpm add -D drizzle-kit
```

```ts
// db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import * as schema from './schema';

const pool = mysql.createPool(process.env.DATABASE_URL!);

export const db = drizzle({ client: pool, schema });
```

```ts
// bot.ts
import { migrate } from 'drizzle-orm/mysql2/migrator';

export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') })
});
```

### SQLite (`better-sqlite3`)

```sh
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3
```

```ts
// db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import * as schema from './schema';

const client = new Database('sqlite.db');

export const db = drizzle({ client, schema });
```

```ts
// bot.ts
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    // this driver's `migrate` is synchronous, which the callback accepts
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') })
});
```

### SQLite anywhere (`libsql`)

```sh
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

```ts
// db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from './schema';

const client = createClient({ url: 'file:local.db' });

export const db = drizzle({ client, schema });
```

Point `url` at your Turso database with an `authToken` to run against a remote instead of a file. The migrator entry stays the same:

```ts
// bot.ts
import { migrate } from 'drizzle-orm/libsql/migrator';

export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') })
});
```

### Serverless Postgres (`neon-http`)

```sh
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit
```

```ts
// db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({ client: sql, schema });
```

```ts
// bot.ts
import { migrate } from 'drizzle-orm/neon-http/migrator';

export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') })
});
```

## Typing

Declare your database type once so the plugin's `connection` and every service resolve it. Put it in its own declaration file and hand it the type of the instance you exported:

```ts
// src/seedcord.d.ts
import { db } from './db';

declare module '@seedcord/plugin-drizzle' {
    interface DrizzleDatabase {
        db: typeof db;
    }
}
```

The one member is named `db`, and it holds whatever your `drizzle()` call returned, so this works for every driver without naming one. Naming the driver's database class works too, if you would rather not import the value:

```ts
// src/seedcord.d.ts
import type { MySql2Database } from 'drizzle-orm/mysql2';

declare module '@seedcord/plugin-drizzle' {
    interface DrizzleDatabase {
        db: MySql2Database;
    }
}
```

Two ways to get this wrong, both of which leave `this.db` as `unknown` with no error anywhere:

- **Do not name the file `db.d.ts`.** Sitting next to `db.ts`, that name reads as the declaration output of `db.ts` rather than a module of its own, and the augmentation is dropped. Any other name is fine, `seedcord.d.ts` above.
- **Keep it inside the compiler's program.** A file that no `include` in your `tsconfig.json` matches is never read, so the declaration never runs.

Until that declaration exists, `this.db` types as `unknown` and `core.db.connection` too. A service can also name its type directly with `extends DrizzleService<typeof db>`, which works without the declaration at all. Declaring it is still worth it: it is the only way `core.db.connection` gets a type.

## Services

Each service extends `DrizzleService` and reads through `this.db`. Name the database type on the class when you have not declared it globally:

```ts
import { eq } from 'drizzle-orm';
import { DrizzleService, RegisterDrizzleService } from '@seedcord/plugin-drizzle';

import { db } from '../db';
import { users } from '../schema';

@RegisterDrizzleService('users')
export class UsersService extends DrizzleService<typeof db> {
    public async findByUserId(userId: string) {
        return this.db.select().from(users).where(eq(users.userId, userId));
    }
}
```

With the declaration in place you can leave the type argument off, which is what most services end up doing since they all share one database:

```ts
import { and, eq } from 'drizzle-orm';
import { DrizzleService, RegisterDrizzleService } from '@seedcord/plugin-drizzle';

import { users } from '../schema';

@RegisterDrizzleService('users')
export class UsersService extends DrizzleService {
    public async findActive(userId: string) {
        return this.db
            .select()
            .from(users)
            .where(and(eq(users.userId, userId), eq(users.banned, false)));
    }

    public async ban(userId: string) {
        await this.db.update(users).set({ banned: true }).where(eq(users.userId, userId));
    }
}
```

The decorator is what registers the class, and the key is what you look it up by. Name each key once so the lookup types resolve:

```ts
declare module '@seedcord/plugin-drizzle' {
    interface DrizzleServices {
        users: UsersService;
    }
}
```

The decorator checks that the class and the declared key agree, so a key with no declaration fails to compile rather than resolving to `unknown`.

Then call it from a handler through `core`:

```ts
const user = await this.core.db.services.users.findByUserId(this.event.user.id);
```

Reading `core.db.services` before the plugin finishes initializing throws `PluginDrizzleServicesNotReady`. Plugins in the same startup phase initialize in attach order, so a plugin attached before this one cannot reach a service from its own `init`. For the instance itself, without a service in the way, use the connection:

```ts
const rows = await this.core.db.connection.select().from(users).limit(10);
```
