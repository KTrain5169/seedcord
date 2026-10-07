import { skillsIndex } from '@seedcord/ui/skills';
import { SEEDCORD_SKILL } from '@seedcord/ui/skills/seedcord';

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

export function GET(): Response {
    return Response.json(skillsIndex([SEEDCORD_SKILL]));
}
