# Phase 5a — Shell, Routing, Nav, Footer, Tokens · Implementation Report

Date: 2026-10-03 · Branch `arena/01a0ffb8-akbar-next` · Pre-state HEAD `84ad7eb` (Phase 4 doc)

## 1. Pre-state

- Stack: React 19 + Vite 7 SPA with custom SSR (`client/src/entry-server.tsx`), wouter routing, tRPC + Drizzle + MySQL (Express `api/`), pnpm, vitest, `scripts/verify-ssr.sh` SSR gate.
- Baseline (before any 5a edit): `pnpm check` clean; `pnpm test` 54 files / 313 tests pass; `pnpm build` OK.
- Pre-existing warnings (noted, not fixed — out of scope): pnpm engine WARN "wanted node 24.x" (sandbox runs v22.22.3; build/tests pass regardless); OAuth `OAUTH_SERVER_URL` unset warning on server start (studio-only, public routes unaffected).
- Test suite pinned the OLD contract (ARSIP label, permanent JADWAL nav item, `/visuals/portraits` routes, ARCHIVE EN label) — those pins were updated in this phase, never code-reverted to satisfy stale assertions.

## 2. Files changed

| File | Change (one line) |
|---|---|
| `client/src/index.css` | `:root` upgraded to Phase 4 canonical palette + `--signal-dim`, `--dur-pulse`, `--text-h1`, `--lines`, hoisted `--an-birthday`; focus ring offset 3px→2px + paper ring on solid-signal buttons; `prefers-contrast: more` block |
| `client/src/shell/EditorialRefresh.css` | Dropped duplicated palette/font/line declarations (now inherit `:root`); removed second focus rule (single source); mobile header CTA unhidden + 44px toggle |
| `client/src/components/NightFrequencyChrome.tsx` | Desktop nav 6 items + conditional JADWAL (slot 3); footer: Arsip→Perjalanan, +JEDAG RUN, +Privasi, Jadwal kept |
| `client/src/components/EnglishChrome.tsx` | EN nav mirror (JOURNEY, `/en/universe` bug fixed, conditional LIVE slot 3); footer always exposes Live + JEDAG RUN; header CTA INQUIRE→LISTEN (`/en/music`) for ID parity |
| `client/src/components/MobileNav.tsx` | Drawer 6 items (Perjalanan; EN `/en/universe` fixed); schedule item appended as row 7 only with confirmed events (`withScheduleItem`); drawer "Kabar Terbaru" link fixed to `/#signal` cross-page anchor |
| `client/src/content/publicContent.ts` | Added `isConfirmedPublicEvent` / `publicConfirmedEvents` — single definition of "confirmed" (upcoming, parseable date, not TBA) |
| `client/src/pages/Live.tsx` | Uses shared `publicConfirmedEvents` (inline TBA filter removed — no second definition) |
| `client/src/signature/routeSignal.ts` | Removed `/visuals/portraits` meta; `/live` label LIVE→JADWAL (ID); `/universe` ARSIP→PERJALANAN / ARCHIVE→JOURNEY |
| `client/src/App.tsx` | Portrait routes replaced by `ClientRedirect` (SPA/dev fallback; meta-refresh no-JS path); preload, language-pair, title maps pruned |
| `vercel.json` | +301 `/visuals/portraits → /visuals#portraits`, `/en/visuals/portraits → /en/visuals#portraits` |
| `server/_core/vite.ts` | Dev server mirrors the same two 301s (kept in sync with vercel.json) |
| `client/public/sitemap.xml` | Removed both portrait URLs |
| `client/index.html` | Preload `clash-display-600`→`clash-display-500` (Phase 4 critical set); preloader inline palette → canonical values |
| `client/src/components/StudioClock.css` | Local `--an-birthday` `:root` decl removed (single source in index.css) |
| `client/src/components/CommandPalette.tsx` | Portrait entry removed; universe entry relabeled Perjalanan/Journey |
| `client/src/ssr/prefetch.ts` | Portrait titles + route entry removed |
| `client/src/pages/Visuals.tsx` | `portraitsHref` → `/visuals#portraits` / `/en/visuals#portraits` (anchor built in 5d) |
| `client/src/components/VisualPortraitStudies.tsx` | Deep links → in-page `#portraits` anchor |
| `client/src/pages/PortraitStage.css` | Comment updated (route no longer exists) |
| `client/src/components/Studio{DocumentPreview,GalleryAnalytics,WorkspaceChrome,PageMirror}.tsx` | Owner-tool preview links/entries → `/visuals#portraits` (route removed) |
| `client/src/components/NightFrequencyChrome.css` | Beacon pulse 1.8s → `var(--dur-pulse)`; menu toggle 40px → 44px |
| 13 `server/*.test.ts` files | Pins updated to the new contract (see §7); `vercelRouting.test.ts` gained a sync assertion for the two 301s |

