import { AUTHOR_URL } from '@seedcord/ui';

export interface Author {
    name: string;
    site?: string;
}

export const AUTHORS_BY_HANDLE = {
    materwelonDhruv: { name: 'Dhruv', site: AUTHOR_URL },
    ktrain5169: { name: 'KTrain' }
} as const satisfies Record<string, Author>;

export type AuthorHandle = keyof typeof AUTHORS_BY_HANDLE;
