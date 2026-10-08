# Desktop Visual QA + Cursor System Pass — Diagnosis

**Date:** 8 Oktober 2026 · **Branch:** `arena/8751ebb7-akbar-next` · **Status:** diagnosis before edits (do not merge)

This document records what the inspection found, measured with the real brand
fonts (`fontkit` + the shipped woff2 files), before any CSS was changed. The
attached screenshots were treated as evidence of symptoms; every fix below is
grounded in the actual implementation.

---

## 0. Method and limits

- No browser is installable in this sandbox (no system chromium, apt and
  playwright CDN blocked, no X libraries for a bundled chromium). Visual QA
  was therefore done by: SSR HTML inspection of every public route against the
  dev server, CSS cascade analysis, and **numeric layout simulation using the
  real woff2 font metrics** for every space-critical claim (header budget,
  email width vs. its column).
- Every measurement below uses the actual shipped fonts (Recons, NEXROID,
  Good Times) at the actual computed sizes, including letter-spacing.

---

## 1. Desktop header / navigation — measured collision

**Finding: the single-row masthead does not fit at any common desktop width.**
Measured worst case (ID locale, 7 nav items incl. JADWAL, full clock with
date, tagline in the wordmark, current EditorialRefresh type):

| Viewport | Space needed by current row | Overflow |
|---|---|---|
| 1440px | ~1693px | **+253px** |
| 1366px | ~1669px | **+303px** |
| 1280px | ~1641px | **+361px** |
| 1180px | ~1608px | **+428px** |

The grid track for nav is `minmax(0, 1fr)` with `justify-self: end`, so the
nav's nowrap flex items overflow their track and paint over the neighbouring
zones — exactly the reported "identity competes with VISUAL / PERJALANAN /
TENTANG / EPK / KONTAK" collision.

Contributing causes, in order of size:

1. **EditorialRefresh inflated nav labels to `0.82rem` Good Times** (sentence
   scale). Navigation is a UTILITY/METADATA role; the base chrome shipped it
   at `0.62rem` tracked uppercase. This is a hierarchy regression, not just a
   width problem.
2. **The wordmark tagline** (`PRODUCER · REMIXER · BANDUNG BARAT`) sits at
   `0.5rem` (8px — below comfortable metadata size, and explicitly listed as
   the one allowed exception in `server/typographyFloor.test.ts`, with the
   comment "kalau navigasi dirapikan nanti, hapus baris ini"). It costs ~146px
   of bar width and is unreadable at that size.
