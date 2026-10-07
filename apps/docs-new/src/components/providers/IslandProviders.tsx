'use client';

import { TooltipProvider } from '@seedcord/ui';

import { MotionProvider } from './MotionProvider';

import type { ReactNode } from 'react';

/**
 * The providers a hydrated island needs around it. Astro hydrates each island as its own React
 * tree, so the layout's providers cannot wrap one from outside. Every island that renders a
 * `SegmentedControl`, `SearchDialog`, `IconSwap` or a `Tooltip` mounts through here.
 */
export function IslandProviders({ children }: { children: ReactNode }): ReactNode {
    return (
        <MotionProvider>
            <TooltipProvider>{children}</TooltipProvider>
        </MotionProvider>
    );
}
