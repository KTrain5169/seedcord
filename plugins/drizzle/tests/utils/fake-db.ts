export interface FakeDb {
    readonly dialect: 'fake';
    find(id: string): string;
}

export function createFakeDb(): FakeDb {
    return {
        dialect: 'fake',
        find: (id: string) => id
    };
}
