# Akbar Nawasunda — Official Website

Official website and digital home of **Akbar Nawasunda**, an Indonesian music artist, producer, remixer, and DJ from West Bandung. The site brings together his original releases, remix work, visual projects, live information, press materials, and official listening links.

[Visit akbarnawasunda.my.id](https://akbarnawasunda.my.id/)

## What the site includes

The public experience is organized around a small set of clear destinations:

- **Music** — official listening links, selected releases, and the wider catalog.
- **Visuals** — official videos, visual studies, and selected visual work.
- **Live** — confirmed show information with event, venue, date, and route details when available.
- **Archive** — the artist’s creative timeline, selected artwork, and official project routes.
- **About** — artist profile, musical journey, public identity, and contact routes.
- **Press & Booking** — an online EPK for promoters, media, playlist editors, collaborators, licensing inquiries, and booking requests.
- **JEDAG RUN** — a lightweight playable Night Frequency signal with public username gate, score, combo, Drop Meter, local best score, and a global Top 10 board.
- **Privacy** — a plain-language explanation of the site’s data posture and third-party services.

Original work is presented under the **Akbar Nawasunda** name. Earlier remix work is also associated with the historical alias **DJ Akbar Remix**.

## Content Studio

The repository includes a protected editorial Studio for managing the public website without editing source code for every content update. The Studio is designed to keep the editing experience close to the published result, including:

- page-level content sections for the public site;
- music, visual, live, press, inquiry, and licensing content;
- real media thumbnails and an asset library;
- Visual Archive references and import-to-content workflows;
- document previews for the main public sections;
- JEDAG RUN game configuration with replaceable BGM and SFX fields;
- public leaderboard rules that store only a submitted display username and score;
- controlled owner access for editorial changes and inquiries.

The public site keeps official links and media references visible even when an embedded player is not required.

## Technology

The active website uses:

- Next.js App Router, React 19, and TypeScript;
- Server-rendered route pages with route-aware metadata, structured data, and locale alternates;
- Next.js Route Handlers for tRPC and the OAuth callback, backed by the existing tRPC router;
- Framework-neutral authentication context and Drizzle ORM with MySQL/TiDB support;
- Tailwind CSS 4, Radix UI, and the existing interactive React components;
- Vercel's native Next.js deployment and Node.js 24.x with pnpm.

The application has one active web runtime: Next.js App Router. Legacy Vite/Express entry points and duplicated static-site assets have been removed; compatibility URLs issue permanent redirects to their current Next.js destinations.

Media files are served through the project’s configured storage layer or approved public asset routes. Secrets and environment values are kept outside the repository.

## Typography system

The public site uses a self-hosted, role-based type system. Next.js serves the font files from `public/assets/fonts/fontsource/`; the canonical `@font-face` declarations and CSS tokens remain in `client/src/index.css`.

| Role | Font | Primary use |
|---|---|---|
| Primary display | **Recons** | Brand wordmark, H1, hero, splash, and particle wordmark |
| Secondary display | **NEXROID** | H2–H4, section headings, release titles, and card titles |
| Primary text/UI | **Good Times** (`Good Times Rg.woff2`) | Body copy, navigation, controls, CTAs, forms, metadata, player, and footer |
| Signature | **Towards** | Latin reading beside the Sundanese signature only |
| Sundanese | **Noto Sans Sundanese** | Sundanese script only |
| Game | **Fluorite** | JEDAG RUN title and in-game overlays only |

The text/UI tokens (`--font-body`, `--font-mono`, and `--font-label`) all resolve to Good Times. Their scale and tracking are intentionally compact so interface text remains readable without feeling too wide. Noctavell and Velomino are not part of the active core type system. The app does not load remote font providers and disables synthetic bold/italic with `font-synthesis: none`.

For the public-page coverage map, see [`docs/audit-tipografi-teks-publik.md`](docs/audit-tipografi-teks-publik.md). The next-session visual revision handoff is available in [`docs/prompt-sesi-baru-revisi-tipografi.md`](docs/prompt-sesi-baru-revisi-tipografi.md).

## SEO and discoverability

Public routes are rendered by the Next.js App Router with route-aware metadata so crawlers and social platforms receive complete content without relying on client-side JavaScript.

- Each indexable route emits a route-aware title, meta description, canonical URL, Open Graph metadata, and Twitter card metadata.
- Indonesian and English public routes publish reciprocal `hreflang` alternates plus an `x-default` URL; the server-rendered `<html lang>` follows the requested locale.
- JSON-LD is rendered server-side for the site, public page, and artist/music context; release detail pages receive route-specific titles, descriptions, and artwork.
- [`public/sitemap.xml`](public/sitemap.xml) lists the public ID/EN routes, while [`public/robots.txt`](public/robots.txt) exposes that sitemap and blocks admin/studio surfaces.
- 404 and non-public surfaces emit `noindex`; canonical compatibility redirects live in `next.config.ts`, while media responses use Next.js Route Handlers.

SEO coverage is protected by sitemap/indexability tests and the production crawler smoke suite in [`scripts/verify-next.sh`](scripts/verify-next.sh).

## Local development

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The development server is available at `http://localhost:3000` unless the environment specifies another port.

Useful project commands:

```bash
pnpm dev           # Next.js App Router at http://localhost:3000
pnpm check         # TypeScript validation
pnpm test          # Run the Vitest suite
pnpm build         # Build the Next.js production app
pnpm start         # Serve the production build
pnpm audit:layout  # Check CSS/layout and local-font policy guardrails
pnpm format        # Format project files with Prettier
```

Node 24 and pnpm 10 are expected; the exact pnpm version is pinned in the `packageManager` field of `package.json` and activated through Corepack (`corepack enable`). Editor defaults (UTF-8, LF, two-space indent) come from `.editorconfig`.

Database-backed features require the project environment to provide the appropriate database, authentication, storage, and email configuration. Never commit `.env` files, passwords, API keys, session secrets, or database connection strings.

## Testing

Unit and integration tests target the active App Router modules and a small route-rendering harness. Vitest uses Vite only as its development-time transform engine; no Vite website/runtime configuration remains. The production gate builds Next.js, starts the actual production server, and crawls raw HTTP responses through `scripts/verify-next.sh` to check route status, locale, canonical/OG/Twitter metadata, JSON-LD, noindex rules, redirects, static assets, and the tRPC endpoint. The production smoke test is intentionally separate from unit rendering so a passing unit suite is not treated as proof of deployment correctness. See [`docs/notes/testing-policy.md`](docs/notes/testing-policy.md).

Every push and pull request runs `.github/workflows/quality.yml`: typecheck, unit/integration tests, a full Next.js build, then production HTTP smoke tests.

## Public routes

The main Indonesian routes are:

```text
/
/music
/visuals
/live
/universe
/about
/epk
/inquire
/licensing
/game/jedag-run
/privacy
```

English versions are available under `/en`, including the corresponding music, visuals, live, archive, profile, EPK, inquiry, licensing, game, and privacy routes.

## Project principles

This project treats the website as an official source of artist information rather than a generic landing page. Public copy is kept concise and factual, official platform links are preserved, visual assets are selected from approved sources, and personal information is not added unless it is necessary and intentionally public.

Changes to the public catalog, third-party releases, or platform metadata should be made only when the underlying information is verified. The website is not used to invent credits, events, collaborations, or release details.

## License

The repository is maintained for the Akbar Nawasunda official website and its editorial tools. The project package is marked as MIT in `package.json`; individual media assets, trademarks, recordings, artwork, and third-party platform content remain subject to their respective rights and terms.
