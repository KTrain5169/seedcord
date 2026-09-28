import 'reflect-metadata';

import { HmrModuleHandler } from '@seedcord/core/hmr';
import { Plugin } from '@seedcord/core/plugin';
import { SeedcordErrorCode, paint } from '@seedcord/errors';
import { SeedcordError } from '@seedcord/errors/internal';
import { keepDefined } from '@seedcord/utils';
import { Envapter } from 'envapt';

import { DrizzleServiceMetadataKey } from './decorators/RegisterDrizzleService';
import { inferCriticalFiles, toCriticalPattern } from './DrizzleKitConfig';
import { DrizzleServiceRegistry } from './DrizzleServiceRegistry';

import type { DrizzleServiceConstructor } from './DrizzleService';
import type { DrizzleConnection } from './types/DrizzleDatabase';
import type { DrizzleOptions } from './types/DrizzleOptions';
import type { DrizzleServices } from './types/DrizzleServices';
import type { CoreBase } from '@seedcord/core';
import type { HmrUpdateEvent } from '@seedcord/types';

export interface DrizzleArtifact {
    key?: string;
}

/**
 * Database plugin using Drizzle ORM.
 *
 * Holds the Drizzle instance you configured for your driver, runs your
 * `migrate` callback, and registers decorated services so the core can
 * resolve them. It works with every driver Drizzle supports because it never
 * touches connections itself.
 */
export class Drizzle extends Plugin<{ transport: 'any'; runtime: 'server' }> {
    private isInitialised = false;
    private servicesReady = false;
    private criticalFilesRegistered = false;
    private inFlight: Promise<void> | null = null;

    /** The Drizzle instance passed via options. */
    public readonly connection: DrizzleConnection;
    private readonly serviceRegistry: DrizzleServiceRegistry;
    private readonly hmrHandler?: HmrModuleHandler<DrizzleServiceConstructor, void, DrizzleArtifact>;

    /**
     * Map of all services registered with the plugin, keyed by their decorator name.
     *
     * @throws A **SeedcordError** if accessed before the plugin finishes initializing.
     */
    public get services(): DrizzleServices {
        if (!this.servicesReady) {
            throw new SeedcordError(SeedcordErrorCode.PluginDrizzleServicesNotReady);
        }
        return this.serviceRegistry.map;
    }

    constructor(
        host: CoreBase,
        private readonly options: DrizzleOptions
    ) {
        super(host, { dispose: keepDefined({ timeout: options.timeout }) });
        this.connection = options.db;
        this.serviceRegistry = new DrizzleServiceRegistry(this, this.core, this.logger);

        if (!Envapter.isDevelopment) return;

        this.hmrHandler = new HmrModuleHandler({
            handlersDir: this.options.dir,
            isHandler: this.serviceRegistry.isServiceClass.bind(this.serviceRegistry),
            registerHandler: this.serviceRegistry.initializeService.bind(this.serviceRegistry),
            unregisterHandler: this.serviceRegistry.unregister.bind(this.serviceRegistry),
            getArtifacts: this.getArtifacts.bind(this),
            logger: this.logger
        });
    }

    private getArtifacts(ctor: DrizzleServiceConstructor): DrizzleArtifact {
        const key = Reflect.getMetadata(DrizzleServiceMetadataKey, ctor) as string | undefined;
        return key ? { key } : {};
    }

    /** @internal For use in dev mode */
    public override async onHmr(event: HmrUpdateEvent): Promise<void> {
        await this.hmrHandler?.handle(event);
    }

    /**
     * Runs the `migrate` callback and loads decorated services.
     *
     * Safe to call multiple times, subsequent calls exit early.
     */
    public init(): Promise<void> {
        if (this.isInitialised) return Promise.resolve();
        // racing callers share one attempt, and clearing it on settle means the next call starts a fresh one
        this.inFlight ??= this.runInit().finally(() => {
            this.inFlight = null;
        });
        return this.inFlight;
    }

    private async runInit(): Promise<void> {
        try {
            await this.registerCriticalPatterns();
            await this.runMigrations();
            await this.serviceRegistry.loadFromDirectory(this.options.dir);
        } catch (caught) {
            // the connection belongs to the caller, so there is nothing to close, only services to drop
            this.serviceRegistry.clear();
            throw caught;
        }
        this.servicesReady = true;
        this.isInitialised = true;
    }

    public override dispose(): Promise<void> {
        // the connection belongs to the caller, so shutdown only drops services
        this.serviceRegistry.clear();
        this.servicesReady = false;
        this.isInitialised = false;

        this.logger.debug(paint.mute('Cleared Drizzle services.'));
        return Promise.resolve();
    }

    /**
     * Registers the paths that force a full restart in dev: the ones named in `criticalFiles`,
     * plus whatever a drizzle-kit config in the project root points at.
     *
     * Runs from `init` rather than the constructor because reading a config is asynchronous.
     * No-op outside development, and once per instance.
     */
    private async registerCriticalPatterns(): Promise<void> {
        if (this.criticalFilesRegistered || !Envapter.isDevelopment) return;
        this.criticalFilesRegistered = true;

        // the framework resolves every other path against the working directory
        const root = process.cwd();
        const { criticalFiles } = this.options;
        const declared = Array.isArray(criticalFiles) ? criticalFiles : criticalFiles ? [criticalFiles] : [];

        const patterns: string[] = [];
        for (const pattern of declared) {
            patterns.push(await toCriticalPattern(pattern, root));
        }
        patterns.push(...(await inferCriticalFiles(root, this.logger)));

        if (patterns.length > 0) {
            super.registerCriticalFiles([...new Set(patterns)]);
        }
    }

    private async runMigrations(): Promise<void> {
        const { migrate } = this.options;
        if (!migrate) return;

        try {
            await migrate();
        } catch (error) {
            throw new SeedcordError(SeedcordErrorCode.PluginDrizzleMigrationFailed, { cause: error });
        }
    }

    /** @internal */
    _register(key: string, instance: unknown): void {
        this.serviceRegistry.register(key, instance);
    }

    /**
     * Tracks a service file with the HMR handler so dev reloads can swap it. No-op outside dev.
     *
     * @internal Exposes the dev-only HMR handler to {@link DrizzleServiceRegistry}.
     */
    public trackServiceFile(filePath: string, ctor: DrizzleServiceConstructor): void {
        this.hmrHandler?.trackHandler(filePath, ctor);
    }
}
