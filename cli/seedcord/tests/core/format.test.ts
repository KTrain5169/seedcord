import { describe, expect, it } from 'vitest';

import { formatBytes, formatDuration, plural } from '#core/format';

describe('formatDuration', () => {
    it('shows milliseconds under a second and seconds from there', () => {
        expect(formatDuration(12.4)).toBe('12ms');
        expect(formatDuration(2400)).toBe('2.4s');
    });

    it('switches to seconds when the milliseconds round up to 1000', () => {
        expect(formatDuration(999.6)).toBe('1.0s');
    });
});

describe('formatBytes', () => {
    it('picks the unit that keeps the number short', () => {
        expect(formatBytes(512)).toBe('512 B');
        expect(formatBytes(186_400)).toBe('186.4 kB');
        expect(formatBytes(5_400_000)).toBe('5.4 MB');
    });
});

describe('plural', () => {
    it('uses the singular noun for a count of 1', () => {
        expect(plural(1, 'guild')).toBe('1 guild');
    });

    it('uses the plural noun for 0 and many', () => {
        expect(plural(0, 'guild')).toBe('0 guilds');
        expect(plural(4, 'guild')).toBe('4 guilds');
    });

    it('takes an explicit plural form for irregular nouns', () => {
        expect(plural(2, 'entry', 'entries')).toBe('2 entries');
    });
});
