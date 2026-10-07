'use client';

import { CodeBlock, cn } from '@seedcord/ui';

import { IslandProviders } from '#components/providers/IslandProviders';

import type { CodeRepresentation } from '@seedcord/ui';
import type { ReactElement } from 'react';

function Section({ title, children }: { title: string; children: ReactElement | ReactElement[] }): ReactElement {
    return (
        <section className={cn('space-y-3')}>
            <h2 className={cn('text-subtle text-xs font-semibold tracking-widest uppercase')}>{title}</h2>
            {children}
        </section>
    );
}

// highlighting is a consumer concern: the route runs it at build and hands the island the result
export function CodeBlockPage({ representation }: { representation: CodeRepresentation }): ReactElement {
    return (
        <IslandProviders>
            <div className={cn('space-y-10')}>
                <header className={cn('space-y-2')}>
                    <h1 className={cn('text-2xl font-semibold tracking-tight text-(--text)')}>CodeBlock</h1>
                    <p className={cn('text-subtle text-sm')}>
                        Composes Card with a custom figcaption header. Takes pre-rendered `CodeRepresentation`. Suppress
                        the copy button by passing `copyValue={null}`. Drops the previous async + shiki coupling;
                        consumers pre-highlight.
                    </p>
                </header>
                <Section title="With label + copy (real shiki render)">
                    <CodeBlock representation={representation} label="bus.publish" />
                </Section>
                <Section title="Copy only (no label)">
                    <CodeBlock representation={representation} />
                </Section>
                <Section title="Label only (copy suppressed)">
                    <CodeBlock representation={representation} label="signature" copyValue={null} />
                </Section>
                <Section title="Custom copy value">
                    <CodeBlock representation={representation} label="install" copyValue="npm install seedcord" />
                </Section>
            </div>
        </IslandProviders>
    );
}
