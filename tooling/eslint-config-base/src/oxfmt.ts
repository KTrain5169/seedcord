import { OxfmtConfig, SortTailwindcssConfig } from 'vite-plus/fmt';
import { OXFMT_CONFIG } from './rules/oxfmt-config';

export interface CreateOxfmtConfigOptions {
    /**
     * When provided, layers in `prettier-plugin-tailwindcss` and its class-sorting options.
     * Omit it to get the base seedcord prettier config unchanged.
     */
    tailwind?: Pick<SortTailwindcssConfig, 'stylesheet' | 'functions' | 'attributes' | 'preserveDuplicates'>;

    /**
     * Per-glob option overrides, passed through to prettier's own `overrides` field.
     */
    overrides?: OxfmtConfig['overrides'];
}

export function createOxfmtConfig(options: CreateOxfmtConfigOptions = {}): OxfmtConfig {
    const base: OxfmtConfig = {
        ...OXFMT_CONFIG,
        ...(options.overrides ? { overrides: options.overrides } : {})
    };

    if (!options.tailwind) return base;

    const { stylesheet, functions = ['cn', 'tw'], attributes, preserveDuplicates = false } = options.tailwind;

    return {
        ...base,
        sortTailwindcss: {
            functions,
            preserveDuplicates,
            ...(stylesheet ? { stylesheet } : {}),
            ...(attributes ? { attributes } : {})
        }
    };
}
