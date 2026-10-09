# Testing policy

## Active website: Next.js App Router

The deployment contract is the actual production Next.js server. CI builds the app, starts `next start`, and runs `scripts/verify-next.sh` against raw HTTP responses. The smoke test checks crawler-visible route HTML, language, unique canonical/title tags, Open Graph/Twitter metadata, server JSON-LD, noindex behavior, permanent redirects, 404 status, and the tRPC handler.

## Retained Vite SSR tests

The old Vite SSR implementation remains available as a rollback/reference path while the migration is validated. Tests that import `client/src/entry-server.tsx` deliberately exercise that legacy implementation; they do not replace the production Next.js smoke tests.

## General rules

1. Prefer testing rendered behavior over source strings when practical.
2. Source-level assertions are still reasonable for static policy/configuration that is not directly observable in rendered HTML (for example sitemap files, CSS guardrails, and redirect declarations). Name those tests accordingly.
3. Keep server tests independent from live credentials and external services; stub the database and network-dependent behavior.
4. When production routing or metadata changes, update both `next.config.ts` and the Next-specific routing tests.

## Commands

```bash
corepack pnpm test
corepack pnpm check
corepack pnpm build
PORT=4101 corepack pnpm start
BASE=http://localhost:4101 bash scripts/verify-next.sh
```

For the old Vite server only, use `pnpm dev:legacy`, `pnpm build:legacy`, and `pnpm start:legacy`.
