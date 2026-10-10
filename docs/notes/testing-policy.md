# Testing policy

## Active website: Next.js App Router

There is one active web runtime. Tests should exercise App Router modules, server-only data helpers, the React components used by those routes, or the deployed production server. Vitest's Vite dependency is used only as a test-time transform engine; it does not build or serve a second site. Do not add a second Vite/Express route implementation as a rollback or reference path.

The deployment contract is the actual production Next.js server. CI builds the app, starts `next start`, and runs `scripts/verify-next.sh` against raw HTTP responses. The smoke test checks crawler-visible route HTML, language, title/canonical metadata, Open Graph/Twitter cards, server-rendered JSON-LD, noindex behavior, permanent compatibility redirects, static assets, HTTP 404 behavior, and the tRPC handler.

`server/test-renderer.tsx` is a deterministic unit-test harness for route components. It supplies a test-only implementation of the navigation hooks normally provided by Next.js; it is not a replacement for Next's server renderer or the production HTTP smoke test. Prefer assertions on the HTML and route metadata returned by this harness over brittle source-string checks.

## General rules

1. Prefer observable rendered behavior over source strings when practical.
2. Source-level assertions are appropriate for static policy/configuration that is not directly observable in rendered HTML (for example sitemap contents, CSS guardrails, redirects, and dependency boundaries). Keep them focused on the active implementation.
3. Keep server tests independent from live credentials and external services; stub the database, storage, and network-dependent behavior.
4. When route, redirect, metadata, or API behavior changes, update the App Router module and the relevant unit and production smoke tests.
5. Do not retain stale tests that import deleted Vite/Express entry points. Migrate the assertion to the Next.js contract, or remove it if the behavior no longer exists.
6. Validate with the deployed runtime's Node.js 24.x line before claiming a release-ready result.

## Commands

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm test
NEXT_PUBLIC_SITE_URL=http://localhost:4101 corepack pnpm build
NEXT_PUBLIC_SITE_URL=http://localhost:4101 PORT=4101 corepack pnpm start
BASE=http://localhost:4101 bash scripts/verify-next.sh
```
