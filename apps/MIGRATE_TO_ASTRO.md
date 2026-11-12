# Migrating Next.js sites to Astro

Following the Vite takeover at seedcord, the framework used by the websites (Next.js) isn't aligned well with Vite. An evaluation between different Vite-based migration targets showed that Astro was the best choice among 3 candidates.

When migrating over from Next.js to Astro, consult the Astro documentation on migrating from Next.js. If you have the Astro MCP server enabled, use it to query the page, otherwise, make a web request to the Astro docs.

The migration to Astro is split into 3 parts, with the 3rd part as an extra to make the Astro site agent-friendly.

Each checklist below is a reusable checklist; reuse the checklist for each site (docs, guide, home).

## Part 1: Onboarding

Use this checklist when iniially migrating from Next.js to Astro.
Ticking the entire checklist means that the site is functionally identical to the old Next.js-based site, with minimal changes made to fix the site and ensure it works identical.

- [ ] New, minimal Astro project created.
- [ ] Each route on the Next.js site is used on their equivalent path on the Astro site.
- [ ] Each component, layout, etc... are also mounted on their Astro equivalents.
- [ ] Replace framework imports with the Astro version of said imports.
- [ ] Test each route file to ensure they look identical to the old site.

## Part 2: Integrating

Use this checklist when integrating more into Astro.
Ticking the entire checklist means that the websites become more Astro-native.

- [ ] Migrate static React components to Astro components
- [ ] Use Astro's `ClientRouter` or CSS transitions to replicate the current SPA feel
- [ ] Setup build-time content collections with API Extractor (docs only)
- [ ] Use Astro's official Cloudflare adapter instead of a `worker.ts` entrypoint
- [ ] Also use the Void plugin with Astro
- [ ] Store pages using Workers Static Assets instead of R2

## Part 3: Agent-readiness

Use this checklist after integrating more into Astro and when making the site more agent-friendly.
Ticking the entire checklist means that the website can be used by both humans and AI alike.

- [ ] Add a .md equivalent to each route (docs/guide only(?))
- [ ] Generate an overall `llms.txt` on each build (home's `llms.txt` must not cover blog posts)
- [ ] Test viewing each site as an agent with a local dev server
