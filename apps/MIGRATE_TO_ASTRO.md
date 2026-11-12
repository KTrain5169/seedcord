# Migrating the Next.js sites to Astro

Following the Vite takeover at seedcord, the framework used by the websites (Next.js) isn't aligned well with Vite. An evaluation between different Vite-based migration targets showed that Astro was the best choice among 3 candidates.

The migration follows the plan decided on the `migrate-pages` branch. The site order is fixed: **home, then guide, then docs**. Home proves the foundation, guide proves MDX, markdown twins, the Cloudflare adapter, and the `ask` endpoint, and docs proves the API docs pipeline and the R2 swap. Ship one PR per site covering all three parts, plus one foundation PR and one cleanup PR.

When migrating over from Next.js to Astro, consult the Astro documentation. If the Astro docs MCP server is enabled, use its `search_astro_docs` tool, otherwise make a web request to the Astro docs.

Run Astro through the workspace CLI: `vp run dev` starts `astro dev`, and `vp dev` starts plain Vite instead and ignores Astro.

## Phase 0: workspace foundation (one PR, no site changes)

Do this once, before the first site moves.

- [ ] Add `astro`, `@astrojs/react`, `@astrojs/cloudflare`, `@astrojs/mdx`, `eslint-plugin-astro`, and `@fumadocs/astro` to the catalogs in `pnpm-workspace.yaml`.
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
- [ ] Dev playgrounds collapse into one `src/pages/dev/[...playground].astro` with a registry, whose `getStaticPaths` returns `[]` when `import.meta.env.PROD`.
- [ ] Endpoints exist for everything the old site served: `llms.txt`, `sitemap.xml`, `robots.txt`, `rss.xml`, OG images, icons, and the prerendered search shards on docs.
- [ ] Env reads move from `NEXT_PUBLIC_*` to Astro's `import.meta.env.PUBLIC_*` so staging builds keep working.
- [ ] Each route file is compared against the old site: build the Next site once and diff the route list and key markup, then screenshot at 390px and 1280px (see `apps/AGENTS.md`).
- [ ] The app's lint, `tc`, tests, and prose checks pass, and the PR carries a changeset.

## Part 2: Integrating

Use this checklist when integrating more into Astro.
Ticking the entire checklist means that the websites become more Astro-native.

- [ ] Static React components become `.astro` components, converted bottom-up. Write the first conversion test-first through the Astro Container API. Only the hydrated islands keep React.
- [ ] `ClientRouter` replaces the SPA feel; docs page transitions use CSS transitions.
- [ ] Content collections are set up:
    - **guide and home** use `@fumadocs/astro`: `pageLoader()` and `metaLoader()` feed `defineCollection`, and `toFumadocsSource()` plugs the collections into the existing `fumadocs-core/source` `loader({ baseUrl })`. Frontmatter schemas become zod schemas in the content config. `fumadocs-mdx` is removed. The integration runs on Astro's Sätteri processor and accepts only Sätteri plugins, so rewrite the six custom remark and rehype plugins in `apps/guide/source.config.ts` as Sätteri `mdastPlugins` and `hastPlugins`, and pass them through the integration's per-collection options. Markdown twin generation moves from `apps/guide/tests/twinPipeline.ts` into build-time endpoints. The twin pipeline can adopt `@fumadocs/satteri/remark-llms` or the integration's `includeProcessedMarkdown` option instead of driving `fumadocs-core`'s remark-llms directly.
    - **docs** keeps API Extractor exactly as it is. `vp run docs:extract` and `vp run docs:artifacts` are unchanged; the site consumes `generated/artifacts/` at build time through `getStaticPaths`, with an optional Content Loader wrapper around the engine if the collections pattern earns its keep.
