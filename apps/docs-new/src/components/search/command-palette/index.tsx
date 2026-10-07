'use client';

import { HotkeyProvider } from '#components/providers/HotkeyProvider';
import { IslandProviders } from '#components/providers/IslandProviders';

import { CommandPaletteDialog } from './CommandPaletteDialog';
import { useCommandPaletteController } from './useCommandPaletteController';

import type { ReactElement } from 'react';

/**
 * The palette mounted as one hydrated island. The hotkey registration lives here rather than the
 * layout, because its listener toggles the same ui store every island shares.
 */
export function CommandPalette(): ReactElement | null {
    const controller = useCommandPaletteController();

    if (!controller.mounted) {
        return null;
    }

    return (
        <IslandProviders>
            <HotkeyProvider>
                <CommandPaletteDialog controller={controller} />
            </HotkeyProvider>
        </IslandProviders>
    );
}
