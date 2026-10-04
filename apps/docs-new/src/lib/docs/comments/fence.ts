// tsdoc ends a fence's text with its last newline
export function markdownFence(language: string, text: string): string {
    return `\n\`\`\`${language}\n${text}\`\`\`\n`;
}

export const FENCED_BLOCK = /^```[^\n]*\n[\s\S]*?^```$/gm;
