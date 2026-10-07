'use client';

import { Button, GithubIcon, Icon, MobilePanel, cn, ScrollToTopButton } from '@seedcord/ui';

import { ClearHistoryRow } from '#components/header/settings/ClearHistoryRow';
import { Sidebar } from '#components/layout/sidebar/Sidebar';
import { IslandProviders } from '#components/providers/IslandProviders';
import { useUIStore } from '#store/ui';

import { DesktopSidebarFrame } from './DesktopSidebarFrame';

import type { DocsCatalog } from '#lib/docs/types';
import type { ReactNode } from 'react';

const mobilePanelFooter = (
    <div className={cn('flex items-center gap-2')}>
        <div className={cn('min-w-0 flex-1')}>
            <ClearHistoryRow />
        </div>
        <Button asChild variant="ghost" size="icon" aria-label="Open GitHub repository">
            {/* the router never intercepts an external link, so it needs no link component */}
            <a href="https://github.com/seedcord/seedcord" target="_blank" rel="noreferrer">
                <Icon icon={GithubIcon} size={18} />
            </a>
        </Button>
    </div>
);

interface PackageSidebarProps {
    catalog: DocsCatalog;
    // the page passes this from its url, because an island renders before the router exists
    pathname: string;
    activePackageId: string;
    activeVersionId: string;
}

const SIDEBAR_BASE_CLASS = 'flex w-full flex-col';
const MOBILE_SIDEBAR_OVERRIDES = 'border-transparent bg-transparent shadow-none';

/**
 * The navigation chrome of a package page, mounted as one hydrated island. The mobile panel portals
 * to the document body and the desktop frame parks in the sidebar column the page lays out, so the
 * island renders both without wrapping the page content a second tree would hydrate away.
 */
export function PackageSidebar({
    catalog,
    pathname,
    activePackageId,
    activeVersionId
}: PackageSidebarProps): ReactNode {
    const isMobileNavOpen = useUIStore((state) => state.isMobileNavOpen);
    const setMobileNavOpen = useUIStore((state) => state.setMobileNavOpen);

    return (
        <IslandProviders>
            <MobilePanel
                open={isMobileNavOpen}
                onOpenChange={setMobileNavOpen}
                title="Navigation"
                description="Slide-in navigation panel for the docs sidebar."
                footer={mobilePanelFooter}
            >
                <Sidebar
                    catalog={catalog}
                    pathname={pathname}
                    activePackageId={activePackageId}
                    activeVersionId={activeVersionId}
                    variant="mobile"
                    className={cn(SIDEBAR_BASE_CLASS, MOBILE_SIDEBAR_OVERRIDES)}
                    onSelect={() => setMobileNavOpen(false)}
                />
            </MobilePanel>

            <DesktopSidebarFrame
                sidebar={
                    <Sidebar
                        catalog={catalog}
                        pathname={pathname}
                        activePackageId={activePackageId}
                        activeVersionId={activeVersionId}
                        variant="desktop"
                        className={SIDEBAR_BASE_CLASS}
                    />
                }
            />

            <ScrollToTopButton className={cn('right-(--page-gutter)')} />
        </IslandProviders>
    );
}
