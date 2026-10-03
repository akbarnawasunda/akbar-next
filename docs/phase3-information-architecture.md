# Phase 3 — Information Architecture & Page Structure

**Akbar Nawasunda — akbarnawasunda.my.id**
Date: 2026-10-03 · Branch: `arena/01a0ffb8-akbar-next` (from `main` @ `0b29dba`)
Status: DECISIONS ONLY — no code, no visual design. Phase 4/5 inputs.

**Evidence base (what counts as FACT here):** the deployed code in `client/src` (routes, pages, chrome, player),
`client/public/data/*` (static catalog), `drizzle/schema.ts` (content + lead models), `vercel.json` (redirects/SSR),
`client/public/sitemap.xml` + `robots.txt`, the live site at `akbarnawasunda.my.id` (fetched 2026-10-03),
and the repository's own audit docs (`docs/redesign-foundation-audit.md`, `docs/notes/official-artist-site-audit.md`,
`docs/notes/legacy-content-migration-audit.md`, `docs/notes/verification-an-archive-notes.md`,
`docs/notes/editorial-simplification-notes.md`, `docs/design-language.md`).
Claims are tagged **[FACT]** (supported by the evidence above), **[INTERP]** (design interpretation of that evidence
or of the Phase 2 direction as carried in the Phase 3 context), or **[INVENT]** (new idea introduced here — used
deliberately rarely; in this IA, zero).

---

## 0. What the content actually is (facts that drive the structure)

1. The catalog is **8 releases** (4 originals as Akbar Nawasunda; 4 remixes/bootlegs as DJ Akbar Remix),
   2024–2025, spread across Spotify / Apple Music / SoundCloud [FACT: `client/public/data/releases.json`,
   `client/src/content/artistPlatform.ts`].
2. The artist works under **two names**: *DJ Akbar Remix* (since 2020, reinterpretations) and *Akbar Nawasunda*
   (originals) [FACT: `verifiedArtistProfile.aliases`, journey fallback in `publicContent.ts`]. The static data
   already splits the catalog along this line (`cat: "originals" | "remixes"`) [FACT].
3. The melodic material is **local-language**: Javanese (*Kamu Nanyeak*, *Pada Imut Aisyah Tak Belagu*,
   *Ngertenono Ati*), Minang (*DJ Rantau Den Panjauah*), dangdut (Papinka cover), Bandung-based
   [FACT: catalog titles]. The site is **Bahasa-Indonesia-first** with a full `/en` mirror and hreflang
   [FACT: `App.tsx`, `sitemap.xml`].
4. **Jedag Jedug** — one of the artist's genres [FACT] — has a **playable object**: the JEDAG RUN game route with
   its own audio set, leaderboard table, and CMS config [FACT: `/game/jedag-run`, `gameLeaderboard` table,
   `CmsGameConfig`].
5. **No confirmed public events exist.** Placeholder events are actively filtered out of public display
   [FACT: `isUpcomingPublicEvent`, `/live` empty state].
6. Every release carries a **rights vocabulary**: `CATALOG ENTRY` / `REMIX · CLEARANCE REQUIRED` /
   `UNOFFICIAL EDIT · CLEARANCE REQUIRED` [FACT: `rightsLabel` in `ReleaseDetail.tsx`].
7. Journey content is **two verified milestones** (2020 → SEKARANG) [FACT: `verifiedJourneyFallback`].
   Portrait studies: **2** (+ official/editorial portraits) [FACT]. Videos: **3** [FACT]. EPK asset files
   (one-sheet, photo pack, logo pack, rider): **none exist yet**; asset rows render only when a URL exists
   [FACT: `PressKit.tsx` filter, `legacy-content-migration-audit.md`].
8. A **global persistent player** exists in the shell, but it is hardwired to the single "current release"
   [FACT: `GlobalAudioPlayer.tsx` — track = `cmsCurrentRelease` only].
9. Existing redirects: `/archive → /universe` (301), `/epk.html → /epk`, `/index.html → /` [FACT: `vercel.json`].
   `/universe` is in the public sitemap, so it is a bookmarkable public URL [FACT: `sitemap.xml`].
10. The repo has already codified an editorial ownership rule: the full biography lives on `/about`; the journey
    page "dibaca lewat era dan rilisan"; the fan-signal form belongs to the homepage only; catalogs are not
    duplicated across pages [FACT: code comments in `publicContent.ts`, `Music.tsx`, `Home.tsx`, `Universe.tsx`].
11. The live homepage currently shows an **inconsistency**: the hero CTA "DENGAR SEKARANG" points to
    *Ngertenono Ati Medium Hall* (CMS hero `primaryActionUrl`) while the "Rilisan terbaru" section and the global
    player use *Masih Mencintainya — Papinka* (`isCurrent: true`) [FACT: live fetch 2026-10-03,
    `server/customContent.test.ts`].
12. The EN chrome's "Archive" nav link points to `/universe` (the **ID** URL) instead of `/en/universe`, in both
    `EnglishChrome.tsx` and the EN mobile nav items [FACT].

**Consequence:** this is a small, honest, Indonesian-first catalog with a two-name history and one playable
signature object. The IA must make 8 releases feel like a complete work, not a sparse streaming feed.