- [ ] The Cloudflare adapter (`@astrojs/cloudflare`) replaces the hand-rolled worker wiring. Sites keep worker code only where the platform requires it, written as advanced-routing stages in a custom `src/worker.ts` pointed at by wrangler's `main`: twin negotiation, then the adapter's `cf()` asset handler, then `finalize()` around `astro()`. Docs keeps `replacedVersion()` reading `artifacts/index.json` from the assets binding, and guide keeps its `WorkerEntrypoint` class exporting the `GuideService` RPC.
- [ ] **docs only:** pages move from R2 to Workers Static Assets. Remove `r2_buckets` and `BUILD_ID` from the wrangler config, delete the R2 upload, prune, and purge scripts in `scripts/src/docs/` after grepping for consumers, and replace the rollback path with `wrangler versions upload`.
- [ ] Redirects and headers move to static configuration: guide's `RENAMED_PAGES` table generates `public/_redirects` at build (`build.redirects: false`), per-page `Link` headers move to `<link rel>` tags in the head, and `x-robots-tag` moves to a `_headers` file.

### Why the docs pipeline writes JSON to disk

The site reads the artifacts as files, and no in-memory hand-off from the extractor exists to replace that:

1. API Extractor writes one `.api.json` per entry point itself, and its public API returns only success and warnings. Nothing hands the parsed model over in memory.
2. `DocsEngine.fromManifest` skips the `manifest.json` read, but the engine still loads each `.api.json` from disk through `ApiModel.loadPackage`.
3. The runtime worker reads `artifacts/index.json` from the assets binding for version redirects, so the deployed build needs the file.
4. The artifacts carry `api.json` so a render-shape change can re-derive `project.json` without re-extracting.
5. Turbo caches `docs:extract` and `docs:artifacts` as two tasks keyed on the built declaration files. Folding extraction into the Astro build would re-run API Extractor on every rebuild.

An Astro Content Loader can call the engine directly and feed it in-memory data, but the engine then reads the same files, so the loader saves nothing. Build the docs routes from `generated/artifacts/` and leave the pipeline as it is.

## Part 3: Agent-readiness

Use this checklist after integrating more into Astro and when making the site more agent-friendly.
Ticking the entire checklist means that the website can be used by both humans and AI alike.

- [ ] Each route has a `.md` twin. Guide pages and blog posts already have twins, and docs twins cover the packages pages; extend coverage where a route lacks one.
- [ ] Each site generates `llms.txt` on each build. Home's `llms.txt` lists blog posts as links with their short description; it never inlines post contents.
- [ ] The agent surface is checked in CI: crawl the preview deployment, request each page with `Accept: text/markdown`, and assert the twin, `llms.txt`, and head links respond.
- [ ] The site was viewed as an agent through a local dev server.

## What replaces each worker job

| Site  | Today                                                         | After                                                                                                                                       |
| ----- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| home  | www redirect, staging noindex                                 | noindex moves to a per-environment generated `_headers` file. The www redirect is pending decision below.                                   |
| guide | twin negotiation, `/ask`, redirects, `GuideService` RPC       | twin negotiation and `cf()` in the advanced-routing pipeline, `/ask` as an Astro endpoint, `_redirects` from `RENAMED_PAGES`, RPC unchanged |
| docs  | R2 + `BUILD_ID`, version redirects, twin negotiation, headers | static assets, `replacedVersion()` against assets, twin negotiation in the pipeline, `_headers`                                             |

## Open decisions

Two serving questions still need the maintainer's call before work starts:

1. **Home's www redirect.** Keep a thin worker entrypoint, or move the redirect to a Cloudflare zone rule?
2. **Docs twin negotiation.** Keep serving `.md` at the page URL when a client sends `Accept: text/markdown`, or rely on the twin's `<link rel>` pointer? Guide keeps negotiation either way, and an external service consumes guide's `GuideService` RPC, so guide needs its worker entrypoint in both cases.

## Verify during implementation

