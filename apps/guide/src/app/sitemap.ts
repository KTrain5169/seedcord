import { sitemapEntries } from '#lib/site.ts';
import { source } from '#lib/source.ts';

import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return sitemapEntries(source.getPages());
}
