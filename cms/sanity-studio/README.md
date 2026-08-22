# Akbar Nawasunda CMS

This independent Sanity Studio powers the Vercel-facing public website without adding the editor bundle to the public site.

## Commands

Run the following from this directory:

```bash
pnpm install
pnpm dev
pnpm deploy
```

The Studio connects to Sanity project `3t6l52on`, dataset `production`.

Before the public Vercel website can read the CMS, add its production domain in Sanity Manage under API → CORS Origins. Add the owner’s Studio domain there with authenticated requests enabled.
