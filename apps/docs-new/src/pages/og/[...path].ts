import { DOCS } from '@seedcord/ui';
import { OG_SIZE } from '@seedcord/ui/og';
import { OgPageCard } from '@seedcord/ui/OgCard';
import { CARD } from '@seedcord/ui/page-asset';
import { ImageResponse } from '@vercel/og';
import { createElement } from 'react';

import { findPackageVersion } from '#lib/docs/catalog';
import { entityCard, notFoundCard, packageCard, rootCard, type DocsCard } from '#lib/docs/DocsPage';
import { DocsRoute, docsRoutes } from '#lib/docs/DocsRoute';
import { decodeSegments } from '#lib/docs/pageContext';
import { resolveEntity } from '#lib/docs/resolveEntity';
import { OG_FONTS } from '#lib/og/fonts';

import type { APIContext } from 'astro';

// a 404 only renders where a request reaches this handler, which the built site never does
type CardStatus = { card: DocsCard; status?: number };

async function render({ card, status }: CardStatus): Promise<Response> {
    // astro routes no jsx file, so the card tree builds through createElement
    return new ImageResponse(createElement(OgPageCard, { ...card, domain: DOCS.label }), {
        ...OG_SIZE,
        fonts: OG_FONTS,
        ...(status ? { status } : {})
    });
}

// astro matches getStaticPaths params against the raw request path, so a segment encodes before
// the join or a slug namespaced like jsx/element arrives as two segments
export async function getStaticPaths() {
    const paths: { params: { path: string } }[] = [{ params: { path: CARD.fileSegments([]).join('/') } }];
    for (const route of await docsRoutes()) {
        if (route.isLatest) {
            paths.push({
                params: { path: CARD.fileSegments(route.segments).map(encodeURIComponent).join('/') }
            });
        }
    }
    return paths;
}

export async function GET({ params }: APIContext): Promise<Response> {
    const segments = CARD.pageSegments(decodeSegments(params.path));
    if (segments?.length === 0) return render({ card: rootCard() });

    const route = segments && DocsRoute.parse(segments);
    if (!route) return render({ card: notFoundCard(), status: 404 });

    if (route.isOverview) {
        const context = await findPackageVersion(route.packageId, route.versionId);
        return context
            ? render({ card: packageCard(context.entry, context.version) })
            : render({ card: notFoundCard(), status: 404 });
    }

    const resolved = await resolveEntity(route.params).catch((): null => null);
    return resolved
        ? render({ card: entityCard(resolved.entity, resolved.version) })
        : render({ card: notFoundCard(), status: 404 });
}
