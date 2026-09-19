# discord-component-embed

## 0.2.0

### 💥 Breaking

- If your own component passes its `children` into one of these components, type that prop as `EmbedNode`. `ReactNode` and Preact's `ComponentChildren` no longer fit. ([#321](https://github.com/seedcord/seedcord/pull/321))
- `<ComponentEmbed>` moved to `discord-component-embed/react`. ([#321](https://github.com/seedcord/seedcord/pull/321))

### ✨ Minor

- Added `toComponentEmbedJson`. It returns the card's JSON with every `<` escaped, for a framework that writes the `<script>` tag itself. ([#321](https://github.com/seedcord/seedcord/pull/321))
- React is an optional peer now. Only `discord-component-embed/react` needs it, from React 17 up. ([#321](https://github.com/seedcord/seedcord/pull/321))
- Added support for trees built with Preact JSX or `preact/compat`. ([#321](https://github.com/seedcord/seedcord/pull/321))
- Added `h()` and a JSX runtime for `jsxImportSource: 'discord-component-embed'`. Both build the tree without React. ([#321](https://github.com/seedcord/seedcord/pull/321))

## 0.1.0

### ✨ Minor

- New package that builds a Discord component embed link preview from JSX and throws when the tree breaks a rule of the format. ([#319](https://github.com/seedcord/seedcord/pull/319))
