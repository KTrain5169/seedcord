/**
 * The Drizzle database instance the plugin hands to services. Declare it once
 * in your database file so the plugin's `connection` and every service resolve
 * it to your driver's database type.
 *
 * @example
 * ```typescript
 * declare module '@seedcord/plugin-drizzle' {
 *   interface DrizzleDatabase {
 *     db: NodePgDatabase<typeof schema>;
 *   }
 * }
 * ```
 */
export interface DrizzleDatabase {}

/**
 * The declared database instance. Until {@link DrizzleDatabase} declares a
 * `db` this resolves to `unknown`, so the plugin still holds whatever instance
 * was passed without type-checking queries against it.
 */
export type DrizzleConnection = DrizzleDatabase extends { db: infer Declared } ? Declared : unknown;
