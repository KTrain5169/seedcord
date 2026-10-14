import { env } from 'cloudflare:workers';

import { SlashHandler, SlashRoute, timestampFromSnowflake } from '@seedcord/http';

const TOTAL_PINGS_KEY = 'total';

@SlashRoute('ping')
export class Ping extends SlashHandler<'ping'> {
    public async execute(): Promise<void> {
        const roundtrip = Date.now() - timestampFromSnowflake(this.event.id);
        const lines = ['### Pong', `Roundtrip **${roundtrip}ms**`];
        const runs = this.core.pings.bump();

        const total = Number((await env.PINGS.get(TOTAL_PINGS_KEY)) ?? 0) + 1;
        await env.PINGS.put(TOTAL_PINGS_KEY, String(total));

        if (this.options.getBoolean('detailed')) {
            lines.push(`Pings on this isolate **${runs}**`, `Pings across every isolate **${total}**`);
        }

        await this.reply(lines.join('\n'));
    }
}
