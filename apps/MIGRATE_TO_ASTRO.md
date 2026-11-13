# Migrating the Next.js sites to Astro

Following the Vite takeover at seedcord, the framework used by the websites (Next.js) isn't aligned well with Vite. An evaluation between different Vite-based migration targets showed that Astro was the best choice among 3 candidates.

The migration follows the plan decided on the `migrate-pages` branch. The site order is fixed: **home, then guide, then docs**. Home proves the foundation, guide proves MDX, markdown twins, the Cloudflare adapter, and the `ask` endpoint, and docs proves the API docs pipeline and the R2 swap. Ship one PR per site covering all three parts, plus one foundation PR and one cleanup PR.

When migrating over from Next.js to Astro, consult the Astro documentation. If the Astro docs MCP server is enabled, use its `search_astro_docs` tool, otherwise make a web request to the Astro docs.

Run Astro through the workspace CLI: `vp run dev` starts `astro dev`, and `vp dev` starts plain Vite instead and ignores Astro.

## Phase 0: workspace foundation (one PR, no site changes)

Do this once, before the first site moves.

- [ ] Add `astro`, `@astrojs/react`, `@astrojs/cloudflare`, `@astrojs/mdx`, `eslint-plugin-astro`, `@tailwindcss/vite`, and `@fumadocs/astro` to the catalogs in `pnpm-workspace.yaml`.
- [ ] Pin `astro` to `^7.4.11` and `fumadocs-core` to `^16.18.3` (needed by `@fumadocs/astro`).
- [ ] Add an Astro preset to `@seedcord/eslint-config` and write a changeset for it.
- [ ] Verify Oxfmt formats `.astro` files (enable the `astro` option and install `@astrojs/compiler-rs`), and watch [oxc#29060](https://github.com/oxc-project/oxc/issues/29060) for frontmatter formatting bugs.
- [ ] Watch `satteri` and `@fumadocs/astro` for breaking changes. Both are 0.x (`satteri ^0.11.7`, `@fumadocs/astro` 0.3.0) on top of an already young stack.
- [ ] Verify `astro dev` and `astro build` work under the workspace's `vite` catalog alias.
- [ ] Verify Vitest 5 runs an Astro island test on the home pilot.

## Part 1: Onboarding

Use this checklist when initially migrating a site from Next.js to Astro.
Ticking the entire checklist means that the site is functionally identical to the old Next.js-based site, with minimal changes made to fix the site and ensure it works identically.

- [ ] New, minimal Astro project created in the existing app folder.
- [ ] Each route on the Next.js site exists at the same path on the Astro site. Enumerate pages with `getStaticPaths` fed by the site's existing route helpers (`docsRoutes()` for docs, the content collections for guide and home).
- [ ] React components are mounted on their Astro equivalents. Static components render without a `client:` directive; only interactive ones hydrate (docs sidebar and command palette, guide search and table of contents, home hero). The command palette context collapses into the shared zustand store so separate islands share state.
- [ ] Framework imports are replaced: `next/link` becomes `<a>`, `notFound()` becomes rendered 404 content, `next/image` becomes `<img>`, `next/script` becomes an inline script. Head metadata from `generateMetadata` and `generateViewport` becomes plain head tags.
- [ ] Tailwind moves from PostCSS to the Vite plugin: delete `postcss.config.mjs` and the `@tailwindcss/postcss` dependency (plus the bare `postcss` dependency in docs' package.json), and wire `@tailwindcss/vite` from the catalog in `astro.config`. Astro's docs name the Vite plugin as the preferred way to run Tailwind 4, and the apps use PostCSS for Tailwind alone. The CSS entry keeps importing `@seedcord/ui/styles/globals.css`, which carries `@import 'tailwindcss'`.
- [ ] Dev playgrounds collapse into one `src/pages/dev/[...playground].astro` with a registry, whose `getStaticPaths` returns `[]` when `import.meta.env.PROD`.
- [ ] Endpoints exist for everything the old site served: `llms.txt`, `sitemap.xml`, `robots.txt`, `rss.xml`, OG images, icons, and the prerendered search shards on docs.
- [ ] Env reads move from `NEXT_PUBLIC_*` to Astro's `import.meta.env.PUBLIC_*` so staging builds keep working.
- [ ] Each route file is compared against the old site: build the Next site once and diff the route list and key markup, then screenshot at 390px and 1280px (see `apps/AGENTS.md`).
- [ ] The app's lint, `tc`, tests, and prose checks pass, and the PR carries a changeset.

## Part 2: Integrating

Use this checklist when integrating more into Astro.
Ticking the entire checklist means that the websites become more Astro-native.

- [ ] App-local static templating becomes `.astro` components, converted bottom-up. Write the first conversion test-first through the Astro Container API.
- [ ] The shared components in `@seedcord/ui` ship as React components. Astro renders a React component without a `client:` directive as static HTML with zero client JavaScript, and the React bundle loads for the hydrated islands anyway, so the client ships the same bytes either way. An `.astro` component works only inside `.astro` files, while the islands and the `@fumadocs/astro` MDX components map import the kit as React element types. The React implementation also keeps the kit under `react-doctor` and the React lint rules, and costs only build time in the `react-dom/server` render.
- [ ] `ClientRouter` replaces the SPA feel; docs page transitions use CSS transitions.
- [ ] Content collections are set up:
    - **guide and home** use `@fumadocs/astro`: `pageLoader()` and `metaLoader()` feed `defineCollection`, and `toFumadocsSource()` plugs the collections into the existing `fumadocs-core/source` `loader({ baseUrl })`. Frontmatter schemas become zod schemas in the content config. `fumadocs-mdx` is removed. The integration runs on Astro's Sätteri processor and accepts only Sätteri plugins, so rewrite the six custom remark and rehype plugins in `apps/guide/source.config.ts` as Sätteri `mdastPlugins` and `hastPlugins`, and pass them through the integration's per-collection options. Markdown twin generation moves from `apps/guide/tests/twinPipeline.ts` into build-time endpoints. The twin pipeline can adopt `@fumadocs/satteri/remark-llms` or the integration's `includeProcessedMarkdown` option instead of driving `fumadocs-core`'s remark-llms directly.
    - **home's blog** is home's content collection: `pageLoader()` and `metaLoader()` read `content/blog/*/index.mdx`, the collection derives the slug from the folder name, and `postSchema` carries over as the zod schema with its author-handle, date, and image validations. Home's `remarkPostFiles` joins the Sätteri port list, and it keeps enforcing the image rules at build: webp only, url-slug file names, inline images with alt text, the image inside the post folder, and the 500 KB ceiling. The `[image]` route becomes a prerendered endpoint that emits each post folder's webp files at `blog/<slug>/<name>`, with `getStaticPaths` enumerating them the way `generateStaticParams` does today. The migration keeps the `Post` class as the model over collection entries: `getText('processed')` becomes the entry's processed-markdown record, `readingMinutes` still sizes it, and the twin endpoints keep assembling `twinDocument`'s byline (authors, created, edited) on top of the processed markdown. `listedNewestFirst` still filters `unlisted` posts and sorts by `created` for the blog index and the feeds built on it.
    - **docs** keeps API Extractor exactly as it is. `vp run docs:extract` and `vp run docs:artifacts` are unchanged; the site consumes `generated/artifacts/` at build time through `getStaticPaths`, with an optional Content Loader wrapper around the engine if the collections pattern earns its keep.
- [ ] Guide keeps twoslash, and its highlight moves from the React fence component into the Sätteri rehype-code pass. `apps/guide/src/lib/twoslash.ts` already drives `transformerTwoslash` from `@shikijs/twoslash`, a Shiki transformer that runs below the markdown pipeline, so the Sätteri switch leaves it untouched. Guide sets `rehypeCodeOptions: false` today and highlights inside an async React `Fence` that calls `twoslashBlock()`; flip to rehype-code with the guide's transformers, dispatched on the fence meta (`check`, `hovers`, `off`), and let the `CodeBlock` MDX component wrap the highlighted HTML. The prettier pass pre-warms the cache before the sync transformer reads it, which the existing one-entry caches already separate. Twoslash is the gate that fails the build when a sample stops compiling against the published packages, and the source of the `^?`, completions, and `hovers` output the guide's content leans on. Dev and build split the same way as today: the `TWOSLASH === '0'` gate inside `twoslashBlock()` moves to the transformer list, `dev` keeps `cross-env TWOSLASH=0` so samples render as plain highlighted text, the build compiles every sample and fails on a broken one, and a `dev:twoslash` script opts in with the 8 GB heap. Turbo already hashes `TWOSLASH` through `globalEnv`, so a plain build and a twoslash build cache separately. Fumadocs documents this exact wiring for Sätteri on [its Astro twoslash page](https://www.fumadocs.dev/docs/astro/markdown/twoslash), and the same page documents the `typesCache` option for caching. A filesystem cache backend is a follow-up investigation after the sites ship, recorded in the post-migration twoslash investigation.
- [ ] The Cloudflare adapter (`@astrojs/cloudflare`) replaces the hand-rolled worker wiring. Sites keep worker code only where the platform requires it, written as advanced-routing stages in a custom `src/worker.ts` pointed at by wrangler's `main`: twin negotiation, then the adapter's `cf()` asset handler, then `finalize()` around `astro()`. Docs ships without a worker: its asset count leaves room under the Static Assets caps, agents read twins through their `<link rel>` pointers and the `llms/` tree, and version redirects move into a build-generated `_redirects` file (see `The docs asset budget decides the worker` below). Guide keeps its `WorkerEntrypoint` class exporting the `GuideService` RPC. Home's entrypoint is thin: it redirects `www` requests to the apex and hands every other request to the asset handler.
- [ ] **docs only:** pages move from R2 to Workers Static Assets. Remove `r2_buckets` and `BUILD_ID` from the wrangler config, delete the R2 upload, prune, and purge scripts in `scripts/src/docs/` after grepping for consumers, and replace the rollback path with `wrangler versions upload`.
- [ ] Redirects and headers move to static configuration: guide's `RENAMED_PAGES` table generates `public/_redirects` at build (`build.redirects: false`), per-page `Link` headers move to `<link rel>` tags in the head, and `x-robots-tag` moves to a `_headers` file.

### Why the docs pipeline writes JSON to disk

The site reads the artifacts as files, and no in-memory hand-off from the extractor exists to replace that:

1. API Extractor writes one `.api.json` per entry point itself, and its public API returns only success and warnings. Nothing hands the parsed model over in memory.
2. `DocsEngine.fromManifest` skips the `manifest.json` read, but the engine still loads each `.api.json` from disk through `ApiModel.loadPackage`.
3. The artifacts carry `api.json` so a render-shape change can re-derive `project.json` without re-extracting.
4. Turbo caches `docs:extract` and `docs:artifacts` as two tasks keyed on the built declaration files. Folding extraction into the Astro build would re-run API Extractor on every rebuild.

An Astro Content Loader can call the engine directly and feed it in-memory data, but the engine then reads the same files, so the loader saves nothing. Build the docs routes from `generated/artifacts/` and leave the pipeline as it is.

### The docs asset budget decides the worker

Workers Static Assets caps the files one Worker version carries at 20,000 on the free plan and 100,000 on paid, 25 MiB per file ([platform limits](https://developers.cloudflare.com/workers/platform/limits/)). The catalog pins `wrangler ^4.150.0`, past the 4.34.0 the raised cap needs.

The count, from the deployed `index.json` and the route helpers, as an upper bound over every served version: the package pages total about 2,500 (16 packages serving 2-3 versions each, one page per entity, every version counted at the latest version's page count, `@seedcord/core` the largest at 265 entities), a `.md` twin per page doubles it, the `llms/` tree writes one markdown file per docs route, and the OG cards for the latest routes plus 37 search shards, bundles, and site files add about 900. The worst case totals about 8,500 files: 42% of the free cap and under 9% of the paid cap. Doubling the whole docs surface approaches the free cap and uses 17% of the paid cap.

That headroom lets docs ship without a worker, and that settles the twin negotiation. Docs removes the `Accept: text/markdown` negotiation instead of deferring it, because the site doesn't have a worker to run it. Agents read each page's markdown through its `<link rel>` pointer or the `llms/` tree.

Version redirects move into a `_redirects` file generated at build, replacing `replacedVersion()`. Production serves more than the current build emits: every minor-line head is live today (probed, `core` back to `0.1.4`, `eslint-config` back to `1.4.3`), because the deployed build predates the serving change that cut the version picker to major heads and two 0.x heads. That surplus totals about 6,600 pages at the same upper bound, which puts the deployed build near 9,200. The swap uploads the fresh build's output in place of the R2 bucket, and the first `_redirects` upload covers the versions the fresh build stops serving: about 93 redirect rules, one per package and pruned minor-line head; later releases append the heads they rotate out. Preserving the stale pages as assets instead pushes the worst case to about 15,000 files, 76% of the free cap, so redirect coverage is the accounting. The file caps at 2,100 rules, and the rule shape for patch versions inside served lines is an implementation decision.

The docs app deploys as an assets-only project: its wrangler config sets `assets.directory` to the build's static output, and `@astrojs/cloudflare` joins guide and home alone.

## Part 3: Agent-readiness

Use this checklist after integrating more into Astro and when making the site more agent-friendly.
Ticking the entire checklist means that the website can be used by both humans and AI alike.

- [ ] Each route has a `.md` twin. Guide pages and blog posts already have twins, and docs twins cover the packages pages; extend coverage where a route lacks one.
- [ ] Each site generates `llms.txt` on each build. Home's `llms.txt` lists blog posts as links with their short description; it never inlines post contents.
- [ ] The agent surface is checked in CI: crawl the preview deployment and assert each page's twin link, `llms.txt`, and head links respond. Guide's crawl also requests pages with `Accept: text/markdown` and asserts the markdown twin comes back.
- [ ] The site was viewed as an agent through a local dev server.

## What replaces each worker job

| Site  | Today                                                         | After                                                                                                                                       |
| ----- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| home  | www redirect, staging noindex                                 | noindex moves to a per-environment generated `_headers` file. A thin worker entrypoint redirects `www` to the apex.                         |
| guide | twin negotiation, `/ask`, redirects, `GuideService` RPC       | twin negotiation and `cf()` in the advanced-routing pipeline, `/ask` as an Astro endpoint, `_redirects` from `RENAMED_PAGES`, RPC unchanged |
| docs  | R2 + `BUILD_ID`, version redirects, twin negotiation, headers | static assets, version redirects in build-generated `_redirects`, `_headers`                                                                |

## Verify during implementation

- Vite's `ssr.external` configuration replaces Next's `serverExternalPackages` for the packages that read files off disk (`@seedcord/docs-engine`, `@seedcord/docs-generator`, `@microsoft/api-extractor-model`, `@microsoft/tsdoc`, `@microsoft/tsdoc-config`, `@takumi-rs/core`).
- `@fumadocs/astro` requires Astro's Sätteri Markdown processor and rejects the unified pipeline, so `@astrojs/markdown-remark` is unavailable on guide and home. Confirm its compiled MDX renders without hydration. Confirm Sätteri's mdast exposes `mdxJsxFlowElement` to plugins, because `remarkNoMappedJsx` and `remarkPageLinks` walk those nodes.
- The Sätteri rehype-code pass hands the fence meta to Shiki transformers, so the twoslash modes dispatch inside the highlight pass. The fallback is an async `Fence` component, which then needs `@astrojs/react` to render async server components.
- `TypeHover` hydrates over the highlighted HTML the rehype-code pass emits, and `DocsLinks.load()` pre-warms once per build instead of once per fence.
- The home blog's zod schema reads the entry's file path the way fumadocs-mdx's `MacroSchemaContext` passes it today, because the cover and thumbnail transforms validate the image against the post folder.
- `fetchFile` and wrangler's `main` cooperate when the entrypoint is a `WorkerEntrypoint` class.
- The link checker handles Astro's output layout once the migration removes the Next navigation special case.
- Tailwind's automatic source detection picks up the classes used in `tooling/ui/src`, which sits outside each app's root. Add `@source` entries to the CSS entry if a pilot page misses them.

## Post-migration experiment: build-time incremental builds

Astro doesn't have runtime ISR for prerendered pages. The build-time equivalent is the `experimental.incrementalBuild` flag (added in `astro@7.2.0`, so our `^7.4.11` pin has it). When a page's `cacheKey` and its module dependency graph both match the previous build, Astro copies that build's output instead of rendering the page again. Content collections join through each loader's per-entry `digest`, which changes whenever the entry's data changes. The Astro docs recommend `cacheKey: String(entry.digest)` inside `getStaticPaths`.

Turbo already replays `docs:extract`, `docs:artifacts`, and each site's build when nothing changed, so the flag only pays when a build actually runs: the site's code changed, or its data changed. The case to measure is a release, where one package's artifacts change and every other package's pages copy from cache. The Astro docs describe significant cuts on large sites where most pages change infrequently.

Adoption constraints:

1. Leave `build.concurrency` at the default. A value above `1` disables the incremental cache, and Astro re-renders every page.
2. CI must restore `node_modules/.astro/`, the project's `cacheDir`, before `astro build`, or every page re-renders. Cache that one directory in the deploy workflows, and run `astro build --force` for deliberate full rebuilds.
3. Only `getStaticPaths()` pages with a `cacheKey` reuse output. Every endpoint (`llms.txt`, sitemap, search shards) re-renders each build. Pages with server islands also re-render unless `ASTRO_KEY` is stable. The sites use client islands, so this matters only if a future change adds server islands.

One check gates adoption: whether `@fumadocs/astro`'s `pageLoader()` exposes per-entry digests. The Content Loader API leaves digest updates to each loader, so confirm before guide and home inherit the flag. The docs site's loader computes its own digest, a content hash of each package's `project.json`.

Route caching (stable in Astro 7) is the runtime half of ISR: `Astro.cache.set({ maxAge, swr, tags })`, config-level `routeRules`, and the experimental `cacheCloudflare()` provider from `@astrojs/cloudflare/cache`. It caches only on-demand routes. All three sites are fully prerendered, and Workers Static Assets already serves them from the edge. Guide's `/ask` is a POST endpoint, so nothing there is cacheable HTML. Don't configure route caching now. Revisit it only if a site moves pages on-demand.

## Post-migration investigation: twoslash

The migration keeps the guide's twoslash split exactly as it runs today; the Part 2 twoslash bullet records the shape. After the sites ship, two investigations follow.

### A better dev/build split

Investigate a better mechanism than the `TWOSLASH` env var:

1. Gate the transformers on Astro's `command` in `defineConfig(({ command }) => ...)`, so twoslash runs on build by default, with an env override for a dev session that runs twoslash.
2. A cheaper `hovers` mode, which triples a fence's compile cost today.

### Caching twoslash runs

Every build recompiles every fence today, and the seam to change that already exists: `transformerTwoslash` takes a `typesCache`, which `apps/guide/src/lib/twoslash.ts` implements in-memory as two one-entry caches. Swapping the backend for filesystem storage makes entries that keep their inputs skip the TypeScript compile, the expensive part of a fence; Shiki still renders per fence, and the prettier pass still learns hover formatting in-process. Fumadocs documents the option on the [Astro twoslash page](https://www.fumadocs.dev/docs/astro/markdown/twoslash) with `createFileSystemTypesCache()` from `fumadocs-twoslash/cache-fs` as the stock backend; `@shikijs/twoslash` defines the `TwoslashTypesCache` interface and hands `read` and `write` the compile options and meta, while the filesystem helper it documents ships from `@shikijs/vitepress-twoslash/cache-fs`.

Three requirements shape the swap:

1. Key entries on a fingerprint of the compile options, with code and language as part of that fingerprint. Identical sample text compiles differently when `tsconfig.samples.json`, the `seedcord-gen.ts` augmentation, or the seedcord packages it resolves against change, so a release would otherwise serve stale hovers. The options fingerprint covers `check` and `hovers` too, because they differ in `handbookOptions`. Verify what the stock filesystem cache keys on before adopting it, and wrap it with the fingerprint if it keys on code alone.
2. The cache stores the compiled nodes with their attached `SymbolRef` values, and `DocsLinks` resolves hrefs at render, so href-shape changes leave entries valid. The docs artifacts still join the key, because they feed `SymbolRef.fromDeclaration`, and a changed mapping needs fresh refs.
3. CI caches the twoslash directory next to `node_modules/.astro/`, which the incremental-build experiment needs restored anyway. Turbo handles the rest unchanged: it replays whole builds on unchanged inputs, and a correctly keyed cache is transparent to it.

## Deferred: Void (void.cloud)

Void is VoidZero's Vite plugin, SDK, CLI, and platform for full-stack Vite apps on Cloudflare Workers. Its Astro integration fits our shape (Astro 7, `voidPlugin()` in the Vite config, bindings from `cloudflare:workers`), and it would mainly benefit guide: `void/ai` replaces the hand-typed Workers AI interface, `env.ts` replaces wrangler vars, and `void deploy` replaces `wrangler deploy` with readiness checks and rollback.

Adoption is deferred until the sites ship and stabilize, because:

1. Void doesn't support named Cloudflare environments, so staging at `next.seedcord.org` needs a separate Void project per target.
2. Void's framework mode generates its own worker entrypoint, and exporting guide's `GuideService` RPC to its external consumer is unverified.
3. Ratelimit bindings like guide's `ASK_LIMIT` aren't in Void's inference table.

When the time comes, adopt Void on guide first: run `void init`, link the existing worker so Void preserves bindings and secrets in `void.config.ts` and `void.lock.json`, then replace `wrangler deploy` in the deploy workflow.
