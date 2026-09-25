import type { DrizzleConnection } from './DrizzleDatabase';

/**
 * Configuration options for the Drizzle plugin.
 *
 * The plugin never opens or closes connections. Pass the Drizzle instance you
 * already configured for your driver, and it holds the reference for services.
 */
export interface DrizzleOptions {
    /** Your configured Drizzle database instance, from any driver's `drizzle()` call. */
    readonly db: DrizzleConnection;
    /** Directory containing service classes. Make sure file(s)/folder(s) are built to `.js` in dist and aren't merged into a single file. */
    readonly dir: string;
    /**
     * Optional migration runner, called once during `init` before services load.
     *
     * Wire your driver's migrator here, since migrators are per-driver and the
     * plugin cannot bundle one generically.
     *
     * @example
     * ```typescript
     * {
     *   db,
     *   dir: './services',
     *   migrate: () => migrate(db, { migrationsFolder: './drizzle' })
     * }
     * ```
     */
    readonly migrate?: () => Promise<void> | void;
    /**
     * Glob patterns, relative to the project root, that force a full restart
     * in dev instead of an HMR swap.
     *
     * Point these at your schema and migration files so editing them reruns
     * `init`, which runs `migrate` again. Has no effect outside development.
     *
     * @example
     * ```typescript
     * {
     *   db,
     *   dir: './services',
     *   criticalFiles: ['./drizzle', './src/schema.ts']
     * }
     * ```
     */
    readonly criticalFiles?: string | string[];
    /**
     * How long shutdown may take, in milliseconds.
     *
     * @defaultValue `10_000`
     */
    readonly timeout?: number;
}
