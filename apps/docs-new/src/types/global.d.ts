// Side-effect imports for static assets. Required under TypeScript 6 strict
// module resolution, which no longer infers wildcard module shapes from
// .css / .scss / .module.css side-effect imports.

declare module '*.css';
declare module '*.scss';
declare module '*.svg';

// the plugin ships no types of its own. the eslint config registers it by hand
declare module 'eslint-plugin-jsx-a11y';
