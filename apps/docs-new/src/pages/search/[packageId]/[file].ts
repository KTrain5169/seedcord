import { loadDocsCatalog } from '#lib/docs/catalog';
import { decodeParam } from '#lib/docs/pageContext';
import { searchIndexFor } from '#lib/search/buildIndex';
import { searchFileName, versionFromFile } from '#lib/search/files';

import type { APIContext } from 'astro';

interface SearchFileParams {
    packageId: string;
    file: string;
}

export async function getStaticPaths(): Promise<{ params: SearchFileParams }[]> {
    const catalog = await loadDocsCatalog();
    return catalog.flatMap((entry) =>
        entry.versions.map((version) => ({
            // the search client builds its fetch urls the same encoded way
            params: { packageId: encodeURIComponent(entry.id), file: searchFileName(version.id) }
        }))
    );
}

export async function GET({ params }: APIContext): Promise<Response> {
    const packageId = decodeParam(params.packageId);
    const version = versionFromFile(params.file ?? '');
    const entries = version === undefined ? null : await searchIndexFor(packageId, version);
    return entries === null ? Response.json([], { status: 404 }) : Response.json(entries);
}
