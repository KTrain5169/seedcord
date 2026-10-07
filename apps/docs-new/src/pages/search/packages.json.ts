import { searchPackages } from '#lib/search/buildIndex';

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => Response.json(await searchPackages());
