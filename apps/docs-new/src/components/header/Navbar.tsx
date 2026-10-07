'use client';

import {
    Button,
    GithubIcon,
    Icon,
    MobileNavButton,
    Navbar as NavbarShell,
    PlainLink,
    SearchIconButton,
    SearchTrigger,
    SiteSwitcher,
    GUIDE_URL,
    HOME_URL,
    REPO_URL,
    ThemeToggle,
    cn
} from '@seedcord/ui';

import { hasMobileNavPanel } from '#components/layout/sidebar/utils/hasMobileNavPanel';
import { log } from '#lib/logger';
import { SITE_URL } from '#lib/site';
import { useUIStore } from '#store/ui';

import { HeaderSettingsPopover } from './HeaderSettingsPopover';

import type { SiteDestination } from '@seedcord/ui';
import type { ReactElement } from 'react';

const SEARCH_LABEL = 'Search docs';

const DESTINATIONS: readonly SiteDestination[] = [
    { label: 'Home', href: HOME_URL },
    { label: 'Guide', href: GUIDE_URL },
    { label: 'Reference', href: SITE_URL, current: true }
];

interface NavbarProps {
    // the page passes this from its url, because an island renders before the router exists
    pathname: string;
}

export function Navbar({ pathname }: NavbarProps): ReactElement {
    const setMobileNavOpen = useUIStore((state) => state.setMobileNavOpen);
    const isMobileNavOpen = useUIStore((state) => state.isMobileNavOpen);
    const isCommandPaletteOpen = useUIStore((state) => state.isCommandPaletteOpen);
    const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);
    const showMobileNavButton = hasMobileNavPanel(pathname);

    const openSearch = (): void => {
        log('Search button clicked');
        setCommandPaletteOpen(!isCommandPaletteOpen);
    };

    return (
        <NavbarShell
            mark={<SiteSwitcher site="docs" destinations={DESTINATIONS} linkAs={PlainLink} />}
            center={<SearchTrigger label={SEARCH_LABEL} onOpen={openSearch} />}
            actions={
                <>
                    <SearchIconButton label={SEARCH_LABEL} onOpen={openSearch} />
                    {/* the burger panel's footer repeats these two */}
                    <span className={cn(showMobileNavButton ? 'hidden lg:flex' : 'flex', 'items-center gap-2')}>
                        <HeaderSettingsPopover />
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            aria-label="Open GitHub repository"
                            className={cn('text-(--text)')}
                        >
                            {/* the router never intercepts an external link, so it needs no link component */}
                            <a href={REPO_URL} target="_blank" rel="noreferrer">
                                <Icon icon={GithubIcon} size={20} />
                            </a>
                        </Button>
                    </span>
                    {/* moving this into the span above loses it on mobile */}
                    <ThemeToggle />
                    {showMobileNavButton ? (
                        <MobileNavButton
                            open={isMobileNavOpen}
                            onOpen={() => setMobileNavOpen(true)}
                            className={cn('lg:hidden')}
                        />
                    ) : null}
                </>
            }
        />
    );
}
