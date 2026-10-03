# Phase 5e — Implementation Report: About + Universe (PERJALANAN)

Repo: `akbarnawasunda/akbar-next` · branch `arena/01a0ffb8-akbar-next`
Binding: Phase 2 (creative direction), Phase 3 (IA — `/universe` row 7, `/about` row 8, page contracts §3, H1/H2 sketch §8),
Phase 4 (design system), Phase 5a (shell/tokens/nav/footer), 5b (home), 5c (music), 5d (visuals).

Labels used throughout: **[FACT]** = from the repo/deployed site, **[INTERP]** = derived reading, **[INVENT]** = new idea by the agent.
Design decisions are labelled **[DERIVED]** / **[INVENTED]** / **[CONVENTIONAL]** where Phase 4 asks for it.

Verified in this phase (honest statement): `tsc --noEmit` clean · `vitest run` **311/311 pass** (54 files) ·
`scripts/verify-ssr.sh` **32/32 PASS** · production build clean · **rendered SSR HTML inspected by curl** for
`/about`, `/en/about`, `/universe`, `/en/universe` against the running production dist.
There is **no browser in this sandbox**; anything that only exists after hydration (focus, scroll, sticky
behaviour) is code-verified, not device-verified (§12).

---

## 1. ABOUT — IA REALIZED

**Purpose (Phase 3 §3, `/about`):** say who the artist is — the person behind the name — with the long biography
as the single copy on the site and the artist's own words where they exist. **[FACT: contract text]**

**Desktop structure (top → bottom, in DOM order):**

1. **Hero identity** — official portrait plate (left) + kicker `Profil artis` + **H1 "Akbar Nawasunda."** + short-bio
   lede + identity facts (`Basis / Alias / Mulai`) + actions (`Dengar musik` → `/music`, location link when the
   CMS provides one). **[FACT: SSR]** Heading chain matches Phase 3 §8 exactly: *H1 → H2 "Perjalanan musik." → H2 path heading*.
2. **Biography as a reading page** — sticky aside (meta label) + **H2 "Perjalanan musik."** + the long biography
   (`max-width: var(--container-text, 62ch)`) + artist statement **only if the CMS supplies one**, otherwise the
   honest fallback sentence as a normal paragraph (never styled as a quote) + genre list.
3. **Full-width editorial band** — one portrait, caption with no invented location (§11 D-4).
4. **One outbound line** — `Satu jalur keluar` + one sentence + one link to `/inquire?source=about`
   (Phase 3 row 8: "the service/booking pitch is reduced to one outbound line"). **[FACT]**
5. **Path index** — **H2** + four rows: `/music`, `/universe`, `/epk`, `/live` — exactly the Phase 3 links-out set.

**Mobile structure:** single column; portrait plate 4:3 (≤1024) → 3:4 (≤768); facts in a 2-column grid; the sticky
aside becomes `position: static` so it cannot cover the text; the band keeps a viewport-relative height; the exit
line wraps; every path row is a full-width ≥44 px target. **[FACT: ArchiveStage.css media blocks — contract-tested]**

**What changed vs. the 5a-era page:** the terminal `CtaPanel` (two buttons + its own headline) was removed and
replaced by the single exit line; the path index gained `/universe`; the long-bio measure now uses the Phase 4
token; image captions no longer attach a location to a photo. Nothing else was touched — the hero, bio block,
band, and path rows are the existing (good) work, preserved. **[FACT: diff]**

---

## 2. ABOUT — CONTENT MODEL

**One-sentence defence:** *About is the only page that says who the artist is — one verified biography in one
place, with identity facts, the official portrait, and exactly one professional exit line; everything else the
artist does is routed out to its owner page.* **[DERIVED from Phase 3 §3]**

**A. What it contains (all verified, see §3):** short bio (hero lede) · long bio (the single copy) · identity
facts (based / alias / since) · official portrait + one editorial portrait · genres · one booking exit line ·
four routable exits.

**B. What it omits, and why:**

