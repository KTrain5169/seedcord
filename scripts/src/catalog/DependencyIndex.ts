import { readFileSync } from 'node:fs';

type DepField = 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';

export interface DepRef {
    packageJsonPath: string;
    packageName: string | undefined;
    field: DepField;
    version: string;
}

interface PackageManifest {
    path: string;
    json: object;
}

const FIELDS: readonly DepField[] = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

// one package can list the same dep as both a peer and a devDependency
export function distinctPackages(refs: readonly DepRef[]): number {
    return new Set(refs.map((one) => one.packageJsonPath)).size;
}

export class DependencyIndex {
    // justified: every path comes from the workspace, which only lists parsed package.json files
    static read(paths: readonly string[]): DependencyIndex {
        return new DependencyIndex(
            paths.map((path) => ({ path, json: JSON.parse(readFileSync(path, 'utf8')) as object }))
        );
    }

    private readonly byName = new Map<string, DepRef[]>();

    constructor(manifests: readonly PackageManifest[]) {
        for (const { path, json } of manifests) {
            const packageName = 'name' in json && typeof json.name === 'string' ? json.name : undefined;
            for (const field of FIELDS) {
                // justified: npm keeps each dependency field as a name to range map
                const block = (json as Record<string, unknown>)[field];
                if (typeof block !== 'object' || block === null) continue;

                for (const [name, version] of Object.entries(block as Record<string, string>)) {
                    const refs = this.byName.get(name) ?? [];
                    refs.push({ packageJsonPath: path, packageName, field, version });
                    this.byName.set(name, refs);
                }
            }
        }
    }

    names(): string[] {
        return [...this.byName.keys()];
    }

    refsFor(name: string): readonly DepRef[] {
        return this.byName.get(name) ?? [];
    }
}
