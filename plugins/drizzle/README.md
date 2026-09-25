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

In dev, point `criticalFiles` at your schema and migration files. Edits to them trigger a full restart instead of an HMR swap, so startup runs `migrate` again. The patterns resolve relative to the project root, and the option does nothing outside development:

```ts
export const seedcord = new Seedcord(config).attach('db', Drizzle, {
    db,
    dir: resolve(import.meta.dirname, './services'),
    migrate: () => migrate(db, { migrationsFolder: resolve(import.meta.dirname, '../drizzle') }),
    criticalFiles: ['./drizzle', './src/schema.ts']
});
```

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

Declare your database type once so the plugin's `connection` and every service resolve it:

```ts
declare module '@seedcord/plugin-drizzle' {
    interface DrizzleDatabase {
        db: NodePgDatabase<typeof schema>;
    }
}
```

Until that declaration exists, `this.db` types as `unknown`. A service can also name its type directly with `extends DrizzleService<typeof db>`.

## Services

Each service extends `DrizzleService` with your database type and reads through `this.db`:

```ts
import { eq } from 'drizzle-orm';
import { DrizzleService, RegisterDrizzleService } from '@seedcord/plugin-drizzle';

import { db, users } from '../db';

@RegisterDrizzleService('users')
export class UsersService extends DrizzleService<typeof db> {
    public async findByUserId(userId: string) {
        return this.db.select().from(users).where(eq(users.userId, userId));
    }
}
```

Name each key once so the lookup types resolve:

```ts
declare module '@seedcord/plugin-drizzle' {
    interface DrizzleServices {
        users: UsersService;
    }
}
```

Then call it from a handler through `core`:

```ts
const user = await this.core.db.services.users.findByUserId(this.event.user.id);
```