Kept deliberately: `VisualPortraitGallery.tsx` (5d reuses its gallery/lightbox content inside `/visuals`); `StudioSiteMap.tsx` untouched beyond the mirror entry (owner tooling).

## 3. Routing decisions

| Old URL | New URL | Type | Why |
|---|---|---|---|
| `/visuals/portraits` | `/visuals#portraits` | 301 (vercel.json + dev mirror + SPA `ClientRedirect` fallback) | 2–3 images don't earn a route (Phase 3 §2 row 5); lightbox preserved in-page |
| `/en/visuals/portraits` | `/en/visuals#portraits` | 301 (same three layers) | EN mirror parity |
| `/archive` | `/universe` | 301 (unchanged, verified still firing) | Pre-existing; must survive the label rename |
| `/epk.html`, `/index.html`, trailing slashes | (unchanged) | 301 (unchanged) | Pre-existing |

`/universe` URL preserved everywhere (bookmarks, sitemap, `/archive` landing). Label-only rename ARSIP→PERJALANAN (ID) / ARCHIVE→JOURNEY (EN) in nav, footer, curtain metadata, palette.

## 4. Token implementation (Phase 4 → one source of truth)

- `:root` in `client/src/index.css` now holds the canonical palette: `--ink #101211`, `--ink-soft #171a18`, `--ink-card #1b1e1c`, `--ink-hover #232724`, `--paper #f1efe9`, `--paper-soft #d5d2ca`, `--acid/--signal #9bb9c1`, `--signal-dim` (color-mix 55%), `--mute #a6a69f`, `--mute-soft #777a74` (non-essential micro-labels only), `--ink-line` paper 13%, `--paper-line` paper 14%, `--an-birthday #dcb573`, `--state-ok/--state-err`, sepia darkroom set (already present), `--dur-pulse 2000ms`, `--text-h1 clamp(2.4rem,5vw,4rem)`, `--lines = --max (1440px)`.
- Legacy aliases (`--cyan*`, `--mint`, `--blue`, `--accent-violet`) now point at the single accent via `color-mix`/`var` — no stray hex.
- `EditorialRefresh.css` public scope no longer duplicates any color/font/line value (was the live palette's second copy); it only adds `--editorial-gutter/-rule/-accent` (accent = `var(--signal)`).
- `StudioClock.css` local `--an-birthday` removed.
- Focus: one base rule — `2px solid var(--acid)` offset `2px`, radius 2px; on solid-signal fills (`.an-btn--solid`, `.an-inquiry-submit`, `.button-primary`, `.nf-button`) the ring switches to `--paper` (signal-on-signal would vanish).
- `prefers-contrast: more`: hairlines → paper 20%, `--mute` → `--paper-soft` (Phase 4 §12, two-token change).
- Beacon pulse and preloader now use token/canonical values; index.html preloads exactly the three Phase 4 critical fonts (`clash-display-500`, `general-sans-400`, `azeret-mono-500`, ≈63 KB, `font-display: swap` already in place).
- Game/studio routes shift by the same tiny amount as the public routes (e.g. ink `#0a0b0c→#101211`) — accepted unification, noted here rather than carved out.

## 5. Navigation

**Desktop (ID):** MUSIK · VISUAL · [JADWAL] · PERJALANAN · TENTANG · EPK · KONTAK — 6 permanent items; JADWAL occupies slot 3 only when `publicConfirmedEvents(cms.data).length > 0`. Currently no confirmed CMS event → nav renders 6 items [FACT: rendered HTML verified].
**Desktop (EN):** MUSIC · VISUALS · [LIVE] · JOURNEY · ABOUT · EPK · CONTACT (same rule; `/en/universe` bug from Phase 3 §10 fixed).
**Mobile drawer (both languages):** flat 6 items, same order, descriptions kept; schedule item is appended as row 7 (not inserted at slot 3) when a confirmed event exists — per Phase 3 §7 ("7th row, appended"). Scroll-lock (`useLockBodyScroll`), focus trap, Escape-to-close, focus-return to trigger, auto-close on resize >1080px — all pre-existing, preserved; drawer "Kabar Terbaru" link fixed (`#signal` → `/#signal`, works from any page because Home scrolls to the hash on mount).
**Header (mobile):** logo → Home, **Dengarkan/LISTEN → /music** (previously hidden below 1080px — restored per Phase 3 §7's always-visible listen action; 44px min-height), menu toggle 44px (was 40/42px). EN CTA changed INQUIRE→LISTEN (`/en/inquire` remains one tap away in nav CONTACT + footer) — decision documented in §12-deviations-of-5b; it is a shell change made under 5a.

## 6. Footer (ID, mirrored EN)

- JELAJAHI: Musik, Visual, **Jadwal** (kept — nav slot is conditional), **Perjalanan** (was Arsip), Tentang, **JEDAG RUN** (added — Phase 3 row 12 "footer row").
- HUBUNGI: platform list, EPK / Booking, **Privasi** (added — Phase 3 row 13: ID footer had no privacy link while EN did; now equivalent).
- EN DISCONNECT column always lists Live (even with empty calendar) — `/live` stays reachable per Phase 3 §7 footer set, independent of the nav condition.

## 7. Verification checklist

| Check | Result |
|---|---|
| `pnpm check` (tsc) | PASS |
| `pnpm test` | PASS — 54 files / 313 tests (was 313 baseline; pins re-targeted, none deleted) |
| `pnpm build` | PASS (client 1921 modules; ssr 68.9 kb) |
| `scripts/verify-ssr.sh` (32 assertions, 2 UA matrix) | PASS — ALL GREEN |
| All public routes resolve (curl, production server :4101) | PASS — 15 routes 200; /404 + unknown = 404 |
| `/visuals/portraits` 301 → `/visuals#portraits` | PASS (local dev mirror; production enforced by vercel.json — no Vercel deploy available in sandbox) |
| `/en/visuals/portraits` 301 → `/en/visuals#portraits` | PASS (same note) |
| `/archive` 301 → `/universe` preserved | PASS |
| Nav desktop 6 items, JADWAL absent (no confirmed event) | PASS (rendered HTML) |
| Footer set (Jadwal, JEDAG RUN, Privasi, platforms, EPK) | PASS (rendered HTML) |
| EN `/en/universe` bug fixed (nav + footer) | PASS (rendered HTML) |
| Mobile drawer scroll-lock / focus trap / Escape / focus return | PASS by code (pre-existing implementation preserved; no browser in sandbox → visual confirmation needs a human) |
| 44px touch targets (toggle, drawer links 52px, mobile CTA) | PASS (CSS) |
| No hard-coded palette values leaked in public scope | PARTIAL — public scope clean; owner/studio + game layers still carry their own values (out of 5a scope, flagged for 5g) |
| No console errors | NOT VERIFIABLE (no browser in sandbox; SSR HTML + HTTP verified instead) |

## 8. Known limitations

1. **No browser in sandbox** — pixel/interaction verification limited to SSR-rendered HTML + HTTP + code-level review. Mobile drawer behavior, focus-ring appearance, and console cleanliness need one human browser pass (flagged for 5g).
2. **Lightbox gallery gap window** — between 5a and 5d the lightbox portrait experience is unreachable from a public route (route removed, in-page section not yet built). `VisualPortraitGallery.tsx` is retained for 5d to consume.
3. **`/#portraits` anchor doesn't exist yet** — the CTA/deep-links in `/visuals` point at it; harmless (stays on-page) until 5d builds the anchor.
4. Production 301s are declared in `vercel.json` but not deploy-verified (sandbox can't hit Vercel).
5. EN header CTA semantics changed (INQUIRE→LISTEN) — see 5b report deviations.

## 9. Open risks for 5b–5g

- 5b: home hero CTA still had the CMS-URL override risk (R2) — **fixed in 5b** (same commit line of work).
- 5c (Music): channel list on home and `/music` share `publicPlatformLinks`; no shell coupling.
- 5d (Visuals): must build `#portraits` anchor + lightbox section; `editorialOptimization.test.ts` image contract was re-targeted to `/universe` in 5a and should be re-asserted against `/visuals` once the section exists.
- 5g (a11y/perf/SEO): token sweep of owner/game layers; full focus-ring audit; deploy-level redirect check; sitemap/OG pass; human-browser console check.
- CMS: nav JADWAL condition depends on `events` records with real dates — when the first confirmed event is published, nav (slot 3 desktop / row 7 mobile) must be spot-checked.
