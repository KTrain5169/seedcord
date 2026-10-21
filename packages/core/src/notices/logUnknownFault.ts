import type { Logger } from '@seedcord/logger';
import type { ErrorsConfig } from '@seedcord/types';

function causeLine(error: Error): string {
    const { cause } = error;
    if (!Error.isError(cause)) return '';
    const [first] = cause.message.split('\n');
    return `\ncaused by ${cause.name}: ${first ?? cause.message}`;
}

export function logUnknownFault(logger: Logger, uuid: string, error: Error, errors: ErrorsConfig | undefined): void {
    if (errors?.errorStack ?? true) logger.error(uuid, error);
    else logger.error(`${uuid} | ${error.message}${causeLine(error)}`);
}
