import { cn, tw } from '@seedcord/ui';

export const PROSE_CODE_BLOCK = cn(
    tw`[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-(--border) [&_pre]:bg-(--surface-subtle)`,
    tw`[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit`
);