- Vite's `ssr.external` configuration replaces Next's `serverExternalPackages` for the packages that read files off disk (`@seedcord/docs-engine`, `@seedcord/docs-generator`, `@microsoft/api-extractor-model`, `@microsoft/tsdoc`, `@microsoft/tsdoc-config`, `@takumi-rs/core`).
- `@fumadocs/astro` requires Astro's Sätteri Markdown processor and rejects the unified pipeline, so `@astrojs/markdown-remark` is unavailable on guide and home. Confirm its compiled MDX renders without hydration. Confirm Sätteri's mdast exposes `mdxJsxFlowElement` to plugins, because `remarkNoMappedJsx` and `remarkPageLinks` walk those nodes.
- `fetchFile` and wrangler's `main` cooperate when the entrypoint is a `WorkerEntrypoint` class.
- The link checker handles Astro's output layout once the migration removes the Next navigation special case.

## Post-migration experiment: build-time incremental builds

Astro doesn't have runtime ISR for prerendered pages. The build-time equivalent is the `experimental.incrementalBuild` flag (added in `astro@7.2.0`, so our `^7.4.11` pin has it). When a page's `cacheKey` and its module dependency graph both match the previous build, Astro copies that build's output instead of rendering the page again. Content collections join through each loader's per-entry `digest`, which changes whenever the entry's data changes. The Astro docs recommend `cacheKey: String(entry.digest)` inside `getStaticPaths`.

Turbo already replays `docs:extract`, `docs:artifacts`, and each site's build when nothing changed, so the flag only pays when a build actually runs: the site's code changed, or its data changed. The case to measure is a release, where one package's artifacts change and every other package's pages copy from cache. The Astro docs describe significant cuts on large sites where most pages change infrequently.

Adoption constraints:

1. Leave `build.concurrency` at the default. A value above `1` disables the incremental cache, and Astro re-renders every page.
2. CI must restore `node_modules/.astro/`, the project's `cacheDir`, before `astro build`, or every page re-renders. Cache that one directory in the deploy workflows, and run `astro build --force` for deliberate full rebuilds.
3. Only `getStaticPaths()` pages with a `cacheKey` reuse output. Every endpoint (`llms.txt`, sitemap, search shards) re-renders each build. Pages with server islands also re-render unless `ASTRO_KEY` is stable. The sites use client islands, so this matters only if a future change adds server islands.

One check gates adoption: whether `@fumadocs/astro`'s `pageLoader()` exposes per-entry digests. The Content Loader API leaves digest updates to each loader, so confirm before guide and home inherit the flag. The docs site's loader computes its own digest, a content hash of each package's `project.json`.

Route caching (stable in Astro 7) is the runtime half of ISR: `Astro.cache.set({ maxAge, swr, tags })`, config-level `routeRules`, and the experimental `cacheCloudflare()` provider from `@astrojs/cloudflare/cache`. It caches only on-demand routes. All three sites are fully prerendered, and Workers Static Assets already serves them from the edge. Guide's `/ask` is a POST endpoint, so nothing there is cacheable HTML. Don't configure route caching now. Revisit it only if a site moves pages on-demand.

## Deferred: Void (void.cloud)

Void is VoidZero's Vite plugin, SDK, CLI, and platform for full-stack Vite apps on Cloudflare Workers. Its Astro integration fits our shape (Astro 7, `voidPlugin()` in the Vite config, bindings from `cloudflare:workers`), and it would mainly benefit guide: `void/ai` replaces the hand-typed Workers AI interface, `env.ts` replaces wrangler vars, and `void deploy` replaces `wrangler deploy` with readiness checks and rollback.

Adoption is deferred until the sites ship and stabilize, because:

1. Void doesn't support named Cloudflare environments, so staging at `next.seedcord.org` needs a separate Void project per target.
2. Void's framework mode generates its own worker entrypoint, and exporting guide's `GuideService` RPC to its external consumer is unverified.
3. Ratelimit bindings like guide's `ASK_LIMIT` aren't in Void's inference table.

When the time comes, adopt Void on guide first: run `void init`, link the existing worker so Void preserves bindings and secrets in `void.config.ts` and `void.lock.json`, then replace `wrangler deploy` in the deploy workflow.
