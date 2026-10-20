import { SeedcordErrorCode } from '@seedcord/errors';
import { SeedcordError, throwSingleOrAggregate } from '@seedcord/errors/internal';
import { isInside } from '@seedcord/utils/internal';

import type { Project } from '#core/project/Project';
import type { BotLayout } from '@seedcord/utils/internal';

function listedFolderProblem(layout: BotLayout, folder: string): SeedcordError | undefined {
    if (!layout.inProject(folder)) {
        return new SeedcordError(SeedcordErrorCode.CliListedFolderUnusable, [folder, 'outsideProject']);
    }
    return layout.listedReadProblem(folder);
}

export function assertPathsBundled({ config, files }: Project): void {
    const { target, root } = config;
    if (target.kind === 'server' && isInside(target.outDir, root)) {
        throw new SeedcordError(SeedcordErrorCode.CliConfigOutDirDeletesRoot, [target.outDir, root]);
    }
    const start = target.kind === 'server' && target.start !== undefined ? [target.start] : [];
    const problems = [
        ...config.files.flatMap((folder) => listedFolderProblem(files.layout, folder) ?? []),
        ...start.flatMap((path) => files.layout.bundleProblem(path) ?? [])
    ];
    throwSingleOrAggregate(problems, SeedcordErrorCode.CliProblems);
}
