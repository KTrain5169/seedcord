// eslint-disable-next-line import-x/no-useless-path-segments -- vite's native config loader cannot resolve a directory import
import { createVitestConfig } from './src/index.ts';

export default createVitestConfig(import.meta.url);
