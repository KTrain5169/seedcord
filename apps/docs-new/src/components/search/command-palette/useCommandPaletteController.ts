'use client';

import { navigate } from 'astro:transitions/client';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { toPageHref } from '#lib/docs/pageHref';
import { log } from '#lib/logger';
import { searchFiles } from '#lib/search/SearchFiles';
import { useUIStore, type UIStore } from '#store/ui';

import { ALL_PACKAGES, FOCUS_DELAY_MS, isKindFilter } from './constants';

import type { SearchCatalog } from '#lib/search/SearchCatalog';
import type { KindFilter } from './constants';
import type { CommandAction, DocsPackageOption } from './types';

function buildNavigationHref(action: CommandAction, origin: string): string {
    try {
        const targetUrl = new URL(action.href, origin);
        return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
    } catch {
        return action.href;
    }
}

function useSearchCatalog(open: boolean): SearchCatalog | null {
    const [catalog, setCatalog] = useState<SearchCatalog | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (catalog || (failed && !open)) return undefined;

        let cancelled = false;
        searchFiles
            .catalog()
            .then((loaded) => {
                if (!cancelled) setCatalog(loaded);
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });

        return () => {
            cancelled = true;
        };
    }, [open, catalog, failed]);

    return catalog;
}

interface FilterValues {
    scope: string;
    kind: KindFilter;
    prerelease: boolean;
}

interface SearchFilters extends FilterValues {
    handleScopeChange: (scope: string) => void;
    handleKindChange: (kind: string) => void;
    handlePrereleaseChange: (prerelease: boolean) => void;
    resetFilters: () => void;
}

const DEFAULT_FILTERS: FilterValues = { scope: ALL_PACKAGES, kind: 'all', prerelease: false };

function useSearchFilters(): SearchFilters {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const handleScopeChange = useCallback((scope: string) => setFilters((prev) => ({ ...prev, scope })), []);
    const handleKindChange = useCallback((kind: string) => {
        if (isKindFilter(kind)) setFilters((prev) => ({ ...prev, kind }));
    }, []);
    const handlePrereleaseChange = useCallback(
        (prerelease: boolean) => setFilters((prev) => ({ ...prev, prerelease })),
        []
    );
    const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);
    return { ...filters, handleScopeChange, handleKindChange, handlePrereleaseChange, resetFilters };
}

export interface CommandPaletteController {
    open: boolean;
    mounted: boolean;
    searchValue: string;
    scope: string;
    kind: KindFilter;
    prerelease: boolean;
    hasPrerelease: boolean;
    packages: DocsPackageOption[];
    inputRef: RefObject<HTMLInputElement | null>;
    handleOpenChange: (open: boolean) => void;
    handleValueChange: (value: string) => void;
    handleScopeChange: (scope: string) => void;
    handleKindChange: (kind: string) => void;
    handlePrereleaseChange: (prerelease: boolean) => void;
    handleClose: () => void;
    handleSelect: (action: CommandAction) => void;
}

export function useCommandPaletteController(): CommandPaletteController {
    const { open, setCommandPaletteOpen } = useUIStore(
        useShallow((state: UIStore) => ({
            open: state.isCommandPaletteOpen,
            setCommandPaletteOpen: state.setCommandPaletteOpen
        }))
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchValue, setSearchValue] = useState('');
    const { scope, kind, prerelease, handleScopeChange, handleKindChange, handlePrereleaseChange, resetFilters } =
        useSearchFilters();
    const [mounted] = useState(() => typeof window !== 'undefined');
    const catalog = useSearchCatalog(open);

    useEffect(() => {
        if (!mounted) return undefined;

        if (open) {
            // the input takes focus only once the Radix dialog has painted
            const focusTimeout = window.setTimeout(() => {
                inputRef.current?.select();
            }, FOCUS_DELAY_MS);
            log('Command palette opened', { fromPath: window.location.pathname });
            return () => {
                window.clearTimeout(focusTimeout);
            };
        }

        log('Command palette closed');
        return undefined;
    }, [mounted, open]);

    const handleOpenChange = useCallback(
        (next: boolean): void => {
            if (next) {
                setSearchValue('');
                resetFilters();
            }
            setCommandPaletteOpen(next);
        },
        [setCommandPaletteOpen, resetFilters]
    );

    const handleClose = useCallback(() => setCommandPaletteOpen(false), [setCommandPaletteOpen]);

    const handleSelect = useCallback(
        (action: CommandAction): void => {
            log('Command palette item selected', action);
            handleClose();

            if (action.isExternal) {
                window.open(action.href, '_blank', 'noopener');
                return;
            }

            // the router resolves the href against the current page before it navigates. the
            // search index carries base-relative paths, so the served /docs prefix goes on first
            navigate(buildNavigationHref({ ...action, href: toPageHref(action.href) }, window.location.origin));
        },
        [handleClose]
    );

    return {
        open,
        mounted,
        searchValue,
        scope,
        kind,
        prerelease,
        hasPrerelease: catalog?.hasPrerelease ?? false,
        packages: catalog?.options ?? [],
        inputRef,
        handleOpenChange,
        handleValueChange: setSearchValue,
        handleScopeChange,
        handleKindChange,
        handlePrereleaseChange,
        handleClose,
        handleSelect
    };
}
