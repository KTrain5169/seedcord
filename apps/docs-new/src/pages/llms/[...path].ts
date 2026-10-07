import { TWIN } from '@seedcord/ui/page-asset';

import { findPackageVersion } from '#lib/docs/catalog';
import { DocsRoute, docsRoutes } from '#lib/docs/DocsRoute';
import { entityToMarkdown } from '#lib/docs/entityMarkdown';
import { decodeSegments } from '#lib/docs/pageContext';
import { resolveEntity } from '#lib/docs/resolveEntity';
import { canonicalUrl } from '#lib/site';

import type { APIContext } from 'astro';

const MARKDOWN = { 'content-type': 'text/markdown; charset=utf-8' } as const;

function notFound(): Response {
    return new Response('# Not found\n\nThis documentation page does not exist.\n', { status: 404, headers: MARKDOWN });
}

// astro matches getStaticPaths params against the raw request path, so a segment encodes before
// the join or a slug namespaced like jsx/element arrives as two segments
export async function getStaticPaths() {
    const paths: { params: { path: string } }[] = [];
    for (const route of await docsRoutes()) {
        paths.push({ params: { path: TWIN.fileSegments(route.segments).map(encodeURIComponent).join('/') } });
    }
    return paths;
}

// a page's markdown answers at its own url plus .md
export async function GET({ params }: APIContext): Promise<Response> {
    const segments = TWIN.pageSegments(decodeSegments(params.path));
    const route = segments && DocsRoute.parse(segments);
    if (!route) return notFound();

    if (route.isOverview) {
        const context = await findPackageVersion(route.packageId, route.versionId);
        if (!context) return notFound();
        const { entry, version } = context;
        const url = canonicalUrl(new DocsRoute(entry.id, version.id).path);
        const body = `# ${entry.label}\n\n\`package\` · ${version.label}\n\n<${url}>\n\n${entry.description}\n`;
        return new Response(body, { headers: MARKDOWN });
    }

    const resolved = await resolveEntity(route.params).catch((): null => null);
    if (!resolved) return notFound();

    const url = canonicalUrl(new DocsRoute(resolved.entry.id, resolved.version.id, route.entitySegments).path);
    return new Response(entityToMarkdown(resolved.entity, url), { headers: MARKDOWN });
}
