import { PreviewCard } from '@seedcord/ui/link-preview';
import { ComponentEmbed } from 'discord-component-embed/react';

import type { PreviewCardProps } from '@seedcord/ui/link-preview';
import type { ReactElement } from 'react';

/**
 * The link-preview mock a docs page offers Discord's crawler. `ComponentEmbed` reads its children as
 * a React tree, so the pair composes here rather than across an Astro boundary, where children
 * arrive as rendered html.
 */
export function EmbedPreview(props: PreviewCardProps): ReactElement {
    return (
        <ComponentEmbed>
            <PreviewCard {...props} />
        </ComponentEmbed>
    );
}