| Omitted | Why |
|---|---|
| Journey timeline | Explicit owner `/universe`; the page links out instead. **[FACT: Phase 3 §3]** |
| Release list / catalog rail | Owner `/music` (and `/music/:slug`). |
| Services, pricing, booking form | Owner `/epk` + `/inquire` (Phase 3 row 8: reduced to one line). |
| Statistics (streams, listeners, shows) | No verified numbers exist; legacy stats were deliberately not migrated. **[FACT: `legacy-content-migration-audit.md`]** |
| Press quotes / praise | None exist in the repo — omitted entirely, not paraphrased. |
| Birth year, birthplace, education, scene affiliation, influences | Never provided by the artist — "not yet available" is the honest state. |
| Artist statement | Not provided (see C) — an honest fallback sentence replaces it. |

**C. Voice.** Third person, and only from already-verified public copy: `verifiedArtistProfile.shortBio/longBio`
and the CMS profile fields when published. **No sentence is written in the artist's voice**: the statement block
renders `<blockquote>` **only** when `profile.artistStatement` exists in the CMS; today it does not, so the page
shows a plain sentence of fact ("Original work is released as Akbar Nawasunda; the remix catalog is also known
through DJ Akbar Remix") labelled in code as `statementFallback`. **[FACT: About.tsx + SSR — no `<blockquote>` is emitted]**

**D. Structure.** Identity first (portrait + facts), then one uninterrupted reading column, then a visual pause,
then routing. Not a wiki-bio layout: no infobox table, no milestone list, no "read more" — the Phase 2 direction
(réstraint, editorial pacing) is expressed as *hero → read → pause → route*. **[DERIVED]**

**E. Relationship to other pages.** Unique contribution: the long biography and the identity facts. Everything
else is routed: music → `/music`, the two-name story → `/universe`, press/booking → `/epk` + `/inquire`, dates →
`/live`. Nothing on this page duplicates another page's owner content. **[FACT: heading/links audit of the SSR output]**

**F. Language.** Bahasa Indonesia is the authored language; `/en/about` renders the same component (`AboutView locale="en"`)
with the verified EN bio/fallbacks — the CMS profile has no EN fields, so the EN page **never** falls back to
Indonesian text. **[FACT: About.tsx comment + SSR: "The musical journey." on /en/about]**

---

## 3. ABOUT — SOURCE TRACEABILITY

| Claim on the page | Source |
|---|---|
| "Akbar Nawasunda." (H1) | Artist name — everywhere in the repo. |
| "Produser musik, remixer, dan DJ dari Bandung Barat…" (lede) | `verifiedArtistProfile.shortBio` (ID) / `shortBioEn` (EN) **[FACT]** |
| Long biography | `profile.longBio` (CMS) → `verifiedArtistProfile.longBio/longBioEn` **[FACT]** |
| `Basis: Bandung Barat, Indonesia` | `verifiedArtistProfile.location` **[FACT]** |
| `Alias: DJ Akbar Remix` | `verifiedArtistProfile.aliases` **[FACT]** |
| `Mulai: 2020` | Verified bio text ("dimulai pada 2020") + journey milestone 2020 **[FACT]** |
| Genres (Breakbeat, Indo Bass, Jedag Jedug, Jungle Dutch, Kendang Chops) | `verifiedArtistProfile.genres` / CMS `profile.genres` **[FACT]** |
| Official portrait | `profile.portraitImage` (CMS) → `officialBrand.portrait` + `.portraitFallback` **[FACT]** |
| Editorial band portrait | `officialBrand.editorialPortrait` **[FACT]** |
| Inquiry email | `verifiedArtistProfile.bookingEmail` (public today) **[FACT]** |

**Marked as placeholder (not yet provided):** the artist statement. Code path: `statementFallback` (both locales),
commented in `About.tsx`. Nothing else is placeholder — there is no lorem, no "coming soon".

**Sections removed because they would require invention:** none had to be removed for About; the page simply
*stops* where verified material stops (no timeline, no quote, no stats, no influences).

---

## 4. UNIVERSE — STATUS

**Decision implemented (Phase 3 row 7): KEPT + RENAMED (label) + RESTRUCTURED.**
URL `/universe` unchanged (public, bookmarked, `/archive → /universe` 301 preserved) · nav/footer label
`PERJALANAN` (ID) / `JOURNEY` (EN) — already in place from 5a **[FACT: `NightFrequencyChrome.tsx` L28,
`EnglishChrome.tsx` L25]** · route modes unchanged **[FACT: `routeSignal.ts` L28]**.

**IA realized (desktop, DOM order):**

1. **Archive opener** — archive portrait (eager, sized) + kicker `Arsip resmi · 2020—sekarang` +
   **H1 "Perjalanan Akbar Nawasunda."** + two-line lede (the two-name story) + the Phase 3 reading guide from
   the journey intro + facts (`Mulai 2020`, `Basis Bandung Barat`, `Rilisan 8`) + `Telusuri babak` → `#timeline`.
2. **Era timeline — the spine** — **H2 "SATU NAMA, BANYAK BABAK."** + `EraTimeline`: an ordered list where each era
   renders year, title, description **and one representative release that opens its document** (`/music/:slug`),
   plus an artwork panel that swaps with the active era. **[FACT: SSR — 2020 "DJ Akbar Remix" → `/music/masih-mencintainya-papinka`, SEKARANG "Akbar Nawasunda" → `/music/pada-imut-aisyah-tak-belagu`]**
3. **Studio note** — **H2 "Dari studio."** + one editorial portrait + one line + link to `/visuals`
   (Phase 3 §3 explicitly allows this H2 "if kept"; it is the bridge to the visual archive, not a photo block).
4. **Exit index** — **H2 "Lanjut dari sini."** + exactly two rows: `/music`, `/visuals` — the Phase 3 links-out set.

**Mobile:** one column ≤900 px; the artwork panel stops being sticky and moves **above** the era text
(`order: -1`) so a sticky image can never cover the milestone copy; timeline rail/progress only; no horizontal
scroll, no scroll-jacking. **[FACT: `EraTimeline.css` — contract-tested in `archiveStageLayout.test.ts`]**

**Removed (Phase 3 "MUST NOT contain", all evidenced in the diff):**

| Removed | Phase 3 reason |
|---|---|
| "Origin & context" section rendering the long biography | Long biography's single owner is `/about`. **[FACT: `not.toContain("longBio")` asserted]** |
| Artwork wall (6 releases, asymmetric grid) | "its function is absorbed — each era lists its own releases" — now each era links one release document. |
| Photo-stories carousel (`ArtistPhotoStorySection`, deleted component) | "the photo-stories block (visual content — moves to `/visuals`)". Resolves 5d D-1 (§11). |
| Remix/booking service rows | "booking service rows (EPK's job)" — now two exits only. |

**Source traceability:** eras/descriptions ← CMS `journey.milestones` (`titleEn/bodyEn` for EN), fallback
`verifiedJourneyFallback` ("DJ Akbar Remix" 2020 / "Akbar Nawasunda" now) **[FACT]** · facts row ← verified
profile (2020 start, Bandung Barat) + catalog count computed from CMS releases merged with the static catalog
(8 rows, deduplicated by title) **[FACT]** · portraits ← `officialBrand.archivePortrait` / `.editorialPortrait`
**[FACT]** · release links ← catalog titles slugified by the same `slugify` the release route resolves with
**[FACT: `ReleaseDetail.tsx` L105-110]** · studio copy = pre-existing editorial copy describing the actual images
**[INTERP, pre-existing — preserved, not newly authored]**.

---

## 5. UNIVERSE — CONTENT MODEL

**One-sentence definition (the page's only job):**
*Perjalanan tells the two-name story — how DJ Akbar Remix became Akbar Nawasunda — as an era timeline where each
era carries its verified milestone text and one representative release that opens its document.*
**[DERIVED from Phase 3 row 7 + `publicJourney` data]**

**Contains:** journey intro (reading guide) · milestones as eras with one release document each · one studio
visual note linking to `/visuals` · two exits (`/music`, `/visuals`).

**Relationship to music and visuals:** the era→release links are the *only* music content (no catalog rail, no
player duplicate) and they open release **documents**, not external platform links; the studio note links to
`/visuals` without re-hosting visual content. Universe is a **story container, not a catch-all**: it links out
rather than absorbing.

**Failure-mode check — is it "everything that doesn't fit elsewhere"?** No. Three MUST-NOTs are enforced and
**test-locked** in `server/anArchive.test.ts`: no long biography, no photo stories, no artwork wall, no
remix/booking service rows. The page has exactly one subject; anything that is not part of the two-name story
routes to its owner page. **[FACT]**

**era ↔ release pairing (documented limitation):** the CMS has **no era↔release relation** (`CmsJourney` holds
milestones only) **[FACT]**. Each era therefore shows **one representative release**, chosen from the release's own
`format` field — a "…Remix" era gets a Remix/Bootleg release, other eras get an original — newest year first
**[INTERP, documented in `client/src/content/eras.ts`]**. The UI label stays "BUKA RILISAN" (open the release):
it does not claim the release *belongs to* that era.

---

## 6. SIGNATURE EXPRESSION

**Where it appears (both pages) and why it is not decoration:**

- **/about** — route mode `quiet` **[FACT: `routeSignal.ts` L29]**: the signal dot at rest in the kicker, the
  cursor signal, the route curtain sweep, the footer clock; the particle **field yields** (density ×0.35 in quiet
  mode **[FACT: `particleField.ts` L412-421]**). Nothing pulses: nothing on this page carries a live state. The
  biography column is deliberately *outside* the signature's animated layer. **[DERIVED Phase 4 §8 exclusion: forms/professional pages get the point, never the field or pulse]**
- **/universe** — route mode `era` **[FACT]**: the timeline is the one place where the signature *carries
  content* — the rail progress shows where the reader is, the artwork panel shows which era is active, and the
  active era is pushed into the signature runtime (`setEra`) so the ambient field responds. **[FACT: `EraTimeline.tsx` `actions.setEra`]**
  Remove the interaction and the page still works: all era text is in the DOM with JavaScript absent
  **[FACT: `editorialRedesign.test.ts` asserts full text without JS]** — which is what keeps the timeline a
  signature and not a crutch. **[DERIVED Phase 4 §8 "gimmick test"]**
- **Reduced motion** — the timeline's transitions/animations are switched off and the field is off
  **[FACT: `EraTimeline.css` L154-160, `SignatureBackground.css` L41]**. No information is lost: the active era is
  still readable as text.

---

## 7. FILES CHANGED (5e scope)

Added/changed:

| File | Why |
|---|---|
| `client/src/pages/About.tsx` | Terminal CtaPanel → one exit line; `/universe` added to the path index; captions de-located; token measure via CSS. |
| `client/src/pages/Universe.tsx` | Rebuilt to the Phase 3 contract: opener → era timeline → studio note → two exits; removed origin/long-bio, artwork wall, photo stories, service rows. |
| `client/src/content/eras.ts` | Added `releaseSlug` + data-derived era→release pairing (format + newest year), documented as representative. |
| `client/src/components/signature/EraTimeline.tsx` | Era release link now opens the release document (`/music/:slug`), falling back to `/music`. |
| `client/src/pages/ArchiveStage.css` | Pruned dead archive CSS (origin/genres/intro/detail/wall + their media rules, 234 lines net); added the exit-line block; long-bio measure → `--container-text`; reduced-motion block trimmed to the remaining motion. |
| `client/src/pages/ArchiveUpgrade.css` | **Deleted** — only `.an-archive-*` legacy classes, zero consumers (verified by grep). |
| `client/src/components/ArtistEditorialSections.tsx` + `.css` | **Deleted** — the journey/photo-story sections were the duplicates Phase 3 moved; after removal nothing imported them (grep-verified). |
| `client/src/pages/EnglishPages.tsx` | EN home dropped the leftover journey + photo-story sections (5b leftover) and the stale imports they kept alive. |
| `scripts/verify-ssr.sh` | `/live` needle follows the dates-first meta line (see 5f report). |
| `server/anArchive.test.ts` | Contract re-pointed: asserts the timeline spine + the MUST-NOTs (no longBio / photo stories / wall / service rows) and era→document links. |
| `server/archiveStageLayout.test.ts` | Wall-reflow tests replaced by the era-timeline reflow contract; tablet/reduced-motion assertions re-pointed to the sections that still exist. |
| `server/editorialOptimization.test.ts` | Image-markup contracts re-pointed from `/universe` to `/visuals` (the surface that now owns `OptimizedEditorialImage`). |
| `docs/phase5e-about-universe-report.md` | This report. |

Not touched (per brief): shell, nav, footer, tokens, `/visuals`, `/music`, homepage, EPK/Inquiry/Booking
(5f), a11y/perf/SEO pass (5g).

---

## 8. MOBILE VERIFICATION

Everything below is a **CSS/render contract** check (§12 states the browser limit honestly).

- **About reading:** `max-width: var(--container-text, 62ch)` on the long bio, `line-height: 1.9`
  **[FACT: ArchiveStage.css]** — Phase 4's measure/spacing target for long-form text; no fixed-height text
  container, so 200% zoom reflows rather than clips. **[DERIVED]**
- **About hero:** single column at ≤1024 px, portrait plate `aspect-ratio: 4/3` (≤1024) → `3/4` (≤768), facts
  grid 2 columns at ≤768 px; the sticky bio aside is forced `position: static` on tablet so it cannot overlap the
  text. **[FACT: contract-tested]**
- **Portrait band:** height `clamp(300px, 92vw, 440px)` on mobile (viewport-relative, not fixed px); image
  `object-fit: cover` with correct crop anchor. **[FACT: contract-tested]**
- **Universe timeline:** one column ≤900 px, artwork panel `position: static` + `order: -1` (image above text,
  never a sticky overlay); the era list is a normal `<ol>` — no drag, no horizontal scroll, no scroll-jacking.
  **[FACT: contract-tested]** A 320 px viewport can still render the H1 (clamp verified against the longest word
  "NAWASUNDA." with the real gutter arithmetic **[FACT: `archiveStageLayout.test.ts`]**).
- **No horizontal overflow introduced:** the touched CSS has no `overflow-x: hidden/clip`, no `!important`, no
  `100vw`, balanced braces, no `backdrop-filter` **[FACT: contract-tested]**.
- **Touch targets:** path rows are full-width rows (≥44 px); the nav/drawer targets are 5a's (≥52 px). **[FACT]**
- **Reduced motion:** `/about`'s only local motion (path-row hover shift) is disabled; `/universe`'s timeline
  animations are disabled. **[FACT]**

**Deviation from desktop:** none by design — the mobile experience is the same reading order with the sticky
behaviours removed.

---

## 9. ACCESSIBILITY CHECK (ABOUT + UNIVERSE)

- **Single H1 per route:** `/about` → "Akbar Nawasunda."; `/universe` → "Perjalanan Akbar Nawasunda."
  **[FACT: SSR, both locales]**
- **Heading hierarchy = content structure (Phase 3 §8 chain, SSR-verified):**
  - `/about`: H1 → H2 "Perjalanan musik." → H2 "Dengar, telusuri, atau ajak kerja sama."
  - `/universe`: H1 → H2 "SATU NAMA, BANYAK BABAK." → H2 "Dari studio." → H2 "Lanjut dari sini."
  No decorative heading sizes: the exit line is labelled with `aria-label`, not a fake heading.
- **Timeline semantics:** `<ol>`/`<li>` per era; the rail is `aria-hidden`; the artwork panel is an `<aside>`
  with `aria-live="polite"` so the swap is announced without stealing focus. **[FACT: EraTimeline.tsx]**
- **Quotes:** `<blockquote>` is emitted **only** for a real artist statement; today none exists, so no
  pseudo-attribution is present. **[FACT: SSR has no `<blockquote>` on /about]**
- **Images:** every image has a meaningful alt (portrait subject, era artwork); no empty alts on either page
  **[FACT: 0 empty alts in the SSR of /about + /universe, both locales]**. Decorative-only chrome is `aria-hidden`.
- **Link labels:** exits are named by their titles ("Katalog rilisan", "Arsip visual", "Telusuri babak"); no
  "here"/"read more".
- **Reduced motion:** respected on both pages (§6, §8).
- **Contrast:** no new colors; the pages use the existing Phase 4 tokens over `--ink`, whose measured ratios are
  in Phase 4 §11 **[FACT: no hex literals were added — grep-verified]**. Re-measure remains a 5g item on the
  reading column (`--paper` 82% mix).

---

## 10. PERFORMANCE CHECK

- **SSR payload (uncompressed HTML incl. dehydrated state):** `/about` 35.5 kB · `/en/about` 38.1 kB ·
  `/universe` 33.8 kB · `/en/universe` 36.4 kB **[FACT: curl, production dist]**. These are among the lightest
  routes on the site.
- **Images:** /about hero eager + intrinsic 1122×1402; band lazy + 667×1000; /universe opener eager + 800×1000;
  studio note lazy + 667×1000; era artwork lazy + 500×500 (remote thumbnail). Every `<img>` carries
  `width`/`height` → **no CLS from images** **[FACT: SSR audit]**. Below-the-fold images are lazy.
- **JS:** no new dependency, no animation library, no new client fetch. The deleted `ArtistEditorialSections`
  component removed a client-side carousel (`useState`/keyboard handling) from `/universe` entirely.
- **CSS:** net −234 lines in `ArchiveStage.css` and −1,060 lines (`ArtistEditorialSections.css` +
  `ArchiveUpgrade.css`) removed from the bundle **[FACT: diffstat]**.
- **Budget:** text routes stay far below the Phase 4 route-class ceilings (they load no video, no rail of
  artwork, one small remote image at most). **[DERIVED]**
- **No render-blocking JS for text** — the pages are SSR'd HTML hydrated by the shared app; nothing extra is
  requested to read them.

---

## 11. DEVIATIONS FROM PHASE 3 / 4

Every deviation is listed; nothing was silently overridden.

- **D-1 · Photo-stories resolution (supersedes 5d D-1).** 5d's report kept photo stories on `/universe` pending
  5e. Phase 3's `/universe` contract lists them under **MUST NOT contain** ("moves to `/visuals`"). Resolution
  here: the block was **removed from `/universe`**, and — per 5d §14's instruction — **nothing was ported into
  `/visuals`**: the same content already has a home at `/visuals#portraits` (portrait studies, built in 5d).
  Net effect: the portrait data has **one** public surface instead of two. **[FACT: diff + tests]**
- **D-2 · Era releases open documents.** Phase 3 says "open any era's releases into their documents"; the code
  only linked `/music`. Changed: `publicEras()` now emits `releaseSlug` and `EraTimeline` links
  `/music/:slug` (fallback `/music` when a title is missing). No Phase 3/4 conflict. **[INTERP: smallest change]**
- **D-3 · era↔release pairing is representative, not relational.** The CMS has no relation field, so the pairing
  is derived (format + newest year) and labelled in code; the UI does not claim ownership (§5). This is an
  honest stand-in until the artist supplies mappings. **[INVENTED rule, FACT data]**
- **D-4 · Photo captions no longer carry a location.** "Potret editorial · Bandung Barat" and the hero dateline
  became "Potret editorial" / "Potret resmi" / "Arsip visual". The photo session's location is not in the data —
  FACT discipline ("never invent … locations"). The artist's base remains visible in the facts list.
- **D-5 · /about booking pitch reduced to one line + link** (Phase 3 row 8) — removes the old `CtaPanel`
  (headline + 2 buttons) which duplicated `/epk` and `/inquire`. **Path index is `/music`, `/universe`, `/epk`,
  `/live`** — the exact Phase 3 links-out list (this is why `/universe` was added).
- **D-6 · Long-bio measure uses the Phase 4 token** (`--container-text`, 62ch) instead of the local `64ch`.
- **D-7 · EN home leftover (not a Phase 3/4 conflict, documented for transparency).** `/en` still rendered the
  journey + photo-story sections (the ID home lost them in 5b). Since 5e settled ownership of that content, the
  duplicate blocks were removed from `/en` too; the EN home keeps its release document, signal deck, and CTA
  **[FACT: SSR shows `section-current` + `home-signal-deck` + `ed-cta`, no journey/photo markup]**. The
  `/en/universe` and `/en/visuals` pages remain one nav tap away.
- **D-8 · `/universe` SEO title unchanged** ("About the Work | Akbar Nawasunda"). The rename to PERJALANAN was
  applied to nav/footer/H1; the document title is an SEO concern (5g's pass) and is flagged in §13 rather than
  changed here. **[FACT: `App.tsx` idTitles]**

---

## 12. KNOWN LIMITATIONS

1. **No browser in this sandbox.** "Verified" means: rendered SSR HTML + CSS contracts (vitest) + code review +
   32 live HTTP assertions. Focus order, sticky behaviour, scroll performance, and the hydrated timeline swap were
   **not** device-tested; that is 5g's real-browser pass.
2. **The artist statement does not exist.** The About page shows the honest fallback sentence. A real statement
   is an artist input, not something this phase may invent.
3. **Thin journey data.** Two milestones (2020 / now) — the timeline is honest but sparse. Richer eras require
   CMS `journey.milestones`; the page will grow without a code change.
4. **era↔release pairing is representative** (§5/D-3) until a relation exists in the CMS.
5. **`photoStory` has no public surface.** The CMS type and studio editor still exist (the artist can author
   them), but Phase 5 renders portrait studies instead (`/visuals#portraits`). Either the type retires or it
   gains a surface — a Phase 6/artist decision, documented here rather than silently deleted. **[FACT: `customDocumentTypes` still lists `photoStory`]**
6. **Placeholders in code:** `statementFallback` (About, both locales) is the only placeholder; it is a factual
   sentence, not fabricated biography, and is commented in place.

---

## 13. OPEN RISKS FOR 5f–5g

- **5f (already honoured, noted for the record):** the `/visuals` CTA is `/inquire?type=visual&source=visuals` —
  the inquiry page must keep honouring `type=visual` (it maps to *collaboration*; see 5f report §12) and
  `source=visuals` (DB enum limitation, 5f report §13). EPK/Inquiry must not absorb `/universe` content.
- **5g · SEO:** the `/universe` document title still reads "About the Work" while the page is PERJALANAN
  (recommendation: "Perjalanan Akbar Nawasunda …" / "The Journey …"), plus OG images for `/about` and `/universe`.
- **5g · a11y:** real-browser pass on the sticky→static aside, timeline focus order after the artwork `order: -1`
  swap on mobile, and a contrast re-measure of `--paper`-mixed body text on the reading column.
- **5g · perf:** the era artwork is a remote CDN thumbnail (500×500) requested lazily; confirm it is not fetched
  before the timeline enters the viewport in a real browser.
- **Phase 6 · content:** (a) whether the photo-story dataset gets a public surface; (b) whether each era should
  list more than one release (needs a CMS relation); (c) whether `/about` should carry the artist statement as a
  designed quote block once the artist writes one.

---

*End of Phase 5e. 5f follows in its own report (`docs/phase5f-professional-surfaces-report.md`).*
