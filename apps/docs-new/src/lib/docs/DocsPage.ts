import { buildPackageBasePath, DEFAULT_VERSION } from '@seedcord/docs-engine/client';
import { ogPageCardAlt } from '@seedcord/ui/OgCard';
import { CARD, TWIN } from '@seedcord/ui/page-asset';
import { BRAND } from '@seedcord/ui/palette';

import { plainSummary } from '#lib/docs/plainSummary';
import { ENTITY_TONE_HEX } from '#lib/entityColors';
import { canonicalUrl, OG_IMAGE_H, OG_IMAGE_W, SITE_DESCRIPTION, SITE_NAME } from '#lib/site';

import type { EntityModel, PackageCatalogEntry, PackageVersionCatalog } from '#lib/docs/types';
import type { OgPageCardProps } from '@seedcord/ui/OgCard';

export type DocsCard = Omit<OgPageCardProps, 'domain'>;

export function rootCard(): DocsCard {
    return { pill: 'docs', accent: BRAND.seedDark, meta: [], name: 'Reference', description: SITE_DESCRIPTION };
}

export function packageCard(entry: PackageCatalogEntry, version: PackageVersionCatalog): DocsCard {
    return {
        pill: 'package',
        accent: BRAND.seedDark,
        meta: [version.label],
        name: entry.label,
        description: entry.description
    };
}

export function entityCard(entity: EntityModel, version: PackageVersionCatalog): DocsCard {
    const summary = plainSummary(entity.summary[0]?.plain ?? '');
    return {
        pill: entity.kind,
        accent: ENTITY_TONE_HEX[entity.kind].light,
        meta: [entity.displayPackage, version.label],
        name: entity.name,
        description: summary.length > 0 ? summary : `${entity.name}, a ${entity.kind} in ${entity.displayPackage}.`
    };
}

export function notFoundCard(): DocsCard {
    return {
        pill: '404',
        accent: BRAND.seedDark,
        meta: [],
        name: 'Not found',
        description: 'This documentation page does not exist.'
    };
}

const DESCRIPTION_MAX = 160;

function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

// seedcord and @seedcord/* titles already say seedcord
function titleFor(text: string, packageName: string): string {
    const branded = packageName === SITE_NAME || packageName.startsWith(`@${SITE_NAME}/`);
    return branded ? text : `${text} · ${SITE_NAME}`;
}

interface PageFacts {
    path: string;
    title: string;
    card: DocsCard;
    image: string;
    markdownPath?: string;
    isArticle?: boolean;
    // `undefined` drops the page from the index
    canonicalPath?: string | undefined;
}

// what the base layout renders into the document head, in plain values no framework owns
export interface PageHead {
    title: string;
    description: string;
    // the url search engines should index for this page
    canonical: string;
    ogType: 'website' | 'article';
    image: { url: string; width: number; height: number; alt: string };
    // the markdown twin of the page, when one is generated
    markdownUrl?: string;
    // a page with no canonical has no page to merge into, so it leaves the index
    noindex?: boolean;
    // the dev playground never leaves the local build
    nofollow?: boolean;
}

export class DocsPage {
    private constructor(private readonly facts: PageFacts) {}

    get card(): DocsCard {
        return this.facts.card;
    }

    get markdownUrl(): string | undefined {
        return this.facts.markdownPath === undefined ? undefined : canonicalUrl(this.facts.markdownPath);
    }

    head(): PageHead {
        const { path, title, card, image, isArticle, canonicalPath } = this.facts;
        // reduced to plain text because social embeds render markdown and newlines literally
        const description = truncate(plainSummary(card.description), DESCRIPTION_MAX);
        const imageUrl = canonicalUrl(image);

        return {
            title,
            description,
            canonical: canonicalUrl(canonicalPath ?? path),
            ogType: isArticle ? 'article' : 'website',
            image: { url: imageUrl, width: OG_IMAGE_W, height: OG_IMAGE_H, alt: ogPageCardAlt(card) },
            ...(this.markdownUrl ? { markdownUrl: this.markdownUrl } : {}),
            ...(canonicalPath === undefined ? { noindex: true } : {})
        };
    }

    static root(): DocsPage {
        return new DocsPage({
            path: '/',
            title: `${SITE_NAME} API reference`,
            card: rootCard(),
            image: CARD.publicPath('/'),
            canonicalPath: '/'
        });
    }

    static forPackage(entry: PackageCatalogEntry, version: PackageVersionCatalog): DocsPage {
        const path = buildPackageBasePath(entry.manifestName, version.id);
        const latestPath = buildPackageBasePath(entry.manifestName, DEFAULT_VERSION);
        return new DocsPage({
            path,
            title: titleFor(`${entry.manifestName} ${version.label}`, entry.manifestName),
            card: packageCard(entry, version),
            image: CARD.publicPath(latestPath),
            markdownPath: TWIN.publicPath(path),
            canonicalPath: latestPath
        });
    }

    static forEntity(
        path: string,
        entity: EntityModel,
        version: PackageVersionCatalog,
        canonicalPath: string | undefined
    ): DocsPage {
        return new DocsPage({
            path,
            title: titleFor(`${entity.name} · ${entity.manifestPackage}`, entity.manifestPackage),
            card: entityCard(entity, version),
            // only latest pages get a card
            image: CARD.publicPath(canonicalPath ?? buildPackageBasePath(entity.manifestPackage, DEFAULT_VERSION)),
            markdownPath: TWIN.publicPath(path),
            isArticle: true,
            canonicalPath
        });
    }
}
