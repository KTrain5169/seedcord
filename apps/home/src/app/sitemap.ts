import { canonicalUrl } from '#lib/site.ts';

import type { MetadataRoute } from 'next';

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
    return [{ url: canonicalUrl('/'), lastModified: new Date(), changeFrequency: 'monthly', priority: 1 }];
}
