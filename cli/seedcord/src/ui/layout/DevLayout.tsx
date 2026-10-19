import { Box } from 'ink';
import React from 'react';

import { FilterPanel } from '#ui/components/primitives/FilterPanel.tsx';
import { LogHeader } from '#ui/components/primitives/LogHeader.tsx';
import { NotificationStack } from '#ui/components/primitives/NotificationStack.tsx';
import { Rule } from '#ui/components/primitives/Rule.tsx';
import { ScrollableLogView } from '#ui/components/primitives/ScrollableLogView.tsx';
import { Sidebar } from '#ui/components/primitives/Sidebar.tsx';
import { StatusLine } from '#ui/components/primitives/StatusLine.tsx';

import type { LogFilters } from '#ui/devPrefs.ts';
import type { FilterCursor } from '#ui/filterCursor.ts';
import type { FilterView } from '#ui/hooks/useFilters.ts';
import type { PanelFit } from '#ui/hooks/usePanelFit.ts';
import type { ScrollApi } from '#ui/hooks/useScroll.ts';
import type { LogRow } from '#ui/logRows.ts';
import type { Notice } from '#ui/notices.tsx';
import type { DevState } from '#ui/stores/DevStore.ts';
import type { Tier } from '#ui/tier.ts';
import type { DOMElement } from 'ink';
import type { ReactElement, Ref } from 'react';

export interface DevLayoutProps {
    readonly state: DevState;
    readonly tier: Tier;
    readonly notices: readonly Notice[];
    readonly railRef: Ref<DOMElement>;
    // measured once per run and held until the next restart, null before the measurement completes
    readonly railWidth: number | null;
    // the shell measures this box to size the scroll window. it must be attached or the viewport is empty
    readonly logBoxRef: Ref<DOMElement>;
    readonly scroll: ScrollApi<LogRow>;
    readonly viewportHeight: number;
    readonly measured: boolean;
    readonly filters: LogFilters;
    readonly filterView: FilterView;
    readonly panelFit: PanelFit;
    readonly cursor: FilterCursor;
    readonly interactive: boolean;
    readonly uptimeMs: number | null;
}

// notification cards render below the logs so stack traces have room
export function DevLayout(props: DevLayoutProps): ReactElement {
    const { state, tier, notices, railRef, railWidth, logBoxRef, scroll, viewportHeight, measured } = props;
    const { filters, filterView, panelFit, cursor, interactive, uptimeMs } = props;
    const railed = tier === 'full' || tier === 'compact';

    return (
        <Box flexGrow={1}>
            {railed ? (
                <Sidebar
                    ref={railRef}
                    state={state}
                    filters={filters}
                    uptimeMs={uptimeMs}
                    following={scroll.following}
                    interactive={interactive}
                    cursor={cursor}
                    width={railWidth}
                    view={filterView}
                />
            ) : null}
            <Box
                flexDirection="column"
                flexGrow={1}
                minWidth={0}
                borderStyle="single"
                borderColor="gray"
                borderTop={false}
                borderRight={false}
                borderBottom={false}
                borderLeft={railed}
                paddingLeft={railed ? 1 : 0}
                overflow="hidden"
            >
                {railed ? null : (
                    <StatusLine
                        state={state}
                        notices={notices}
                        filtered={filters.channels.size > 0 || filters.levels.size > 0}
                        filtersShown={filterView === 'shown'}
                    />
                )}
                {railed ? null : <Rule />}
                {!railed && filterView === 'shown' ? (
                    <FilterPanel filters={filters} cursor={cursor} {...panelFit} />
                ) : (
                    <>
                        <LogHeader following={scroll.following} below={scroll.below} />
                        {/* the notification stack is unbounded, so the pane keeps a row back for its own message */}
                        <Box ref={logBoxRef} flexGrow={1} minHeight={1} overflow="hidden">
                            <ScrollableLogView
                                visible={scroll.visible}
                                viewportHeight={viewportHeight}
                                measured={measured}
                            />
                        </Box>
                    </>
                )}
                {railed ? <NotificationStack notices={notices} /> : null}
            </Box>
        </Box>
    );
}
