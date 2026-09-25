import { Drizzle } from '#src/Drizzle';

import { createFakeDb } from './utils/fake-db';

import type { DrizzleOptions } from '#src/types/DrizzleOptions';
import type { Seedcord as GatewaySeedcord } from '@seedcord/gateway';
import type { HttpEdgeConfig, HttpServerConfig, Seedcord as HttpSeedcord } from '@seedcord/http';

const options: DrizzleOptions = {
    db: createFakeDb(),
    dir: '/services'
};

function probeGatewayAccepts(bot: GatewaySeedcord): void {
    bot.attach('db', Drizzle, options);
}

function probeHttpServerAccepts(bot: HttpSeedcord<HttpServerConfig>): void {
    bot.attach('db', Drizzle, options);
}

function probeEdgeRejects(bot: HttpSeedcord<HttpEdgeConfig>): void {
    // @ts-expect-error edge plugins arrive post-v1
    bot.attach('db', Drizzle, options);
}

void probeGatewayAccepts;
void probeHttpServerAccepts;
void probeEdgeRejects;
