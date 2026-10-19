import type { CommandAction } from '#components/search/command-palette/types.ts';
import type { ScoredEntry } from '@seedcord/docs-engine/client';

export interface SearchIndexEntry extends ScoredEntry {
    action: CommandAction;
}

export interface SearchPackage {
    id: string;
    label: string;
    fullName: string;
    stable: string | null;
    prerelease: string | null;
}
