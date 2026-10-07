import { DOCS } from '@seedcord/ui/sites';

// the worker and the dev middleware serve /docs urls against base-relative routes, but the
// browser's address still carries the /docs prefix. every path the app builds, from sidebar
// state to the mobile-nav check, is base-relative
export function relativePath(pathname: string): string {
    if (pathname === DOCS.path) return '/';
    if (pathname.startsWith(`${DOCS.path}/`)) return pathname.slice(DOCS.path.length) || '/';
    return pathname;
}
