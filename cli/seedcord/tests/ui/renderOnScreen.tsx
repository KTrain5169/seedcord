import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';

import headless from '@xterm/headless';
import { render } from 'ink';

import type { Terminal } from '@xterm/headless';
import type { ReactElement } from 'react';

interface Size {
    readonly rows: number;
    readonly columns: number;
}

class ScreenStdout extends EventEmitter {
    public readonly isTTY = true;

    public constructor(private readonly terminal: Terminal) {
        super();
    }

    public get columns(): number {
        return this.terminal.cols;
    }

    public get rows(): number {
        return this.terminal.rows;
    }

    public readonly write = (data: string, callback?: () => void): boolean => {
        this.terminal.write(data, callback);
        return true;
    };
}

export interface OnScreen {
    readonly screen: () => Promise<string>;
    readonly resize: (size: Size) => void;
    readonly unmount: () => void;
}

// renders in ink's interactive alternate-screen mode, the way `seedcord dev` does, into a terminal emulator
export function renderOnScreen(tree: ReactElement, size: Size): OnScreen {
    const terminal = new headless.Terminal({ cols: size.columns, rows: size.rows, allowProposedApi: true });
    const stdout = new ScreenStdout(terminal);
    const instance = render(tree, {
        // eslint-disable-next-line no-restricted-syntax -- this stub has every stdout member ink reads
        stdout: stdout as unknown as NodeJS.WriteStream,
        stdin: new PassThrough(),
        interactive: true,
        alternateScreen: true,
        exitOnCtrlC: false,
        patchConsole: false
    });

    return {
        // an empty write's callback runs after xterm has parsed every earlier write
        screen: () =>
            new Promise((resolve) => {
                terminal.write('', () => {
                    const { active } = terminal.buffer;
                    const rows = Array.from(
                        { length: terminal.rows },
                        (_, row) => active.getLine(row)?.translateToString(true) ?? ''
                    );
                    resolve(rows.join('\n'));
                });
            }),
        resize: ({ rows, columns }) => {
            terminal.resize(columns, rows);
            stdout.emit('resize');
        },
        unmount: () => {
            instance.unmount();
            instance.cleanup();
            terminal.dispose();
        }
    };
}
