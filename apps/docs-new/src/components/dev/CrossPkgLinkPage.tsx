'use client';

import { CodeBlock, cn } from '@seedcord/ui';

import { CommentParagraphs } from '#components/docs/entity/comments/CommentParagraphs';

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

// the route renders the prose and signature at build and hands the island the finished strings
export function CrossPkgLinkPage({
    proseHtml,
    representation
}: {
    proseHtml: string;
    representation: CodeRepresentation;
}): ReactElement {
    return (
        <div className={cn('space-y-10')}>
            <header className={cn('space-y-2')}>
                <h1 className={cn('text-2xl font-semibold tracking-tight text-(--text)')}>Cross-package links</h1>
                <p className={cn('text-subtle text-sm')}>
                    Current package: <code>seedcord</code>. Links that leave it (different package or external) open in
                    a new tab. The arrow indicator appears in prose only, never inside code blocks.
                </p>
            </header>
            <Section title="Prose (TSDoc comment text)">
                <CommentParagraphs paragraphs={[{ plain: '', html: proseHtml }]} />
            </Section>
            <Section title="Inside a signature (code block, no icon)">
                <CodeBlock representation={representation} label="getClient" />
            </Section>
        </div>
    );
}
