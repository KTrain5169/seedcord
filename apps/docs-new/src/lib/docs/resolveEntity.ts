import { parseEntityPathSegments } from '@seedcord/docs-engine';

import { openDocsEngine } from './engine';
import { loadEntityModel } from './loadEntityModel';
import { getCatalogContext } from './pageContext';

import type { PageParams } from './pageContext';
import type { EntityModel, PackageCatalogEntry, PackageVersionCatalog } from './types';

export interface ResolvedEntity {
    entry: PackageCatalogEntry;
    version: PackageVersionCatalog;
    entity: EntityModel;
    segments: string[];
}

function normalizeSegments(raw: string | string[] | undefined): string[] {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') return raw.split('/').filter(Boolean);
    return [];
}

export async function resolveEntity(params: PageParams): Promise<ResolvedEntity | null> {
    const context = await getCatalogContext(params);
    if (!context) return null;
    const { entry, version } = context;

    const segments = normalizeSegments(params.entitySegments);
    const parsed = parseEntityPathSegments(segments);
    if (!parsed.slug) return null;

    // one engine keeps setVersion and the lookup on the same version. the routes generate
    // concurrently, so this call takes its own instance instead of a shared one.
    const engine = openDocsEngine();
    try {
        await engine.setVersion(entry.id, version.id);
    } catch {
        return null;
    }

    const entity = await loadEntityModel(engine, entry.manifestName, {
        slug: parsed.slug,
        ...(parsed.tone ? { kind: parsed.tone } : {})
    });
    if (!entity) return null;

    return { entry, version, entity, segments };
}
