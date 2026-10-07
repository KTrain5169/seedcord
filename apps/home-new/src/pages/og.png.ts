import { loadOgFonts, OG_SIZE } from '@seedcord/ui/og';
import { ImageResponse } from '@vercel/og';
import { createElement } from 'react';

import { OgCard } from '#lib/og/card';
import { OG_SCALE } from '#lib/site';

export function GET(): Response {
    const width = OG_SIZE.width * OG_SCALE;
    const height = OG_SIZE.height * OG_SCALE;

    return new ImageResponse(
        createElement(
            'div',
            {
                style: {
                    display: 'flex',
                    width,
                    height
                }
            },
            createElement(
                'div',
                {
                    style: {
                        display: 'flex',
                        transformOrigin: 'top left',
                        transform: `scale(${OG_SCALE})`
                    }
                },
                createElement(OgCard)
            )
        ),
        {
            width,
            height,
            fonts: loadOgFonts()
        }
    );
}