---

## 1. FINAL SITEMAP

Public site. ID is the primary language; `/en/*` is a first-class mirror of every public route below
[FACT: existing hreflang system — kept].

```
/                        [existing]     Identity + what is happening now + one tap to listening.
/music                   [existing]     The catalog: two names, eight works, rights status per entry.
/music/:slug             [existing]     One release as a document: artwork, rights, story, credits, links.
/visuals                 [restructured] Video screenings + visual archive + portrait studies section.
/live                    [simplified]   Dates only: next-show document + confirmed index.
/universe                [renamed]      PERJALANAN / JOURNEY — the era timeline; home of the two-name story.
                                   (URL preserved; label and content restructured — see §2.)
/about                   [existing]     The artist: who, statement, identity facts. Single bio owner.
/epk                     [existing]     Press & booking fact sheet: snapshot, services, assets, contact.
/inquire                 [existing]     The single form for all professional requests (4 types).
/licensing               [simplified]   Usage & clearance: one short document → pre-filled inquiry.
/game/jedag-run          [existing]     The playable signature (JEDAG RUN).
/privacy                 [existing]     Policy. Footer presence only.
/404 (+ catch-all)       [existing]     Official 404.
/en/*                    [existing]     Full mirror of all of the above (bug fix for Archive link — §10).
```

Internal / owner-facing, **out of public IA scope, unchanged**: `/studio`, `/studio/inquiries`,
`/studio/broadcasts`, `/admin`, `/assets` [FACT: robots disallows, studio chrome].

**Removed:** `/visuals/portraits` (merged into `/visuals` — §2).
**New routes: none.** [INTERP — deliberate: every slot in this IA maps to content that already exists (FACT) or to
an interpretation of it; no route is proposed "because sites usually have this".]

---

## 2. ROUTE DECISIONS TABLE

Every existing route, with decision, reason, and redirect plan.

| # | Route (existing) | Decision | Reason (one line) | New URL | Redirect plan |
|---|---|---|---|---|---|
| 1 | `/` | **restructure** | Keep hero, signal board, latest-release document, channels, game teaser, booking CTA, fan signal; strip the duplicated journey/era timeline from the home signature stage (its home is `/universe`). | — | none |
| 2 | `/music` | **restructure** | The 8-entry catalog becomes the page itself, split into the two-name groups; per-row listening via an extended global player; the fixed two-player section and the unverifiable "also on Spotify" band are removed. | — | none |
| 3 | `/music/:slug` | **keep** | The rights-status release document is the most distinctive page in the system; strengthen story/credits from CMS as content is written. | — | none |
| 4 | `/visuals` | **expand + merge target** | Absorbs portrait studies as an in-page section (lead frame + grid + lightbox); screening, archive, and portraits become three sections of one visual route. | — | receives `/visuals/portraits` |
| 5 | `/visuals/portraits` | **merge (route removed)** | Two to three images do not earn a route [FACT: `portraitStudies` fallback]; the lightbox experience is preserved in-page. | `/visuals#portraits` | 301 `/visuals/portraits → /visuals#portraits` and `/en/visuals/portraits → /en/visuals#portraits`; drop both from `sitemap.xml`. |
| 6 | `/live` | **simplify + move** (out of primary nav until a date exists) | With zero confirmed events [FACT] the page is a booking pitch duplicating EPK; keep it as a dates-only surface with one booking CTA, and restore its nav slot automatically when the first CMS event is published. | `/live` (unchanged) | none |
| 7 | `/universe` | **rename (label) + restructure** | The word "universe" no longer describes the page (it has already drifted from fan-community to "About the Work" to "Perjalanan" [FACT: `ideas.md` route map, `App.tsx` titles, current H1]); the era timeline — the most artist-specific structure in the system — becomes the page's spine. **URL preserved** because it is a public, bookmarkable URL in the sitemap and the landing target of the existing `/archive` 301 [FACT]. | URL stays `/universe`; nav/footer label becomes **PERJALANAN** (ID) / **JOURNEY** (EN) | keep `/archive → /universe` (301) |
| 8 | `/about` | **keep** (contract tightened) | Single owner of the long bio and the artist statement; the service/booking pitch is reduced to one outbound line. | — | none |
| 9 | `/epk` | **keep** | Already shaped as a working fact sheet (snapshot → services → assets → contact → platforms); asset rows already render only when files exist, so it never promises empty downloads. | — | none |
| 10 | `/inquire` | **keep** | One form, four types, preselectable via `?type=` — the single low-friction professional surface. | — | none |
| 11 | `/licensing` | **simplify** | Reduce to a one-screen clearance document (what is allowed to be asked, what to include) with exactly two exits: pre-filled licensing inquiry + email. It is the landing target of "CLEARANCE / ASK FIRST" on every remix/bootleg release page, so it must stay a route. | — | none |
| 12 | `/game/jedag-run` | **keep** | The playable signature; a genre name the artist owns, made interactive. Entry via home teaser + footer row; not a primary-nav item (a game is not navigation). | — | none |
| 13 | `/privacy` | **keep** | Policy. Add the missing ID footer link (today only the EN footer links it) so both languages expose it equivalently. | — | none |
| 14 | `/404` + catch-all | **keep** | Official branded 404 already exists with the shared shell [FACT: `NotFound.tsx`]. | — | none |
| 15 | `/en/*` (all) | **keep** (bug fix) | Full mirror stays first-class; fix the EN "Archive" link that points to the ID URL [FACT: `EnglishChrome.tsx`, `MobileNav.tsx` EN items]. | — | none |
| 16 | `/studio*`, `/admin`, `/assets` | **keep** (internal) | Owner operations; robots-disallowed; explicitly outside the public IA. | — | none |

