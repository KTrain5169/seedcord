import { FAVICON_SIZE, MaterwelonFavicon } from '@seedcord/ui/MaterwelonFavicon';
import { BRAND } from '@seedcord/ui/palette';
import { ImageResponse } from '@vercel/og';
import { createElement } from 'react';

export function GET(): Response {
    return new ImageResponse(createElement(MaterwelonFavicon, { ring: BRAND.pith }), {
        ...FAVICON_SIZE,
        headers: {
            'Content-Type': 'image/png'
        }
    });
}
