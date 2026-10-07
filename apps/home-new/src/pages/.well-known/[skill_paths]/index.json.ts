import { skillsIndex } from '@seedcord/ui/skills';
import { SEEDCORD_SKILL } from '@seedcord/ui/skills/seedcord';

export function getStaticPaths() {
    return [
        {
            params: {
                skill_paths: 'skills'
            }
        },
        {
            params: {
                skill_paths: 'agent-skills'
            }
        }
    ];
}

export function GET(): Response {
    return Response.json(skillsIndex([SEEDCORD_SKILL]));
}
