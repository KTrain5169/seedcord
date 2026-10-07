import { formatRenderedSignaturePretty, type RenderedSignature, type ResolveHref } from '@seedcord/docs-engine';
import { highlightSignatureToHtml, type CodeLink } from '@seedcord/ui/shiki';

import { decorateProseLinks } from '#lib/docs/comments/renderers/decorateProseLinks';
import { opensInNewTab } from '#lib/docs/crossPackage';
import { toPageHref } from '#lib/docs/pageHref';
import { sanitizeHtml } from '#lib/sanitizeHtml';

import type { CodeRepresentation } from '@seedcord/ui';

const CURRENT_PACKAGE = 'seedcord';
const EMPTY_ANCHOR = /<a\b[^>]*>\s*<\/a>/g;

// marked renders a markdown `[label](href)` link as `<a href><code>label</code></a>`, so this
// mirrors that shape. the hrefs carry the served /docs prefix, matching what the real comment
// pipeline bakes through toPageHref
const RAW_PROSE =
    `<p>Returns a <a href="${toPageHref('/packages/seedcord/latest/classes/Seedcord')}"><code>Seedcord</code></a> ` +
    'instance (same package, in-tab, no icon), wraps ' +
    `<a href="${toPageHref('/packages/utils/latest/functions/clamp')}"><code>clamp</code></a> ` +
    'from another package (new tab + icon), and mirrors the ' +
    '<a href="https://discord.js.org/docs">discord.js client</a> (external, new tab + icon).</p>';

// adversarial case, the function name `getClient` contains the substring Client. the real engine
// assigns the ref offset through a sentinel marker (pretty-formatter substituteRefs) so only the
// return-type token links. going through that real path catches the earlier `getClient` mislink
// that a faked offset would miss
const SIGNATURE: RenderedSignature = {
    name: [{ kind: 'text', text: 'getClient' }],
    parameters: [],
    returnType: { parts: [{ kind: 'ref', text: 'Client', ref: { name: 'Client', packageName: '@seedcord/utils' } }] }
};

const resolveClientHref: ResolveHref = (reference) =>
    reference.name === 'Client' ? toPageHref('/packages/utils/latest/classes/Client') : null;

export interface CrossPkgLinkCase {
    proseHtml: string;
    representation: CodeRepresentation;
}

export async function crossPkgLinkCase(): Promise<CrossPkgLinkCase> {
    const proseHtml = sanitizeHtml(decorateProseLinks(RAW_PROSE, CURRENT_PACKAGE));

    const { text, refs } = await formatRenderedSignaturePretty(SIGNATURE, resolveClientHref, false);
    // mirrors formatting.ts, exercising the same ref-to-link mapping the real formatter uses
    const links: CodeLink[] = refs.flatMap((ref) =>
        ref.href
            ? [
                  {
                      name: ref.name,
                      href: ref.href,
                      start: ref.start,
                      end: ref.end,
                      external: opensInNewTab(ref.href, CURRENT_PACKAGE)
                  }
              ]
            : []
    );
    const html = (await highlightSignatureToHtml(text, links)) ?? '';
    return { proseHtml, representation: { text, html: sanitizeHtml(html).replace(EMPTY_ANCHOR, '') } };
}
