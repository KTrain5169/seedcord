import { SeedcordErrorCode, isSeedcordError } from '@seedcord/errors';

export interface Failure {
    code: number;
    message: string | null;
    closing: string;
}

// nothing reaches disk until the interview ends
const CANCELLED: Failure = { code: 0, message: null, closing: 'Nothing was written.' };

export function reportFailure(error: unknown): Failure {
    if (isSeedcordError(error, undefined, SeedcordErrorCode.CreateCancelled)) return CANCELLED;

    // scaffold keeps the tree it wrote when a post-write step fails
    const kept = isSeedcordError(error, undefined, SeedcordErrorCode.CreateStepFailed);
    const message = isSeedcordError(error) || Error.isError(error) ? error.message : String(error);

    return { code: 1, message, closing: kept ? 'Project kept. Run the command manually.' : 'Nothing was created.' };
}
