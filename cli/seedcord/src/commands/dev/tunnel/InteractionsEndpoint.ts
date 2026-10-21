import { DiscordAPIError, REST } from '@discordjs/rest';
import { SeedcordErrorCode } from '@seedcord/errors';
import { SeedcordError } from '@seedcord/errors/internal';
import { RESTJSONErrorCodes, Routes } from 'discord-api-types/v10';

import type { BotToken } from '@seedcord/errors/internal';
import type { RESTPatchCurrentApplicationJSONBody } from 'discord-api-types/v10';

const FIELD = 'interactions_endpoint_url';

export type EndpointRest = Pick<REST, 'patch'>;

// discord verifies by posting a signed ping to the url, which fails until the hostname resolves on its side
function unverified(error: unknown): boolean {
    if (!(error instanceof DiscordAPIError) || error.code !== RESTJSONErrorCodes.InvalidFormBodyOrContentType) {
        return false;
    }

    const { rawError } = error;
    return 'errors' in rawError && containsField(rawError.errors);
}

function containsField(errors: unknown): boolean {
    return typeof errors === 'object' && errors !== null && FIELD in errors;
}

interface WrittenEndpoint {
    readonly applicationId: string;
    readonly url: string;
}

export class InteractionsEndpoint {
    private written: WrittenEndpoint | undefined;

    // read per request because a restart reloads .env
    constructor(
        private readonly token: () => BotToken,
        private readonly rest: (token: string) => EndpointRest
    ) {}

    public static create(token: () => BotToken): InteractionsEndpoint {
        // without this the client silently waits out an exhausted bucket and the cli looks frozen
        const rest = new REST({ version: '10', rejectOnRateLimit: ['/applications'] });
        return new InteractionsEndpoint(token, (value) => rest.setToken(value));
    }

    public holds(url: string): boolean {
        return this.written?.url === url && this.written.applicationId === this.token().applicationId;
    }

    public async set(url: string, signal: AbortSignal): Promise<void> {
        signal.throwIfAborted();
        const token = this.token();
        try {
            await this.write(token, url);
        } catch (error: unknown) {
            if (!unverified(error)) throw error;
            throw new SeedcordError(SeedcordErrorCode.CliTunnelNotVerified, [url]);
        }

        this.written = { applicationId: token.applicationId, url };
    }

    public async clear(): Promise<void> {
        await this.write(this.token(), null);
        this.written = undefined;
    }

    private async write(token: BotToken, endpoint: string | null): Promise<void> {
        await this.rest(token.value).patch(Routes.currentApplication(), {
            body: { interactions_endpoint_url: endpoint } satisfies RESTPatchCurrentApplicationJSONBody
        });
    }
}
