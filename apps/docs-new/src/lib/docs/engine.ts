import { VersionedDocsEngine } from '@seedcord/docs-engine';
import { fetchFileOrUrl, workspaceIndexLoader } from '@seedcord/docs-engine/workspace';

// one loader caches the index for every engine below, and the engines share the models they load,
// so an instance costs nothing past the first build of each package version
const INDEX_LOADER = workspaceIndexLoader();

/**
 * A fresh engine, for code that calls `setVersion`. That call mutates the instance, so an engine
 * shared across concurrently generated routes would mix versions. The loaded models are cached
 * module-wide, so opening an engine per operation is cheap.
 */
export function openDocsEngine(): VersionedDocsEngine {
    return new VersionedDocsEngine(INDEX_LOADER, fetchFileOrUrl);
}

// read-only calls never call setVersion, so an instance per call mixes nothing
export const getDocsEngine = (): Promise<VersionedDocsEngine> => Promise.resolve(openDocsEngine());
