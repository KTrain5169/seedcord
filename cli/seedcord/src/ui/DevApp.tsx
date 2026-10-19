import { Box, useInput, useWindowSize } from 'ink';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Rule } from '#ui/components/primitives/Rule.tsx';
import { INITIAL_CURSOR } from '#ui/filterCursor.ts';
import { useDevState } from '#ui/hooks/useDevState.ts';
import { useFilters } from '#ui/hooks/useFilters.ts';
import { useLogs } from '#ui/hooks/useLogs.ts';
import { useMeasuredBox } from '#ui/hooks/useMeasuredBox.ts';
import { usePanelFit } from '#ui/hooks/usePanelFit.ts';
import { useRailWidth } from '#ui/hooks/useRailWidth.ts';
import { useScroll } from '#ui/hooks/useScroll.ts';
import { useUptime } from '#ui/hooks/useUptime.ts';
import { acceptsSessionKeys, dispatchHotkey } from '#ui/hotkeys.ts';
import { DevLayout } from '#ui/layout/DevLayout.tsx';
import { expandRows, rowKey, wrapRows } from '#ui/logRows.ts';
import { noticesOf } from '#ui/notices.tsx';
import { profileWrap } from '#ui/profile.ts';
import { LogStore } from '#ui/stores/LogStore.ts';
import { tierFor } from '#ui/tier.ts';

import type { LogFilters } from '#ui/devPrefs.ts';
import type { DevStore } from '#ui/stores/DevStore.ts';
import type { DOMElement } from 'ink';
import type { ReactElement } from 'react';

interface DevAppProps {
    readonly store: DevStore;
    readonly onReady: () => void;
    readonly initialFilters: LogFilters;
    readonly onFiltersChange?: (filters: LogFilters) => void;
    readonly onQuit?: () => Promise<void> | void;
    readonly onDisconnect?: () => Promise<void> | void;
    readonly onRestart?: () => Promise<void> | void;
    readonly onRefreshCommands?: (shouldRefresh: boolean) => Promise<void> | void;
}

export function DevApp(props: DevAppProps): ReactElement {
    const { store, onReady, initialFilters, onFiltersChange } = props;
    const state = useDevState(store);
    const { rows, columns } = useWindowSize();

    const tier = tierFor(rows, columns);
    const { filters, setFilters, view, toggleView } = useFilters(initialFilters, tier, onFiltersChange);
    const panelFit = usePanelFit();
    const keysView = tier === 'logs' && !panelFit.fits ? 'collapsed' : view;
    const [cursor, setCursor] = useState(INITIAL_CURSOR);

    const logBoxRef = useRef<DOMElement | null>(null);
    const logBox = useMeasuredBox(logBoxRef);

    const railRef = useRef<DOMElement | null>(null);
    const railWidth = useRailWidth(railRef, state.phase, rows, columns);

    const notices = noticesOf(state);

    const logs = useLogs(filters.channels, filters.levels);
    // the label width only grows with a new entry, so the logs dep already covers it
    const logRows = useMemo(
        () =>
            profileWrap(() => wrapRows(expandRows(logs), logBox.width, Math.max(1, LogStore.instance.getLabelWidth()))),
        [logs, logBox.width]
    );
    const viewportHeight = Math.max(1, logBox.height);
    const scroll = useScroll(logRows, viewportHeight, rowKey);
    const uptimeMs = useUptime(state, tier !== 'logs');

    const interactive = acceptsSessionKeys(state);

    useInput((input, key) => {
        dispatchHotkey({
            input,
            key,
            state,
            interactive,
            scroll,
            store,
            filters,
            setFilters,
            filterView: keysView,
            toggleFilterView: toggleView,
            cursor,
            setCursor,
            onQuit: props.onQuit,
            onDisconnect: props.onDisconnect,
            onRestart: props.onRestart,
            onRefreshCommands: props.onRefreshCommands
        });
    });

    const isInitializedRef = useRef(false);
    useEffect(() => {
        if (isInitializedRef.current) return;
        isInitializedRef.current = true;

        LogStore.instance.clear();
        LogStore.instance.mount();
        onReady();

        return () => {
            LogStore.instance.unmount();
        };
    }, [onReady]);

    return (
        <Box flexDirection="column" width={columns} height={rows} overflow="hidden">
            {/* need the rule for some padding at the top */}
            <Rule />
            <DevLayout
                state={state}
                tier={tier}
                notices={notices}
                railRef={railRef}
                railWidth={railWidth}
                logBoxRef={logBoxRef}
                scroll={scroll}
                viewportHeight={viewportHeight}
                measured={logBox.height > 0}
                filters={filters}
                filterView={view}
                panelFit={panelFit}
                cursor={cursor}
                interactive={interactive}
                uptimeMs={uptimeMs}
            />
        </Box>
    );
}
