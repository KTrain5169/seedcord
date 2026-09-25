/**
 * Registry of Drizzle services, augmented per consumer via declaration merging.
 *
 * Declare a member for each class you decorate with `@RegisterDrizzleService` to get
 * type-safe access to it.
 *
 * @example
 * ```typescript
 * declare module '@seedcord/plugin-drizzle' {
 *   interface DrizzleServices {
 *     'users': UsersService;
 *   }
 * }
 * ```
 */
export interface DrizzleServices {}

/** @internal */
export type DrizzleServiceKeys = keyof DrizzleServices;
