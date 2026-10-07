import { DEFAULT_VERSION } from '@seedcord/docs-engine/client';

import { ActiveVersion } from '#lib/docs/ActiveVersion';
import { loadDocsCatalog } from '#lib/docs/catalog';
import { openDocsEngine } from '#lib/docs/engine';

const ROOT = 'packages';

// only a type alias fits PageParams' index signature
type VersionParams = { packageId: string; versionId: string };
type EntityParams = VersionParams & { entitySegments: string[] };

export class DocsRoute {
    constructor(
        public readonly packageId: string,
        public readonly versionId: string,
        public readonly entitySegments: string[] = []
    ) {}

    static parse(segments: readonly string[]): DocsRoute | undefined {
        const [root, packageId, versionId, ...entitySegments] = segments;
        if (root !== ROOT || !packageId || !versionId) return undefined;
        return new DocsRoute(packageId, versionId, entitySegments);
    }

    get isLatest(): boolean {
        return this.versionId === DEFAULT_VERSION;
    }

    get isOverview(): boolean {
        return this.entitySegments.length === 0;
    }

    get segments(): string[] {
        return [ROOT, this.packageId, this.versionId, ...this.entitySegments];
    }

    get path(): string {
        return `/${this.segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
    }

    get params(): EntityParams {
        return { packageId: this.packageId, versionId: this.versionId, entitySegments: this.entitySegments };
    }
}

// the entity, llms, og and search routes each generate from this one list, and the build runs their
// getStaticPaths concurrently, so the first call computes it and the rest await the same promise
let routes: Promise<DocsRoute[]> | undefined;

export function docsRoutes(): Promise<DocsRoute[]> {
    routes ??= (async (): Promise<DocsRoute[]> => {
        const [catalog, engine] = await Promise.all([loadDocsCatalog(), Promise.resolve(openDocsEngine())]);
        const list: DocsRoute[] = [];

        // setVersion mutates the engine. keep this loop sequential
        for (const entry of catalog) {
            list.push(new DocsRoute(entry.id, DEFAULT_VERSION));
            for (const version of entry.versions) {
                list.push(new DocsRoute(entry.id, version.id));

                const active = await ActiveVersion.open(engine, entry.id, version.id);
                for (const page of active?.pages ?? []) {
                    // a re-export is listed under the package that declares it
                    if (!page.href.startsWith(`${version.basePath}/`)) continue;

                    const entitySegments = page.href
                        .slice(version.basePath.length + 1)
                        .split('/')
                        .map((segment) => decodeURIComponent(segment));
                    list.push(new DocsRoute(entry.id, version.id, entitySegments));
                    if (version.isLatest) list.push(new DocsRoute(entry.id, DEFAULT_VERSION, entitySegments));
                }
            }
        }

        return list;
    })();

    return routes;
}

// astro matches getStaticPaths params against the raw request path. a segment encodes before the
// join or a slug namespaced like jsx/element arrives as two segments
function encodedBaseParams(route: DocsRoute): { packageId: string; versionId: string } {
    return {
        packageId: encodeURIComponent(route.packageId),
        versionId: encodeURIComponent(route.versionId)
    };
}

export async function overviewPaths(): Promise<{ params: { packageId: string; versionId: string } }[]> {
    const paths: { params: { packageId: string; versionId: string } }[] = [];
    for (const route of await docsRoutes()) {
        if (route.isOverview) paths.push({ params: encodedBaseParams(route) });
    }
    return paths;
}

export async function entityPaths(): Promise<
    { params: { packageId: string; versionId: string; entitySegments: string } }[]
> {
    const paths: { params: { packageId: string; versionId: string; entitySegments: string } }[] = [];
    for (const route of await docsRoutes()) {
        if (!route.isOverview) {
            paths.push({
                params: {
                    ...encodedBaseParams(route),
                    entitySegments: route.entitySegments.map(encodeURIComponent).join('/')
                }
            });
        }
    }
    return paths;
}
