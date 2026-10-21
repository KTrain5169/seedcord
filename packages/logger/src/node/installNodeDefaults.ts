import { Envapter } from 'envapt';

import { defaultLevel } from '#src/levels';
import { LoggerChannelRegistry } from '#src/LoggerChannelRegistry';

import { WinstonConsoleSink } from './WinstonConsoleSink';
import { WinstonFileSink } from './WinstonFileSink';

import type { ILogSink, LoggerConfig } from '@seedcord/types';

function consoleSink(): ILogSink {
    return new WinstonConsoleSink({ format: Envapter.isDevelopment ? 'pretty' : 'json' });
}

function buildDefaultSinks(): ILogSink[] {
    return Envapter.isDevelopment ? [consoleSink(), new WinstonFileSink()] : [consoleSink()];
}

/**
 * Installs the node defaults into the registry config layer. Dev is a pretty console plus one
 * combined file, prod is JSON to the console. A node bot's `start()` calls this.
 *
 * @param overrides - A bot's `config.logger`. Level, sinks, or channels the bot sets take precedence.
 * Omitted fields keep the node defaults.
 */
export function installNodeDefaults(overrides?: LoggerConfig): void {
    LoggerChannelRegistry.instance.configure({
        level: overrides?.level ?? defaultLevel(),
        sinks: overrides?.sinks ?? buildDefaultSinks(),
        channels: overrides?.channels ?? {}
    });
}

/**
 * Installs only the node console sink, pretty in dev and JSON in prod.
 */
export function installNodeConsole(): void {
    LoggerChannelRegistry.instance.configure({ sinks: [consoleSink()] });
}
