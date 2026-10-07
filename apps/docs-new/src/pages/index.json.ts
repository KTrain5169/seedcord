import { getDocsEngine } from '#lib/docs/engine';

import type { APIRoute } from 'astro';

// the docs worker reads this to send an old patch to the head of its line
export const GET: APIRoute = async () => Response.json(await (await getDocsEngine()).ready());
