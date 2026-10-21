import { DiscordAPIError, RateLimitError } from '@discordjs/rest';
import { isSeedcordError, SeedcordErrorCode } from '@seedcord/errors';
import { RESTJSONErrorCodes, Routes } from 'discord-api-types/v10';
import { describe, expect, it, vi } from 'vitest';

import { InteractionsEndpoint } from '#commands/dev/tunnel/InteractionsEndpoint';

import type { EndpointRest } from '#commands/dev/tunnel/InteractionsEndpoint';
import type { BotToken } from '@seedcord/errors/internal';

const TUNNEL = 'https://abc.trycloudflare.com';
const RUNNING = new AbortController().signal;
const TOKEN: BotToken = { value: 'first-token', applicationId: '1' };

function endpointFor(client: EndpointRest): InteractionsEndpoint {
    return new InteractionsEndpoint(
        () => TOKEN,
        () => client
    );
}

function rest(): { rest: EndpointRest; patch: ReturnType<typeof vi.fn> } {
    const patch = vi.fn().mockResolvedValue({});
    return { rest: { patch }, patch };
}

// the rejection discord returns while the tunnel hostname is still unresolvable on its side
function unverifiable(): DiscordAPIError {
    return new DiscordAPIError(
        {
            code: RESTJSONErrorCodes.InvalidFormBodyOrContentType,
            message: 'Invalid Form Body',
            errors: {
                interactions_endpoint_url: {
                    _errors: [
                        {
                            code: 'APPLICATION_INTERACTIONS_ENDPOINT_URL_INVALID',
                            message: 'The specified interactions endpoint url could not be verified.'
                        }
                    ]
                }
            }
        },
        RESTJSONErrorCodes.InvalidFormBodyOrContentType,
        400,
        'PATCH',
        'https://discord.com/api/v10/applications/@me',
        { body: undefined, files: undefined }
    );
}

function refusalWith(errors: unknown): DiscordAPIError {
    return new DiscordAPIError(
        // justified: the field is typed as an optional object, and a null arrives on the wire
        { code: RESTJSONErrorCodes.InvalidFormBodyOrContentType, message: 'Invalid Form Body', errors } as never,
        RESTJSONErrorCodes.InvalidFormBodyOrContentType,
        400,
        'PATCH',
        'https://discord.com/api/v10/applications/@me',
        { body: undefined, files: undefined }
    );
}

describe('InteractionsEndpoint', () => {
    it('holds the url it set until the token belongs to another application', async () => {
        const { rest: client } = rest();
        const makeRest = vi.fn((_token: string) => client);
        let token = TOKEN;
        const endpoint = new InteractionsEndpoint(() => token, makeRest);

        await endpoint.set(TUNNEL, RUNNING);
        expect(endpoint.holds(TUNNEL)).toBe(true);

        token = { value: 'second-token', applicationId: '2' };
        expect(endpoint.holds(TUNNEL)).toBe(false);

        await endpoint.set(TUNNEL, RUNNING);
        expect(makeRest).toHaveBeenLastCalledWith('second-token');
    });

    it('patches the application with the url', async () => {
        const { rest: client, patch } = rest();

        await endpointFor(client).set(TUNNEL, RUNNING);

        expect(patch).toHaveBeenCalledExactlyOnceWith(Routes.currentApplication(), {
            body: { interactions_endpoint_url: TUNNEL }
        });
    });

    it('rethrows any other rejection without retrying', async () => {
        const { rest: client, patch } = rest();
        patch.mockRejectedValue(new Error('401 Unauthorized'));

        await expect(endpointFor(client).set(TUNNEL, RUNNING)).rejects.toThrow('401');
        expect(patch).toHaveBeenCalledOnce();
    });

    it('translates a verification refusal into a seedcord error', async () => {
        const { rest: client, patch } = rest();
        patch.mockRejectedValue(unverifiable());

        const error: unknown = await endpointFor(client)
            .set(TUNNEL, RUNNING)
            .then(
                () => null,
                (caught: unknown) => caught
            );

        expect(isSeedcordError(error, undefined, SeedcordErrorCode.CliTunnelNotVerified)).toBe(true);
        expect(patch).toHaveBeenCalledOnce();
    });

    it('rethrows a refusal whose errors field is null', async () => {
        const { rest: client, patch } = rest();
        const refusal = refusalWith(null);
        patch.mockRejectedValue(refusal);

        await expect(endpointFor(client).set(TUNNEL, RUNNING)).rejects.toBe(refusal);
    });

    it('surfaces a rate limit rather than reading it as a refusal', async () => {
        const { rest: client } = rest();
        const limited = new RateLimitError({
            timeToReset: 60_000,
            limit: 10,
            method: 'PATCH',
            hash: 'x',
            url: 'https://discord.com/api/v10/applications/@me',
            route: '/applications/@me',
            majorParameter: '',
            global: false,
            retryAfter: 60_000,
            sublimitTimeout: 0,
            scope: 'user'
        });
        client.patch = vi.fn().mockRejectedValue(limited);

        await expect(endpointFor(client).set(TUNNEL, RUNNING)).rejects.toBe(limited);
    });

    it('writes nothing once the attempt is aborted', async () => {
        const { rest: client, patch } = rest();
        const attempt = new AbortController();
        attempt.abort();

        await expect(endpointFor(client).set(TUNNEL, attempt.signal)).rejects.toThrow();
        expect(patch).not.toHaveBeenCalled();
    });

    it('clears the endpoint with a null', async () => {
        const { rest: client, patch } = rest();

        await endpointFor(client).clear();

        expect(patch).toHaveBeenCalledExactlyOnceWith(Routes.currentApplication(), {
            body: { interactions_endpoint_url: null }
        });
    });
});
