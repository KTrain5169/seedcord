import { stat } from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { paint } from '@seedcord/errors';

import type { Logger } from '@seedcord/logger';

/**
 * Config file names drizzle-kit accepts, in the order it prefers them.
 *
 * Assumption: this is drizzle-kit's own lookup order. drizzle-kit is not a dependency of
 * this plugin, so the list could not be verified against the installed package.
 */
const CONFIG_FILES: readonly string[] = [
    'drizzle.config.ts',
    'drizzle.config.mts',
    'drizzle.config.cts',
    'drizzle.config.js',
    'drizzle.config.mjs',
    'drizzle.config.cjs'
];

/** Anything with a wildcard is already a pattern and is passed through as written. */
const WILDCARD = /[*?[\]{}]/;

/** The two entries that decide when a restart is worth it: the schema and the migrations. */
interface DrizzleKitConfig {
    readonly schema?: string | string[];
    readonly out?: string;
}

type ConfigFactory = () => DrizzleKitConfig | Promise<DrizzleKitConfig>;

/**
 * Reads a drizzle-kit config and returns the paths that should force a full restart in dev.
 *
 * Returns an empty list when there is no config, and never throws: a config this plugin
 * cannot read is not a reason to take the bot down.
 *
 * @param root - Directory to look for the config in, which is the project root.
 */
export async function inferCriticalFiles(root: string, logger: Logger): Promise<string[]> {
    const found = await findConfig(root);
    if (!found) return [];

    let config: DrizzleKitConfig | undefined;
    try {
        // the bot runs under tsx in dev, which is also the only place this runs, so a .ts
        // config imports the same way a user service file does
        config = await readConfig(found);
    } catch (error) {
        logger.debug(paint.mute(`Could not read ${found}: ${describe(error)}. No paths inferred.`));
        return [];
    }

    if (!config) {
        logger.debug(paint.mute(`${found} has no default export of an object. No paths inferred.`));
        return [];
    }

    const declared = [...toPaths(config.schema), ...toPaths(config.out)];
    const patterns: string[] = [];
    for (const entry of declared) {
        patterns.push(await toCriticalPattern(entry, root));
    }

    logger.debug(
        paint.mute(
            patterns.length > 0
                ? `Inferred ${String(patterns.length)} critical path(s) from ${path.basename(found)}.`
                : `${path.basename(found)} names no schema or out path.`
        )
    );

    return patterns;
}

/**
 * Turns one path into a pattern the dev runtime can match.
 *
 * The runtime matches with minimatch against a path relative to the project root, with no
 * leading `./` and no directory contents behind a bare directory, so both are fixed here.
 * A pattern that already holds a wildcard is left alone.
 */
export async function toCriticalPattern(pattern: string, root: string): Promise<string> {
    const relative = path.isAbsolute(pattern) ? path.relative(root, pattern) : pattern;
    const trimmed = toPosix(relative).replace(/^\.\//, '');

    if (WILDCARD.test(trimmed)) return trimmed;

    // a path with no extension names a folder, whether or not it exists yet
    if (path.extname(trimmed) === '') return `${trimmed}/**`;
    if (await isDirectory(path.resolve(root, relative))) return `${trimmed}/**`;

    return trimmed;
}

async function findConfig(root: string): Promise<string | undefined> {
    for (const name of CONFIG_FILES) {
        const candidate = path.resolve(root, name);
        if (await isFile(candidate)) return candidate;
    }
    return undefined;
}

async function readConfig(fullPath: string): Promise<DrizzleKitConfig | undefined> {
    const imported = (await import(pathToFileURL(fullPath).href)) as { default?: unknown };
    // a config can export a factory, and drizzle-kit awaits whatever it gets
    const resolved = await (isFactory(imported.default) ? imported.default() : imported.default);
    // a user file is not trusted to hold this shape, so only the two fields are read and both
    // go through toPaths before use
    return isRecord(resolved) ? resolved : undefined;
}

function toPaths(value: unknown): string[] {
    if (typeof value === 'string') return [value];
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is string => typeof entry === 'string');
}

function toPosix(value: string): string {
    return value.replaceAll('\\', '/');
}

async function isDirectory(target: string): Promise<boolean> {
    try {
        return (await stat(target)).isDirectory();
    } catch {
        return false;
    }
}

async function isFile(target: string): Promise<boolean> {
    try {
        return (await stat(target)).isFile();
    } catch {
        return false;
    }
}

function isFactory(value: unknown): value is ConfigFactory {
    return typeof value === 'function';
}

function isRecord(value: unknown): value is DrizzleKitConfig {
    return typeof value === 'object' && value !== null;
}

function describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
