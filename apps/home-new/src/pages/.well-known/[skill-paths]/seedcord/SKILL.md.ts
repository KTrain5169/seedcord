import { skillResponse } from '@seedcord/ui/skills';
import { SEEDCORD_SKILL } from '@seedcord/ui/skills/seedcord';

export function GET(): Response {
    return skillResponse(SEEDCORD_SKILL);
}

export function getStaticPaths() {
    return [
        {
            params: {
                'skill-paths': 'skills'
            }
        },
        {
            params: {
                'skill-paths': 'agent-skills'
            }
        }
    ];
}