**Redirects to remain in `vercel.json` (FACT, unchanged):** `/epk.html → /epk` (301), `/index.html → /` (301),
`/archive → /universe` (301).
**New redirects:** only the two `/visuals/portraits` ones (row 5).
**No other URL is broken or renamed.** [INTERP — conservatism chosen because `/universe`, `/epk`, and the release
detail slugs are public and may be bookmarked by promoters or linked from social posts.]

---

## 3. PAGE PURPOSE CONTRACTS

### `/` — Home
- **FOR:** make the artist recognisable in seconds and put the music one tap away.
- **Visitor can:** play the current release immediately; see what is currently moving (release / live / studio
  rows); reach the full catalog, the visuals, the game, booking, and the fan list.
- **MUST NOT contain:** the journey era timeline (belongs to `/universe`); the full catalog rail (belongs to
  `/music`); the video list (belongs to `/visuals`); the event list (belongs to `/live`) — the repo has already
  codified exactly this non-duplication rule [FACT: `Home.tsx` comments]; fan-signal form duplicated elsewhere
  [FACT: `Music.tsx` comment].
- **Links out (intent):** current release (external platform) + `/music/:slug`; `/visuals`; catalog → `/music`;
  game → `/game/jedag-run`; booking → `/inquire?type=booking`, press → `/epk`; fan-signal (own form).

### `/music` — Music
- **FOR:** be the complete catalog, organised by the artist's two names, where every entry is tappable into its
  document and playable or openable on its official platform.
- **Visitor can:** hear the latest release at the top; browse all 8 works grouped as *Akbar Nawasunda*
  (originals) and *DJ Akbar Remix* (remixes/bootlegs); open any release document; play an entry via the global
  player; reach every official channel; start a licensing or remix request.
- **MUST NOT contain:** the full channel *campaign* (the channel index stays compact); filters/facets
  (8 entries — over-mechanised [INTERP]); a second catalog rail duplicated from home; unverifiable platform
  claims (the "also on Spotify" band [FACT: `bandTitle` copy claims per-release Spotify availability that the
  mixed-platform catalog does not support]).
- **Links out (intent):** each row → `/music/:slug`; per-release platform links (external); channels (external);
  `/licensing`; `/inquire?type=remix`.

### `/music/:slug` — Release document
- **FOR:** be one release as a factual document — what it is, who made it, where it lives, and what you may do
  with it.
- **Visitor can:** play/open on every official platform; read the story and credits (as written in CMS); see the
  rights status (CATALOG ENTRY / REMIX · CLEARANCE REQUIRED / UNOFFICIAL EDIT · CLEARANCE REQUIRED); start a
  clearance/licensing inquiry pre-filled for this context.
- **MUST NOT contain:** other releases' content (one "more releases" back-link is allowed, nothing more);
  fabricated credits or dates (fallbacks must stay honest, as today [FACT: `storyFallback`/`creditsFallback`]).
- **Links out (intent):** platform links (external); `/inquire?type=licensing&source=release`; back → `/music`.

### `/visuals` — Visuals
- **FOR:** be the visual archive: what has been filmed, and how the artist's visual language looks in stills.
- **Visitor can:** watch the official videos in-page (lazy-loaded) or open YouTube; browse the visual archive with
  its label filter; open portrait studies in the in-site lightbox; start a visual collaboration inquiry.
- **MUST NOT contain:** music catalog content; a second fan-signal form; empty filter states (hide the section
  when empty, as already done for the archive [FACT: `archiveItems.length > 0` guard]).
- **Links out (intent):** YouTube channel (external); `/inquire?type=visual&source=visuals`; back to home.

### `/live` — Dates
- **FOR:** answer exactly one question — "when and where is the next show?" — and, when there is none, say so
  honestly and route to booking.
- **Visitor can (date exists):** see the next-show document (date, venue, countdown, ticket/RSVP/map); see the
  confirmed index. **Visitor can (no date):** see the honest empty state and one booking CTA.
- **MUST NOT contain:** the service list (remix/collab rows [FACT: current `an-live-booking-options`]) — services
  belong to `/epk`; a full contact form — that belongs to `/inquire`.
- **Links out (intent):** `/inquire?type=booking&source=live`; ticket/RSVP/maps (external, when present); email.

### `/universe` — PERJALANAN / Journey
- **FOR:** tell the only story no other page tells: how one artist became two names across eras
  (2020 DJ Akbar Remix → now Akbar Nawasunda), read through the milestones and the releases that belong to each.
- **Visitor can:** scroll the era timeline; open any era's releases into their documents; reach the catalog and
  the visual archive.
