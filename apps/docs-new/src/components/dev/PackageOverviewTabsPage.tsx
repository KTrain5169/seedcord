'use client';

import { cn } from '@seedcord/ui';

import { PackageOverviewTabs } from '#components/docs/PackageOverviewTabs';
import { ReadmeBlock } from '#components/docs/ReadmeBlock';

import type { ReactElement, ReactNode } from 'react';

function DevSection({ title, children }: { title: string; children: ReactNode }): ReactElement {
    return (
        <section className={cn('space-y-3')}>
            <h2 className={cn('text-subtle text-xs font-semibold tracking-widest uppercase')}>{title}</h2>
            {children}
        </section>
    );
}

function MockReference(): ReactElement {
    const entities = ['Bot', 'Seedcord', 'Lifecycle', 'MemoryRateLimiter', 'Logger', 'round', 'ordinal', 'prettify'];
    return (
        <div className={cn('flex flex-wrap gap-2')}>
            {entities.map((entity) => (
                <span
                    key={entity}
                    className={cn(
                        'rounded-xl border border-(--border) bg-(--surface-subtle) px-3 py-1.5 text-sm text-(--text)'
                    )}
                >
                    {entity}
                </span>
            ))}
        </div>
    );
}

// the readme html renders at build; the island takes the finished strings
export function PackageOverviewTabsPage({
    shortHtml,
    longHtml
}: {
    shortHtml: string;
    longHtml: string;
}): ReactElement {
    return (
        <div className={cn('space-y-10 pb-32')}>
            <header className={cn('space-y-2')}>
                <h1 className={cn('text-2xl font-semibold tracking-tight text-(--text)')}>PackageOverviewTabs</h1>
                <p className={cn('text-subtle text-sm')}>
                    README | Reference Overview segmented toggle above the entities list. README is the default tab; the
                    README option is disabled when a version has no README.
                </p>
            </header>
            <DevSection title="With README (default tab = README)">
                <PackageOverviewTabs
                    title="seedcord"
                    version="v0.11.0"
                    readme={<ReadmeBlock html={shortHtml} />}
                    reference={<MockReference />}
                />
            </DevSection>
            <DevSection title="Long README (headings, list, code, table, blockquote)">
                <PackageOverviewTabs
                    title="seedcord"
                    version="v0.11.0"
                    readme={<ReadmeBlock html={longHtml} />}
                    reference={<MockReference />}
                />
            </DevSection>
            <DevSection title="No README (option disabled, defaults to Reference Overview)">
                <PackageOverviewTabs title="seedcord" version="v0.11.0" readme={null} reference={<MockReference />} />
            </DevSection>
        </div>
    );
}
