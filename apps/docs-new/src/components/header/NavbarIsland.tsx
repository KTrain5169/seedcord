'use client';

import { ThemeProvider } from '@seedcord/ui';

import { Navbar } from '#components/header/Navbar';
import { IslandProviders } from '#components/providers/IslandProviders';

import type { ReactElement } from 'react';

interface NavbarIslandProps {
    pathname: string;
}

/**
 * The navbar mounted as one hydrated island. `ThemeProvider` lives here: next-themes resolves the
 * stored theme onto the document root, and `ThemeToggle` reads its context, so the two cannot split
 * across islands.
 */
export function NavbarIsland({ pathname }: NavbarIslandProps): ReactElement {
    return (
        <ThemeProvider>
            <IslandProviders>
                <Navbar pathname={pathname} />
            </IslandProviders>
        </ThemeProvider>
    );
}
