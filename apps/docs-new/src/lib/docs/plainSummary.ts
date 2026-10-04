import { FENCED_BLOCK } from '#lib/docs/comments/fence';

// TSDoc summaries carry markdown (links, code spans) that a plain-text sink renders literally.
export function plainSummary(text: string): string {
    return text
        .replace(FENCED_BLOCK, ' ')
        .replace(/\[([^\]]+)\]\((?:\/|#|https?:\/\/)[^)]*\)/g, '$1')
        .replace(/`/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