- **MUST NOT contain:** the long biography (single owner: `/about` [FACT: existing editorial rule in
  `publicContent.ts`]); the artwork wall as a separate section (its function is absorbed — each era lists its own
  releases [INTERP]); the photo-stories block (visual content — moves to `/visuals` [INTERP]); booking service
  rows (EPK's job).
- **Links out (intent):** era releases → `/music/:slug`; `/music`; `/visuals`.

### `/about` — About
- **FOR:** say who the artist is — the person behind the name, in the artist's own words where they exist.
- **Visitor can:** read the short bio, the full biography (the single copy on the site), the artist statement
  (or an honest fallback); see identity facts (based, alias, since) and the official portrait.
- **MUST NOT contain:** release lists or catalog rails; the journey timeline (one outbound link instead);
  services, pricing, or booking forms (EPK's job); unverified statistics [FACT: legacy stats were deliberately
  not migrated — `legacy-content-migration-audit.md`].
- **Links out (intent):** `/music`; `/universe`; `/epk`; `/live`.

### `/epk` — Press & Booking
- **FOR:** let a promoter, editor, or playlist curator do their job in under 60 seconds.
- **Visitor can:** read the fact sheet (bio snapshot, genres, based, alias, contact) in the first viewport; see
  the working formats (remix / arrangement / collaboration / licensing) as routable rows; open or request every
  officially existing asset; get booking and press contact routes; hear the selected releases.
- **MUST NOT contain:** asset rows for files that do not exist (already enforced [FACT: `cmsAssets` filter]);
  fan-oriented content; a second full catalog.
- **Links out (intent):** `/inquire?type=booking|remix`; press email (mailto); platform links; `/music`.

### `/inquire` — Inquiry
- **FOR:** be the single low-friction form for every professional request, pre-aimed by the page that sent the
  visitor.
- **Visitor can:** pick/keep the inquiry type (booking, remix, collaboration, licensing); see the "before
  sending" checklist; fill the form; fall back to direct email.
- **MUST NOT contain:** marketing copy; multiple forms; promises of response times (the current "Akan ditinjau"
  status line is the correct ceiling [FACT]).
- **Links out (intent):** direct email (mailto) as the always-available fallback.

### `/licensing` — Licensing
- **FOR:** be the honest clearance document — what using the music requires, in one screen.
- **Visitor can:** understand the usage routes (content / event / commercial / clearance-first); copy the
  "what to include" checklist; start the pre-filled licensing inquiry; email directly.
- **MUST NOT contain:** duplicated CTA panels beyond one exit block [FACT: current page has hero CTA + a second
  CtaPanel]; pricing (none exists to state [INTERP: don't invent terms]).
- **Links out (intent):** `/inquire?type=licensing&source=licensing`; mailto; `/music` (secondary: hear the
  catalog).

### `/game/jedag-run` — JEDAG RUN
- **FOR:** be the playable signature — the "jedag jedug" genre as an interactive object.
- **Visitor can:** play; save a name; see the global leaderboard; share a score.
- **MUST NOT contain:** release marketing inside the game shell (a single back-link to the site is enough).
- **Links out (intent):** back to home.

### `/privacy`, `/404`
- **FOR:** policy, honestly written (short version + sections [FACT: `CmsLegalSection`]); and a branded 404 that
  gets the visitor back to home/music. No further contract.

---

## 4. MUSIC EXPERIENCE — IA

*Music is central. This section is the listening flow; no visual decisions.*

**4.1 Browsing the catalog**
- The catalog is one ordered list, split into **two labeled groups by artist name**:
  1. **SEBAGAI AKBAR NAWASUNDA** — the four originals [FACT: `cat: "originals"`].
  2. **SEBAGAI DJ AKBAR REMIX** — the four remixes/bootlegs [FACT: `cat: "remixes"`].
  Within each group: newest first (chronology is the secondary order; dates exist for all 8 [FACT]).
- Every entry is one row: artwork, title, year, format, **rights chip** (CATALOG ENTRY / REMIX / UNOFFICIAL
  EDIT), primary platform. The row links to `/music/:slug`.
- **No filters, no facets, no pagination** — 8 entries; the two-name grouping *is* the taxonomy, and it is the
  structure a generic electronic-artist template would not have [INTERP from FACT 2].
- On mobile the groups render as a plain vertical list (a swipe rail hiding 7 of 8 entries from the viewport is a
  discoverability failure, not a design) [INTERP].

**4.2 Playing / listening**
- **Primary path (on-site):** the **global persistent player** — it must be extended from "current release only"
  [FACT: `GlobalAudioPlayer.tsx` hardwires `cmsCurrentRelease`] to **any catalog entry with an embeddable
  source** (SoundCloud/YouTube). Play is initiated from any row or the home release document; the player follows
  the visitor across routes (existing behaviour [FACT]); no autoplay, ever (existing rule [FACT: player comment]).
- **Primary path (off-site, always available):** each row's official platform link. The on-site player is a
  convenience, never a gate — the current fallback copy already says this [FACT: `playerFallback`].
- **On home:** the latest-release document keeps its inline "Putar di sini" embed [FACT: current home slot] —
  the fastest possible first-listen, which is the homepage's core job.
- Listening state is session-scoped (existing behaviour [FACT: `sessionStorage`]) — kept.

**4.3 Separation of releases / remixes / collabs / archive**
- **Releases vs remixes:** the two-name groups (4.1). This replaces the current implicit `format`-based mixing.
- **Collaborations:** no collab releases exist in the catalog yet [FACT: none of the 8 is a collab credit]; the
  `Garam dan Madu × Backpacker` video is the only collab artifact and it lives in `/visuals` [FACT]. No collab
  section is invented.
- **Archive:** there is no separate "archive" tier — **the catalog is the archive** (all 8 entries, none
  hidden). The word "ARSIP" is retired as a nav label and given to the journey page's *story* (eras) instead,
  where "archive" is truthful [INTERP].

**4.4 Where external platforms sit**
- Per-row platform links (the real destination for listening) — first-class, never demoted.
- A **compact channel index** (10 official channels, one list) sits **below** the catalog — it answers "where do
  I follow this?" not "how do I browse?" [INTERP: demoted from a mid-page section to a reference block].
- The global player uses the official SoundCloud embed (existing [FACT]).
- The "Rilisan ini juga tersedia di Spotify" claim band is **removed** (unverifiable per-release claim
  [FACT: copy] / [INTERP: the channel index replaces it truthfully]).

**4.5 Section order, top to bottom (`/music`)**
1. **Opening** — one line of what this catalog is (two names · N works · 2020–now, computed [FACT: counts are
   derivable]), the latest release's artwork as the subject, actions: *Dengar rilisan terbaru* (external) +
   *Buka detail* (→ `/music/:slug`).
2. **The catalog** — the two named groups, all entries (the page's main event).
3. **Channel index** — 10 official channels, one list.
4. **One CTA panel** — *Lisensi musik* (→ `/licensing`) + *Minta remix* (→ `/inquire?type=remix`).

Removed vs today: the standalone "Dengar langsung" two-player section (superseded by per-row play + global
player), the Spotify claim band. Kept: opening, release-note concept (moves onto the release document page, where
it belongs), channel list, CTA panel.

---

## 5. HOMEPAGE — IA

**Purpose (one line):** identity first, then the music, then what's changing — in that order, with zero required
reading.

**Vertical order of top-level slots** (numbered = scroll order):

| Slot | Purpose (one line) |
|---|---|
| 1. **Identity scene** (hero) | The artist as a person: official portrait, name, one-line who, primary action *Dengar* (current release) + secondary *Lihat visual*; fact strip: based / since / genre. |
| 2. **Identity stage** (signature wordmark surface) | The name, and the aka line ("Juga dikenal sebagai DJ Akbar Remix") — identity only; **the era-timeline content currently rendered here is removed** (its home is `/universe`) [FACT: `SignatureStage` renders journey eras on home today]. |
| 3. **Signal board** — "Yang sedang berjalan" | The status document: 01 latest release → `/music/:slug`; 02 next live date **or** booking status → `/live` / `/inquire`; 03 studio → `/inquire?type=remix`. |
| 4. **Latest release document** | One release, whole: artwork, one story line, *Putar di sini* (inline), *Buka rilisan* (external), detail link. |
| 5. **Channel index** | 10 official channels as a list + *Buka katalog musik* → `/music`. |
| 6. **Playable signature** | JEDAG RUN teaser → `/game/jedag-run`. |
| 7. **Booking CTA** | One panel: *Ajukan booking* → `/inquire?type=booking` + *Lihat EPK* → `/epk`. |
| 8. **Fan Signal** | Email capture — single owner of the form on the whole site [FACT: existing rule]. |

**What the visitor understands within 5 seconds** [INTERP]: "A person (face) named Akbar Nawasunda, from
Bandung Barat, since 2020 — and his newest release can be played right here." Name, face, place, music: no
paragraph required.

**What a returning visitor discovers that a first-timer does not** (structure, not visuals): slot 3 is the
delta — row 01 changes when a new release is published, row 02 flips from booking status to the next date when
CMS events appear (the flip logic already exists [FACT: `featuredEvent ? … : …`]); slot 4 swaps to the new
current release; the game slot carries a personal best + leaderboard [FACT: `gameLeaderboard`]; slot 8 remembers
the subscribed state. A returning visit reads as "what changed since last time", not "the same page again".

**Kept from the current homepage (genuinely valuable, not redesign-for-redesign's-sake):** the hero portrait
scene, the signal board, the latest-release document with inline player, the channel list, the game teaser, the
single booking panel, the single fan-signal form.

---

## 6. FIRST-VISIT vs RETURNING

Expressed in structure:

- **First visit (unknown artist):** the path is Home → (play, 1 tap) → `/music` (all 8 works in two honest
  groups) → `/universe` (the two-name story: who he was at 2020 vs now) → `/epk`/`/inquire` only if the visitor is
  professional. The sitemap is legible as a story: **who (hero) → what (music) → when (journey) → who/what
  exactly (visuals) → work with me (epk/inquire)**.
- **Return visit (fan or follower):** Home slot 3 (signal board) is the change detector; `/music` order shifts
  when a new entry lands in the first group; `/universe` gains a new era when the artist crosses into one
  (the CMS journey milestones support this [FACT: `CmsJourney.milestones`]); `/game/jedag-run` holds a saved
  score and board position [FACT: localStorage + leaderboard table].
- **Structural difference:** first visits consume pages top-down (identity → catalog → story); returns consume
  **status** (home signal board first, then the one row that changed). No separate "updates" route is invented —
  the signal board *is* the update surface [INTERP].
- **Professional return visit (promoter/editor):** `/epk` is re-visited, not home: fact sheet → assets → contact
  in under a minute, without touching fan content (the contract in §3 enforces this separation).

---

## 7. MOBILE IA

*Decision at the IA level only: what must be reachable, how many items, what is nested. No visual layout.*

**Primary navigation decision (mobile — decided separately from desktop):**
- Header (always visible): **logo → Home**, **"Dengarkan" → /music**, **menu button**.
- Drawer: **one flat list, 6 items, no nesting**: `Musik · Visual · Perjalanan · Tentang · EPK · Kontak`, in that
  order (music first — the core purpose; contact last — the professional exit). Descriptions per item stay
  (they disambiguate; existing pattern [FACT: `defaultIdNavItems`]).
- Language toggle stays in the drawer footer (existing [FACT]).
- **Reachable without opening the menu:** Home (logo), Musik (Dengarkan CTA), and every in-page action
  (play, booking CTA, channel links, email). `/live`, the game, and `/privacy` live in the **footer** of every
  page (footer is one scroll away, always present) — `/live` is deliberately *not* in the drawer while the
  calendar is empty (row 6, §2); it returns to the drawer when a confirmed event exists, replacing no item
  (7th row, appended).
- This inverts the desktop decision on purpose: on desktop 6 inline links fit; on mobile the two *actions*
  (home, listen) are promoted into the always-visible header because mobile visitors are primarily there to
  **hear** the music, and the menu hides everything else one tap behind [INTERP].

**Vertical order — home (mobile):** 1 identity (portrait + name + Dengar) → 2 signal board → **3 latest release
+ play (promoted before channels on mobile: the music is the core purpose and must appear with less scrolling)**
→ 4 channel index → 5 game teaser → 6 booking CTA → 7 fan signal. (Desktop order is the same except the latest
release document and channels keep their desktop positions — on mobile the play slot moves up.)

**Vertical order — music (mobile):** opening + latest artwork + *dengar* → **catalog as two labeled vertical
groups, full-width rows** (artwork + title + rights chip + platform; no swipe rail) → channel index → CTA panel.

**What must be reachable without opening a menu (mobile, restated):** play the current release (header CTA and
home slot 3), any channel (in-page lists), direct email (in-page CTAs), home (logo), language switch (drawer,
one tap), and the footer set: Jadwal, JEDAG RUN, Privacy, platform list, EPK.

---

## 8. ACCESSIBILITY READINESS

*Structure that makes accessibility possible. No colors, focus styles, or ARIA implementation here.*

**Planned H1 per route** (single clear concept each):

| Route | H1 |
|---|---|
| `/` | "Akbar Nawasunda." (the name — identity page) |
| `/music` | "Musik." / "Music." |
| `/music/:slug` | The release title |
| `/visuals` | "Video & potret." / "Video & portraits." |
| `/live` | "Jadwal & panggung." (stable across empty/populated states — today the H1 "Booking & panggung." tilts toward booking [FACT]; the dates-first framing keeps the H1 honest when dates exist) |
| `/universe` | "Perjalanan Akbar Nawasunda." (kept — already the page's H1 [FACT]) |
| `/about` | "Akbar Nawasunda." (kicker carries "Profil artis" — H1 = the person) |
| `/epk` | "Press & booking." (purpose-first; the name is already the persistent header brand — today the H1 repeats the name and the kicker carries the purpose [FACT: `PressKit.tsx`]) |
| `/inquire` | Type-specific: "Booking inquiry." / "Remix inquiry." / "Kolaborasi." / "Music licensing." (the H1 follows the `?type=` state — one concept per rendered state) |
| `/licensing` | "Lisensi musik." / "Music licensing." |
| `/game/jedag-run` | "JEDAG RUN" |
| `/privacy` | "Kebijakan privasi." / "Privacy policy." |
| `/404` | "404 — halaman tidak ditemukan." |

**Heading hierarchy sketch** (H1 → H2s, in page order):
- `/`: H1 name → H2 "Yang sedang berjalan." → H2 (release title) → H2 channel heading → H2 game → H2 booking → H2 fan signal.
- `/music`: H1 Musik → H2 (each group: "Sebagai Akbar Nawasunda" / "Sebagai DJ Akbar Remix") → H2 channel heading → H2 CTA. Release rows are list items, not headings (avoid 8 H2/H3s competing with the groups).
- `/music/:slug`: H1 title → H2 "Catatan & kredit" → H2 "Dengar & pakai."
- `/visuals`: H1 → H2 "Tayangan resmi." → H2 "Arsip visual." → H2 "Studi potret." → H2 CTA.
- `/universe`: H1 → H2 (era timeline heading "Satu nama, banyak babak." — kept [FACT: current copy]) → H2 "Dari studio." (if kept) → H2 routes/exit index.
- `/about`: H1 → H2 "Perjalanan musik." (bio) → H2 path heading.
- `/live`: H1 → H2 "Show berikutnya" / empty-state heading → H2 "Jadwal terkonfirmasi." (when populated).
- `/epk`: H1 → H2 "Tentang …" → H2 assets → H2 releases → H2 "Kontak proyek." → H2 platforms.
- `/inquire`: H1 (type) → H2 context/checklist (aside) → form fieldset legends (Tentang kamu / Rencana / Brief) as H2s.
- `/licensing`: H1 → H2 "Jalur penggunaan." → H2 "Yang perlu disertakan."

**Link-label risks identified** (to be resolved in Phase 5):
1. **Signal-board action buttons** ("DETAIL", "AJUKAN", "KIRIM BRIEF") are context-free: the row's value text is
   not the link, so an assistive-technology user hears "DETAIL" with no subject. The row title must carry the
   destination (accessible name = title), or the buttons need title-bearing labels [FACT: `Home.tsx`
   `currentSignalRows`].
2. **"Buka rilisan"** (home release document, external) — must name the release in its accessible label [FACT].
3. **Mobile drawer "KABAR TERBARU" → `#signal`** is a dead link on every page except home, and `#signal` on
   home points to the signal board, not the fan-signal form (`#fan-signal`) [FACT: `MobileNav.tsx` `signalHref`,
   `Home.tsx` anchors]. The label and the target must be reconciled (either route it to `/#signal` or relabel).
4. **EN "Archive" link** points to the ID URL `/universe` from the EN chrome and EN drawer [FACT] — a
   language-pairing failure for keyboard/AT users as much as a bug.
5. **Numeric index spans** ("01", "02" …) are already `aria-hidden` [FACT] — keep that pattern everywhere an
   ordinal is decorative.
6. Channel rows already carry "Buka Akbar Nawasunda di {platform}" [FACT] — keep as the template for all
   external links (never "open" / "link" / "more").
7. Nav is a flat tree of ≤7 links in header + drawer with a single skip link (existing [FACT: `an-skip-link`]) —
   keep the keyboard tree flat; no nested disclosure menus introduced by this IA.

---

## 9. KEEP / REMOVE / RESTRUCTURE SUMMARY

**The five most consequential structural decisions:**

1. **`/visuals/portraits` dies; its experience lives inside `/visuals`.**
   Two or three portrait studies do not justify a route [FACT: content volume]; a route costs nav space, sitemap
   space, and an EN-mirror surface for an empty shell. The lightbox, the "frame by frame" concept, and the
   gallery-analytics hook all survive as an in-page section [FACT: components exist and are reusable]. 301 keeps
   every existing URL alive.
2. **`/universe` is relabeled PERJALANAN and rebuilt around the era timeline — the two-name story becomes the
   site's spine.** The DJ Akbar Remix → Akbar Nawasunda arc is the single most artist-specific asset in the
   system [FACT: journey data, `cat` split, alias]. It currently sits on a route whose name no longer means what
   the page is, diluted by a duplicated long bio, an artwork wall, and photo stories. After this decision the
   page has one job: eras, each era listing its own releases (which absorbs the artwork wall's function and gives
   the catalog its context). The long bio returns to `/about`-only ownership [FACT: existing rule].
3. **`/live` is stripped to dates-only and leaves the primary nav while the calendar is empty.**
   Today, with zero confirmed events [FACT], the page is a second booking form wearing a schedule costume,
   competing with EPK and `/inquire` for the same job. A nav item that promises "Jadwal" and delivers no dates
   erodes the site's core credibility trait — honest states [FACT: empty-state copy is already the best part of
   the page]. The content-driven rule: the first CMS event publication restores the nav slot automatically;
   the home signal-board row already flips to "LIVE BERIKUTNYA" on its own [FACT: existing conditional].
4. **The music page becomes the catalog, organised by the two names, with listening attached to every row.**
   The current page buries 8 entries behind a hero, a note section, a channel section, and two fixed players
   [FACT: `Music.tsx` order]. The two-name grouping uses data that already exists [FACT: `cat` field] and is the
   structural fact a template site would never produce. Extending the global player from one hardwired track to
   any embeddable catalog entry [FACT: current limitation] turns "browse" and "listen" into one continuous
   action instead of two disconnected sections.
5. **The homepage keeps almost everything it has — and loses only the duplicated journey.**
   The hero, signal board, release document, channels, game teaser, booking panel, and single fan-signal form are
   each doing a job no other page does [FACT: contracts in §3]; the redesign impulse to rebuild the hero is
   rejected. The one structural removal is the era timeline from the signature stage [FACT: it renders on home
   today], because duplication of the site's spine weakens the spine's page. Home becomes a **status document**
   (what is true right now) rather than a **showcase** (everything, again).

**Identity self-test (the Phase 3 application of the final principle):**
Strip the name, logo, and labels from the resulting sitemap. What remains: a catalog **split by two artist
names with per-entry rights vocabulary** (CATALOG ENTRY / REMIX · CLEARANCE / UNOFFICIAL EDIT · CLEARANCE);
a **playable genre object** (JEDAG RUN); an **era timeline organised around an alias change** (2020 → now);
a **Bahasa-Indonesia-first site with Javanese/Minang/dangdut release titles** mirrored to `/en`; a
**city-addressed, birthday-aware** home (Bandung Barat, WIB clock, 1 November mode [FACT: `BirthdayMode`]).
A generic electronic-artist template contains none of these five as *structure* — they are content-derived
skeletons, not decoration. The sitemap would not belong to any other artist. [INTERP — applied to
FACT-derived structure]

---

## 10. OPEN RISKS & UNKNOWNS

**R1 — The Phase 2 Creative Direction document is not present in this repository.** [FACT: no such document in
`docs/` or anywhere in the tree.] This IA was derived from the carried Phase 1/2 context (mission, decision
priority, the explicit "not cool/premium/futuristic" constraint), the repository's documented direction
(`design-language.md`, the redesign execution plan), and the content facts above. **If Phase 2 prescribed a
different organizing principle (e.g., the site ordered by eras, or by release), the route decisions in §1–§2 must
be re-checked against it before Phase 4.** Nothing in this document silently overrides Phase 2; it assumes
Phase 2's direction is *content-derived and identity-first*, consistent with the carried context.

**R2 — Two different "current releases" are live at once.** The hero CTA points to *Ngertenono Ati Medium Hall*
while the release document, signal board, and global player use *Masih Mencintainya — Papinka* (`isCurrent`)
[FACT: live fetch + code]. Before Phase 5, one CMS field must be the single source of "the current release" and
the hero CTA must consume it. This is a governance decision, not a design one.

**R3 — EN mirror bugs.** EN "Archive" link → ID URL in two places [FACT: `EnglishChrome.tsx`, `MobileNav.tsx`].
Also the EN route set is otherwise complete; any new section added to an ID page in Phase 5 must land in the EN
view in the same commit (the `*View({ locale })` pattern already enforces this [FACT]).

**R4 — The catalog has no stories or credits.** All 8 entries fall back to "check the platform" copy [FACT:
`storyFallback`, `creditsFallback`]; only the CMS `isCurrent` entry has a story field populated. "Music should
feel important" (active constraint) is at risk at the content level: the IA can only carry what is written.
Minimum before Phase 5: story + credits for the current release; ideal: one line of context per entry.

**R5 — No confirmed events.** `/live`'s value is deferred by reality, not by design [FACT: zero upcoming events,
placeholders filtered]. The nav-restoration rule (§2 row 6) depends on CMS `event` records with real dates;
if events remain unconfirmed, the nav stays 6 items. Verify with the artist whether any date can be published
before Phase 4.

**R6 — The sitemap is a static file.** [FACT: `client/public/sitemap.xml` is hand-maintained; `api/ssr.js` does
not generate it.] CMS-published releases will get `/music/:slug` pages (route exists [FACT]) but no sitemap
entries until the file is regenerated. Decide in Phase 5: server-side sitemap generation vs. documented
re-generation step.

**R7 — Inquiry source tracking is broken by design.** The DB enum is `epk | release | universe | licensing`
[FACT: `artistInquiries.source`] but pages send `source=home`, `source=music`, `source=visuals`,
`source=archive` — anything off-enum silently falls back to `epk` [FACT: `Inquiry.tsx` `validSources`]. The
"where did this inquiry come from" operation (and any future per-release conversion reasoning) is currently
unreliable. Phase 5 must widen the enum or standardize the sources.

**R8 — Fan Signal captures but does not send.** The form stores emails [FACT: `fanSignals` table,
`newsletter` flow] with no delivery/automation behind it [FACT: `official-artist-site-audit.md` §2.4]. The home
slot is kept (it is the only owner of the form and the only "come back next time" hook the structure has), but
the copy promise ("rilisan baru … langsung ke email") outruns the system. Phase 5 must either wire delivery or
soften the copy. IA is unaffected.

**R9 — Two CMS systems exist.** The public pages are wired to the tRPC/Drizzle studio [FACT:
`usePublicArtistContent`], while a Sanity studio with a parallel schema ships in `cms/sanity-studio` [FACT:
`sanity.config.ts` document types mirror the same content]. Which is the source of truth for Phase 5 editing
(especially per-release story/credits and the journey milestones) must be decided before implementation; the IA
assumes *one* content store per page as described in the contracts.

**R10 — `/legacy/*` pages are still served.** [FACT: `client/public/legacy/*` exists, robots allows `/`, they
appear in neither the sitemap nor any nav.] They are unreachable from the new site except by direct URL. Phase 5
decision: keep (harmless) or remove; this IA treats them as out of scope.

**To verify before Phase 4:** R1 (Phase 2 document availability), R2 (current-release ownership), R4 (release
story content), R5 (publishable event), R9 (CMS source of truth). The rest are Phase 5 work items with no
structural impact.

---

*End of Phase 3. No routes were invented; no content was fabricated; every "must not" is either an existing
codified rule [FACT] or an interpretation of it. Stopping here — awaiting instruction for Phase 4.*