3. **The header clock renders the full date** ("Kamis, 8 Oktober 2026 ·
   03.12.16" ≈ 266px). The full date+time already lives in the footer.
4. **A wasted 4th grid track**: `auto minmax(0,1fr) auto auto` reserves a
   track + gap for the (desktop-hidden) menu toggle (~36px at 1440).
5. **The birthday chip** (~242px, 1 November only) cannot fit the measured
   row at any common width — at 1440 the row already needs 1332px, the chip
   would push it to ~1594px. It also sat at 9px, below the metadata voice.

**Fix (information architecture, not font shrinking):**

- Zones stay `IDENTITY → NAVIGATION → STATUS/UTILITY → PRIMARY CTA`, one row.
- Identity = logo + `Akbar Nawasunda`. The artist descriptor leaves the bar
  (it stays prominent in the footer brand block, the home hero copy, and the
  splash) — it was unreadable at 8px in the bar anyway.
- The birthday chip leaves the **masthead** (measured: no width fits it); the
  celebration keeps its other homes — hero note, header/footer rule accents,
  gold clock pulse, splash — and the chip itself stays in the footer, where
  the brand row is full-width.
- Nav labels return to the metadata voice: `0.66rem`, uppercase, `0.12em`
  tracking (between the system's `.an-meta` 0.58rem and body 0.9rem).
- Status = studio clock in **time-only** mode in the bar (`03.12.16` + live
  pulse ≈ 71px); full date+time stays in the footer.
- 3-track grid on desktop (no wasted gap).
- Deliberate degradation ladder (measured, worst case = 7 nav items):
  - **≥1360px** — identity | nav | clock(time) | language | CTA
  - **1240–1359px** — clock yields (lives in footer): identity | nav | language | CTA
  - **1081–1239px** — language yields (lives in footer bottom + drawer): identity | nav | CTA
  - **≤1080px** — existing drawer mode (unchanged; matches `--bp-lg`)
- No font is shrunk to make things fit; the ladder removes whole information
  zones that have a designed home elsewhere.

---

## 2. Typography / information density

- **Too large:** nav labels at 0.82rem (fixed above); `.an-page-hero-copy h1`
  (Licensing) at `clamp(2.5rem, 5.6vw, 5rem)` and `.an-rel-hero-copy h1`
  (ReleaseDetail, long release titles) at `clamp(2.2rem, 5.4vw, 4.6rem)` — both
  above the site's own `--display-route` register that every other page hero
  uses. Normalized to `var(--display-route)`.
- The `clamp(3.6rem, 8vw, 7.8rem)` H1 rules in EditorialRefresh target
  `.nf-page-hero` / `.nf-epk-hero`, which **no route renders anymore** (dead
  legacy from before the stage redesign) — not the live cause, left in place.
- **Too small:** ~24 declarations at `0.5–0.52rem` (8–8.3px) across public
  surfaces (EPK sheet labels, facts labels, release meta, signature rail,
  footer column labels, drawer meta, shell hint). The system's own metadata
  voice is `.an-meta` at `0.58rem`. Raised all public `0.5/0.52rem` metadata to
  `0.58rem` — a role-based floor, not a global change.
- Local fonts (Recons / NEXROID / Good Times / Towards / Noto Sans Sundanese)
  untouched.

---

## 3. Long text / email / URL behavior — root cause found

`akbarnawasunda@gmail.com` at its rendered size (0.92rem Good Times) is
**302.8px** wide. The EPK fact-sheet `dd` column measures:

| Viewport | dd column | Overflow |
|---|---|---|
| 1440px | 299px | **+4px** |
| 1366px | 282px | **+21px** |
| 1280px | 263px | **+40px** |
| 1180px | 242px | **+61px** |
| 1100px | 225px | **+78px** |
| 1025px | 209px | **+94px** |

**Root cause:** `client/src/index.css` sets `a, button, label { overflow-wrap:
normal }`. The email renders inside an `<a>`, so the `anywhere` policy on the
`dd` is overridden on the link itself — the 303px token cannot break and
overflows the sheet. Same mechanism breaks **long release titles**: the catalog
card title is `<strong>` directly inside the card `<a>` (`.an-release-meta
strong`, no wrap policy) → inherits `normal` → overflows the rail card.

**Fix (system level):**

1. Anchors inherit their container's wrap policy (drop `a` from the global
   `normal` rule; `button`/`label` keep it so button labels never break).
2. Explicit `overflow-wrap: anywhere` on the long-token link primitives:
   `.an-press-sheet-facts dd a`, `.an-facts dd a` (`.an-inq-email` already has
   it).
3. Intentional break points: the displayed emails get a `<wbr>` after `@` so a
   wrap lands as `akbarnawasunda@` / `gmail.com`, never mid-token when avoidable.
4. The EPK contact row spans the full sheet width (contact is the key fact;
   it then fits on one line down to ~370px viewports).
5. `overflow-wrap: break-word` on row/card title primitives (release titles,
   artist names, event names) so multi-word titles wrap instead of overflowing.

---

## 4. Vertical rhythm — accidental dead space found

Every inner-page stage hero pads its top with
`calc(var(--chrome-h, 78px) + var(--space-xl))`. The masthead is
`position: sticky` — **in flow** — so on inner pages the 78px masthead offset
is double-counted: ~78px of leftover dark space between the bar and the hero
on Music, Visuals, Universe (archive), About, Live, ReleaseDetail, EPK,
Inquiry, Licensing, and the release-missing page. (The home hero is the only
one that needs the offset: it pulls itself under the transparent bar with
`margin-top: calc(var(--chrome-h) * -1)`.)

**Fix:** drop the `var(--chrome-h)` term from the top padding of all stage
heroes; keep `var(--space-xl)` as the deliberate pause below the bar. The home
hero keeps its (correct) negative-margin pattern. Deliberate silences
(`.an-pause` breaths, photo-led hero space, footer air) are untouched.

---

## 5. Cursor system — integration (the "ghost cursor")

- `CursorSignal.tsx` sets `document.documentElement.dataset.signatureCursor =
  "on"` when active, but **no CSS ever consumes that attribute** and no
  `cursor: none` exists on public surfaces → the native OS arrow and the
  custom dot+mascot render together. The custom layer reads as "a visual
  element following the mouse", not an extension of the pointer. **Fix:** when
  the signature cursor is confirmed running (attribute set on the first rAF
  tick), hide the native cursor site-wide so the 5px signal dot *is* the
  pointer; the mascot remains the authored companion at a fixed offset.
- The dot is already positioned exactly (`translate3d(clientX, clientY)`, no
  interpolation, fixed layer) — correct. The mascot's 0.22 lerp is the
  authored companion delay — kept.
- **Iframe/leave handling:** `pointerSignal.ts` moves the pointer to -9999 on
  `document.pointerleave` (also fired when the pointer enters the SoundCloud
  iframe in the player shelf). The dot jumps off-screen (fine) but the mascot
  *lerps* toward -9999 — a visible swoosh across the page. **Fix:** hide the
  whole layer while `pointerActive` is false, and snap the companion to the
  pointer on re-entry (no fly-in).
- Touch/reduced-motion gating already correct (`enabled = !coarse &&
  !reducedMotion`); native cursor stays in those cases because the attribute
  is never set. JEDAG RUN / studio routes never mount the layer.

## 6. Cursor layering — critical bug, root cause found

Token scale in `index.css` put `--z-cursor: 60` **below** the sticky nav
(90), lightbox (70), signature rail (80), carrier lines (95/120), command
palette (500), route progress (9000) and the mobile drawer (9999) — so the
cursor disappeared behind the header, the rail, the palette, and overlays.

Two architectural defects:

1. **Token order** declared the cursor *under* the interface it must sit above.
2. **Stacking-context isolation:** `.an-public-shell` has `isolation: isolate`,
   and `MobileNav` portals its drawer to `document.body` — *outside* the
   isolated shell. No z-index inside the shell can ever paint above that
   drawer; the cursor layer must live in the **root** stacking context to be
   architecturally capable of staying above the whole public interface.

**Fix (architecture, not a bigger number):**

- Re-declare the token scale with the cursor as the top layer of the public
  UI: `--z-cursor: 10000`, above `--z-overlay: 9999`; only the transient
  splash preloader (999999, outside the app) stays above it.
- Portal `CursorSignal` to `document.body` (root stacking context).
- Replace every hardcoded z-index on public layers with the tokens
  (`--z-overlay`, `--z-nav`, `--z-palette`, `--z-transition`, `--z-player`,
  `--z-lightbox`, `--z-curtain`, `--z-field`, new `--z-rail`, `--z-carrier`,
  `--z-field-transit`) so the scale is single-sourced and auditable.
- `pointer-events: none` on the cursor layer is preserved — hit-testing stays
  with the real DOM.

## 7. Cursor + Liquid Signal relationship

Kept as one language: the dot is the `--acid` signal color, the mascot poses
include the `music` pose over the player (`data-cursor="music"` on the dock),
the `point` pose over the primary CTA, `drag` over the catalog rail. No new
shape, no glow, no trail. The magnetic pull system (`data-signal-magnetic`)
is currently dormant (no element uses it) and stays dormant — no generic
magnetic buttons added.

## 8. Audio dock

Dock is `--z-player: 48`; with the cursor at the top of the scale it can never
sink behind the dock. Body padding-bottom already reserves dock/shelf space
(`html[data-an-player]`), single-player + no-autoplay + inline/dock exclusion
logic untouched.

## 9. Responsive desktop breakpoints

Ladder above covers 1440 / 1366 / 1280 / 1180 / 1024 / 900: the row is measured
to fit (worst case 7 nav items) at every rung with ≥20px slack; 1024 and 900
sit in the deliberate drawer mode. No gradual degradation between 1081 and
1440: exactly two intermediate steps, each removing a zone that has a designed
home elsewhere.

## 10. What is deliberately NOT changed

- Palette, local fonts, Aksara Sunda, photography, Liquid Signal particle
  system, mascot cursor shapes, route personalities, JEDAG RUN, splash,
  single-player behavior, no-autoplay rule, footer structure, `.an-pause`
  silences, home hero composition, Martin Garrix reference stays
  principles-only.
- Dead legacy rules (`.nf-page-hero` 8vw H1, `.an-nav`, `MobileSlideMenu`
  export) left in place — removing them is cleanup, not this pass.

## 11. Verification plan (after edits)

1. `pnpm lint` (tsc), `pnpm test` (347 tests baseline), `pnpm audit:layout`,
   `pnpm build`.
2. SSR-fetch all public routes (ID + EN) and diff structure.
3. Re-run the font-metric simulations: header fits at 1440/1366/1280/1180/
   1100/1081 (worst case 7 items) and the EPK email fits its column everywhere.
4. New source-contract tests guard the cursor layering scale, the portal, the
   pointer-events rule, the native-cursor gate, the anchor wrap policy, and
   the removed masthead double-count.
