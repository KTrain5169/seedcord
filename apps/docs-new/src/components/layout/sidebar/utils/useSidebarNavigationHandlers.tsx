'use client';
import { navigate } from 'astro:transitions/client';
import { useCallback } from 'react';

import { toPageHref } from '#lib/docs/pageHref';

import { buildVersionPath } from './buildVersionPath';

import type { PackageCatalogEntry, PackageVersionCatalog } from '#lib/docs/types';

export function useSidebarNavigationHandlers(
    catalog: readonly PackageCatalogEntry[],
    versionOptions: readonly PackageVersionCatalog[],
    pathname: string,
    restSegments: readonly string[]
): {
    handlePackageChange: (value: string) => void;
    handleVersionChange: (value: string) => void;
} {
    const handlePackageChange = useCallback(
        (value: string) => {
            const targetPackage = catalog.find((entry) => entry.id === value);
            if (!targetPackage) {
                return;
            }

            const targetVersion = targetPackage.versions[0];
            if (!targetVersion) {
                return;
            }

            navigate(toPageHref(targetVersion.basePath));
        },
        [catalog]
    );

    const handleVersionChange = useCallback(
        (value: string) => {
            const targetVersion = versionOptions.find((version) => version.id === value) ?? versionOptions[0];
            if (!targetVersion) {
                return;
            }

            const currentSegments = pathname.split('/').filter(Boolean);
            const targetSegments = targetVersion.basePath.split('/').filter(Boolean);
            const currentPackageSegment = currentSegments[2] ?? '';
            const targetPackageSegment = targetSegments[2] ?? '';
            const shouldPreserveRest = restSegments.length > 0 && currentPackageSegment === targetPackageSegment;

            navigate(
                toPageHref(shouldPreserveRest ? buildVersionPath(targetVersion, restSegments) : targetVersion.basePath)
            );
        },
        [restSegments, versionOptions, pathname]
    );

    return {
        handlePackageChange,
        handleVersionChange
    };
}
