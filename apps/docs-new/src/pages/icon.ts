import { FAVICON_SIZE, MaterwelonFavicon } from '@seedcord/ui/MaterwelonFavicon';
import { BRAND } from '@seedcord/ui/palette';
import { ImageResponse } from '@vercel/og';
import { createElement } from 'react';

export async function GET(): Promise<Response> {
    // astro routes no jsx file, so the favicon builds through createElement
    return new ImageResponse(createElement(MaterwelonFavicon, { ring: BRAND.flesh }), { ...FAVICON_SIZE });
}
