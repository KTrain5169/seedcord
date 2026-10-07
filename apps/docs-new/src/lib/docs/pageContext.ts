import { findPackageVersion } from './catalog';

import type { CatalogContext } from './catalog';

export type PageParams = Record<string, string | string[] | undefined>;

function decodeParam(value: string | string[] | undefined): string {
    if (!value) return '';
    const raw = Array.isArray(value) ? value[0] : value;
    const safe = raw ?? '';
    try {
        return decodeURIComponent(safe);
    } catch {
        return safe;
    }
}

export { decodeParam };

interface PageContext extends CatalogContext {
    versionSegment: string;
}

// the caller renders its 404 when this returns null, because a static page has no framework to throw to
export async function getCatalogContext(params: PageParams): Promise<PageContext | null> {
    const versionSegment = decodeParam(params.versionId);
    const context = await findPackageVersion(decodeParam(params.packageId), versionSegment);
    if (!context) return null;
    return { ...context, versionSegment };
}

export type { PageContext };

// astro delivers a rest route's segments as one raw string, with each segment still encoded
export function decodeSegments(raw: string | undefined): string[] {
    if (!raw) return [];
    return raw
        .split('/')
        .filter(Boolean)
        .map((segment) => decodeParam(segment));
}
