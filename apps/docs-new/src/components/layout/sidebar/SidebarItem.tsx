'use client';

import { cn, PlainLink } from '@seedcord/ui';

import { toPageHref } from '#lib/docs/pageHref';
import { log } from '#lib/logger';

import type { SidebarItemProps } from './types';
import type { ReactElement } from 'react';

export function SidebarItem({
    label,
    href,
    icon: ItemIcon,
    styles,
    isActive,
    onSelect
}: SidebarItemProps): ReactElement {
    return (
        <PlainLink
            href={toPageHref(href)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'flex w-full items-center gap-2 rounded-md border border-transparent bg-transparent px-3 py-2 text-left text-sm font-medium text-(--text) transition focus-visible:outline-2 focus-visible:outline-offset-2',
                styles.item,
                isActive ? styles.badge : null
            )}
            onClick={() => {
                log('Sidebar item activated', { label, href });
                onSelect?.();
            }}
        >
            <span className={cn('inline-flex size-6 items-center justify-center rounded-md border', styles.badge)}>
                <ItemIcon size={14} strokeWidth={2} aria-hidden />
            </span>

            <span className={cn('min-w-0 truncate')}>{label}</span>
        </PlainLink>
    );
}
