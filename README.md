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
- **Privacy** — a plain-language explanation of the site’s data posture and third-party services.

Original work is presented under the **Akbar Nawasunda** name. Earlier remix work is also associated with the historical alias **DJ Akbar Remix**.

## Content Studio

The repository includes a protected editorial Studio for managing the public website without editing source code for every content update. The Studio is designed to keep the editing experience close to the published result, including:

- page-level content sections for the public site;
- music, visual, live, press, inquiry, and licensing content;
- real media thumbnails and an asset library;
- Visual Archive references and import-to-content workflows;
- document previews for the main public sections;
- controlled owner access for editorial changes and inquiries.

The public site keeps official links and media references visible even when an embedded player is not required.

## Technology

The current application uses:

- React 19 and TypeScript;
- Vite for the frontend build;
- Express and tRPC for the application/API layer;
- Drizzle ORM with MySQL/TiDB-compatible database support;
- Tailwind CSS, Radix UI, Framer Motion, Three.js, and Lucide icons;
- Vercel deployment with a serverless tRPC entry point;
- Node.js 24.x and pnpm.

Media files are served through the project’s configured storage layer or approved public asset routes. Secrets and environment values are kept outside the repository.

## Local development

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The development server is available at `http://localhost:3000` unless the environment specifies another port.

Useful project commands:

```bash
pnpm check    # TypeScript validation
pnpm test     # Run the Vitest suite
pnpm build    # Build the frontend, server bundle, and API entry point
pnpm format   # Format project files with Prettier
```

Database-backed features require the project environment to provide the appropriate database, authentication, storage, and email configuration. Never commit `.env` files, passwords, API keys, session secrets, or database connection strings.

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
/privacy
```

English versions are available under `/en`, including the corresponding music, visuals, live, archive, profile, EPK, inquiry, licensing, and privacy routes.

## Project principles

This project treats the website as an official source of artist information rather than a generic landing page. Public copy is kept concise and factual, official platform links are preserved, visual assets are selected from approved sources, and personal information is not added unless it is necessary and intentionally public.

Changes to the public catalog, third-party releases, or platform metadata should be made only when the underlying information is verified. The website is not used to invent credits, events, collaborations, or release details.

## License

The repository is maintained for the Akbar Nawasunda official website and its editorial tools. The project package is marked as MIT in `package.json`; individual media assets, trademarks, recordings, artwork, and third-party platform content remain subject to their respective rights and terms.
