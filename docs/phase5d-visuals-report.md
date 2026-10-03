# Phase 5d — Visuals · Implementation Report

Date: 2026-10-03 · Built on top of 5a/5b (`68f0535`) · Branch `arena/01a0ffb8-akbar-next`

Scope executed: build `/visuals` per the Phase 3 visual-archive contract (L160–167, L102–103, L392, L407) through the Phase 4 design system. The 5a placeholder strip was replaced; `/visuals/portraits` merged as the in-page `#portraits` section; both 301s verified live. About/Universe/EPK/Inquiry/Booking (5e–5f), shell/nav/footer, and the full a11y/perf/SEO pass (5g) were NOT touched.

Labels: [FACT] = verified in code/rendered output this session · [INTERP] = design interpretation · [INVENT] = deliberately invented. Visual decisions additionally marked DERIVED (from Phase 4 tokens/contracts) / INVENTED / CONVENTIONAL.

---

## 1. VISUALS IA REALIZED

**Desktop (rendered SSR HTML, verified by offsets — `/visuals`, `/en/visuals`):**

1. **Hero** (H1 `Video & potret.` / `Video & portraits.`) — identity, lede, facts strip (Video 3 · Studi potret 2 · Kanal YouTube — all from live data [FACT]), portrait CTA → native `#portraits` anchor
2. **Tayangan resmi.** (H2, `#screening-title`) — official screenings, `OfficialMediaFrame` lazy players
3. **Arsip visual.** (H2, `#archive-title`, `dark-panel`) — `FilterBar` groups + `InteractiveArtworkCard`, dedupes videos already in screening
4. **Studi potret.** (H2, `#portraits-title`, anchor `#portraits`) — **new in-page section**: lead frame + asymmetric grid + in-site lightbox (this report §3–§5)
5. **BIKIN VISUAL BERSAMA.** (H2 CTA panel) — booking CTA → `/inquire?type=visual&source=visuals` + ghost button → `#portraits`

Heading chain = 1×H1 + 4×H2 (CtaPanel title is H2, `ed-cta__title` [FACT EditorialKit L229]) — single-H1 route contract holds. Page order matches Phase 3 L407 exactly: *Tayangan resmi. → Arsip visual. → Studi potret. → CTA* [FACT rendered order].

The three sections are ONE route (Phase 3 L102–103): screening (what was filmed), archive (what is catalogued), portraits (what was photographed). No visual sub-routes remain in the router; `/visuals/portraits` and `/en/visuals/portraits` return **301 → `#portraits`** [FACT curl: `ID: 301 -> /visuals#portraits`, `EN: 301 -> /en/visuals#portraits`]; `sitemap.xml` no longer publishes the old route [FACT test].

**Mobile:** same DOM order, single responsive shell (Phase 3 §7 — mobile IA for /visuals = desktop order). Verified in code: at ≤900px the portrait layout collapses to one column (lead above, grid single-column, asymmetric offset disabled) [FACT CSS]. Header/footer behavior is 5a territory (unchanged).

**Identity test:** strip the logo/name and the page still reads as this artist's world — sepia darkroom register reserved for portrait studies, mono frame indices, "frame by frame" pacing, dust particle field on the route, the same face carrying hero → lightbox. The language (potret sebagai *studi*, bukan etalase) cannot be dropped onto a generic electronic-artist gallery without it losing its point. [INTERP]

---

## 2. FILES CHANGED

| File | Reason (one line) |
|---|---|
| `client/src/components/PortraitStudiesSection.tsx` (new, 203L) | In-page `#portraits` section: lead frame + grid + lightbox wiring + preserved first-party gallery analytics |
| `client/src/components/PortraitStudiesSection.css` (new, 236L) | Sepia darkroom register (Phase 4 `--sepia-*` tokens), lead/grid layout, mobile, reduced-motion |
| `client/src/pages/Visuals.tsx` | Strip → section; section moved after archive (Phase 3 H2 order); hero + CTA portrait links → native `#portraits` anchors |
| `client/src/pages/EnglishPages.tsx` | Dead `VisualPortraitStudies` import removed (EN twin shares `VisualsView` via `locale`) |
| `client/src/components/signature/Lightbox.css` | Lightbox close/prev/next 36px → 44px (Phase 4 §7 minimum touch target; lightbox is now on a public page) |
| `client/src/components/VisualPortraitStudies.tsx` + `.css` (deleted) | 5a placeholder strip superseded by the real section (its sepia register design was carried into the section CSS) |
| `client/src/pages/VisualPortraitGallery.tsx` + `.css` (deleted) | Route gallery superseded by in-page section; its `GalleryContent` logic (lead+grid+lightbox+analytics) absorbed |
| `client/src/pages/PortraitStage.css` (deleted) | Styles for the deleted route gallery only |
| `server/portraitStudies.test.ts` | Merge contract updated to new section file + `href="#portraits"` + alt-fallback chain assertion |
| `server/galleryAnalytics.test.ts` | Visitor-marker assertion re-pointed to `PortraitStudiesSection.tsx` (behavior unchanged) |

Net: **+2 new files, −5 files (−998L), 4 edits.** No shell, nav, footer, token, or route-table changes. `PublicShell`/`LightboxProvider`/`OptimizedEditorialImage` reused as-is.

---

## 3. ORGANIZING PRINCIPLE IMPLEMENTED

**Decision A — axis = MEDIUM (the form of the visual), not time and not project.**

> One sentence: *the page is organized the way Akbar works — by what the material IS: what was filmed (played), what was photographed (studied), what is catalogued (kept) — medium first, meaning after.* [INTERP, the axis]

- Primary axis: medium → 3 sections (screening / portraits / archive), each with one H2.
- Secondary axis: role within the medium — *resmi* (official, in screening) vs *studi* (study, in portraits) vs *arsip* (catalogued, archive). Expressed via the existing `label` field (VIDEO RESMI / STUDI POTRET / …), not new data.
- Relation to music: medium is the visual analog of how the music arrives — video = the music performed, portraits = the face behind it, archive = the catalog. The axis therefore mirrors the music's own structure (release → artist → catalog) without inventing any release/era attribution. [INTERP]

Why not time: no date data exists for any visual [FACT — `CmsPortraitStudy` and `cmsVisuals` carry no published-date field], and Phase 3 bans era/attribute invention. Why not project: would force cross-linking into /music and duplicate the release catalog (Phase 3 MUST NOT: music catalog content on /visuals).

Implementation: section order + per-section copy + label eyebrows. No sort logic invented — sections are static slots; within portraits, data order (CMS order) is preserved (see §7).

---

## 4. VIEWING MODEL IMPLEMENTED

**Decision C — flat, in-page, lightbox-paced.**

- **Structure:** flat single section (no hierarchy, no sub-nav, no sub-routes). Entry = `#portraits` anchor (hero CTA + CTA panel) — a *native* `href="#portraits"` anchor, not a wouter Link (CONVENTIONAL: wouter is for route changes; anchor scrolling is browser behavior; see §12 D-3).
- **Click behavior:** every frame is a `<button>` (not an `<a>`) that opens the **in-site lightbox** at that frame's index — the old gallery's behavior, preserved. Clicking a portrait never leaves the site (the old route gallery's promise, kept).
- **Navigation between images:** lightbox prev/next buttons, `←`/`→` keys, touch swipe ≥48px, ESC to close (all [FACT LightboxProvider, code-reviewed this session]).
- **Return path:** ESC/close returns focus to the exact trigger that opened it (rAF focus-return [FACT LightboxProvider]); the section stays scroll-anchored at `#portraits`.
- **Deduplication:** the lead frame is not repeated in the grid — one portrait appears once per page (same rule the archive section applies to screening videos). With exactly 1 study the grid repeats the lead so the section never renders empty-grid. [INTERP, smallest reasonable call]

---

## 5. IMAGE ASSET PIPELINE

- **Source of truth:** CMS-managed portrait studies (`publicPortraitStudies`, `customContent.ts` "portrait" workflow) with the 2-study fallback in `artistPlatform.ts` — "Potret Neon" `/media/portrait/neon-portrait.jpg` (3016×4032) and "Studi KX-07" `/media/portrait/kx07-portrait.jpg` (1055×1491) [FACT].
- **Rendering:** `OptimizedEditorialImage` (responsive `<picture>` wrapper) everywhere; hero uses the same lead portrait via `ResilientArtworkImage` with `priority` (eager + `fetchPriority="high"` + preload link) [FACT SSR].
- **Loading strategy:** first image of the page (hero) = eager/high; **all section images = lazy** — the portraits section sits below hero + screening + archive, so even its lead frame is below the fold; `aspect-ratio` reserved from intrinsic dimensions (3016/4032, 1055/1491) → zero CLS [FACT SSR: `style="aspect-ratio:3016 / 4032"`].
- **Fallbacks:** `imageUrl` → `officialBrand.socialPreview` (logo) if a study loses its media; `altId/altEn` → title → `t.fallbackTitle` if alt is missing — no `<img alt="">` path exists [FACT code + 0 empty alts in SSR].
- **Sizing:** `sizes` attribute per viewport (lead: `(max-width:1024px) 100vw, 52vw`; grid: `100vw/50vw/560px`). **Known gap:** `/media/portrait/*.jpg` are proxied full-size JPEGs with no mobile/AVIF variants [FACT `responsiveImage.ts` INTRINSIC_SIZES] — noted in §11/§13.
- **Analytics (preserved from the old gallery):** first-party anonymous visitor key (`an_portrait_gallery_visitor`, 16–128 char, `crypto.randomUUID` fallback) → `trpc.analytics.recordGalleryVisit` with `{gallery:"portrait-gallery"}` once per mount, only when the section actually renders [FACT code + test].

---

## 6. RELATIONSHIP TO MUSIC

**Decision D — expressed through shared identity, not cross-links.**

- /visuals contains **no music catalog content** (no release list, no play buttons, no fan-signal form) — Phase 3 MUST NOT, satisfied [FACT: no MusicEmbed/`fan-signal` in the page].
- **Video → music:** screenings and archive cards link out to YouTube (the external source of truth for the performed music; `https://youtu.be/<id>` or the channel) [FACT].
- **Portraits → music: deliberately no release/era attribution.** The data carries no release link on portrait studies [FACT `CmsPortraitStudy` has no release field], and inventing "this portrait is from the X era" would violate the FACT rule. The relationship is instead carried by *the same face*: the hero portrait IS the lead study, and both are the same person who appears in the global player's context — identity linkage, zero invented metadata.
- **Booking relationship:** the CTA is visual-scoped (`/inquire?type=visual&source=visuals`) — visual work is offered as a service, not tied to a release.

---

## 7. SCALE MODEL

**Decision E — flat, lazy, no pagination; curation is the scale control.**

- **5 studies:** the design target. Lead + 4-card grid, 2 columns, one lightbox. This is what the CMS manages today (2).
- **50 studies:** degrades gracefully — 2-col grid, all images lazy (`loading="lazy"`), lightbox preloads only neighbors; DOM ≈ 50 article nodes (same order as the archive section at 50 cards, which the site already ships).
- **500 studies:** works but is DOM-heavy and untested — **accepted as a known limitation**, not a pagination IA, because Phase 3's merge-over-add principle forbids introducing paged sub-views for a dataset the CMS has never held (2 rows today). The same unbounded behavior already exists in the archive section, so the page is internally consistent. [INTERP, smallest reasonable call]
- **Degradation:** 0 studies → section not rendered at all (Phase 3: MUST NOT empty state) [FACT code]; 1 study → lead only, grid repeats it (no empty grid); empty CMS → hero fact "Studi potret: 0" and section hidden.
- **Decision B — entry point = curated subset.** The public page shows the CMS-curated subset (fallback 2); the "invite to deeper looking" is the lead frame + the lightbox + the `#portraits` anchor — the whole archive of the CMS portrait workflow, nothing hidden behind a second route.

---

## 8. SIGNATURE EXPRESSION ON VISUALS PAGE

**One signature: "frame by frame" — the portrait section is a darkroom, not a gallery.**

- **Rest:** the route ambient is the **dust** particle field (`routeSignal.ts`: `/visuals → {mode:"dust"}`) — particles settling like dust in a darkroom's light, the quietest route mode in the system [FACT].
- **Where:** the `#portraits` section only. It is the sole place on the site using the Phase 4 **sepia darkroom register** (`--sepia-bg/-paper/-ink/-copy/-accent/-muted/-panel/-dark/-line` tokens) — a second light-world inside the dark site, reserved for looking at a human face. DERIVED (token set from Phase 4 §3).
- **Form:** lead frame with mono index `01` + asymmetric offset grid (even cards drop `clamp(1.5rem,4vw,3.5rem)`), mono frame indices `02…`, `cursor: zoom-in` on every frame, "Frame demi frame / Frame by frame" eyebrow. INVENTED (composition) over CONVENTIONAL (grid+lightbox).
- **Interaction:** click → in-site lightbox, frame-by-frame pacing (one face at a time, arrows to move, counter `n / total`); no zoom-to-full-page, no masonry chaos, no product-etalase hover sheen.
- **Where NOT:** hero, screening, archive, CTA all stay in the standard Phase 4 dark register — the sepia world never leaks; dust mode is the only ambient on the route (no wordmark, no signal).
- **Reduced motion:** zoom transitions disabled under `prefers-reduced-motion: reduce` (section CSS), particle field has its own reduce path (5a) [FACT CSS].
- **Gimmick test:** remove the sepia register + mono indices + lightbox pacing and the section becomes a generic portfolio grid — the signature is load-bearing, not decorative. [INTERP]

---

## 9. MOBILE VERIFICATION

Verified via SSR HTML + code review (no real browser in the sandbox — stated honestly):

- **Structure:** identical DOM order on both viewports (single responsive shell). [FACT SSR]
- **Section layout:** `@media (max-width:900px)` → `.an-pg-layout` 1 column (lead above), `.an-pg-grid` 1 column, asymmetric `nth-child(even)` offset **disabled** (would break single-column reading order) [FACT CSS].
- **Touch targets:** every frame trigger fills its 4:5 frame (≫44px); lightbox close/prev/next bumped 36→44px (Phase 4 §7) [FACT CSS].
- **Images:** `sizes` include `100vw` mobile term; lightbox image `max-height:60vh` mobile override (existing) [FACT CSS].
- **Header/footer/nav:** 5a shell, unchanged, already mobile-verified in 5a.
- **Not verified:** actual touch/swipe feel, visual rhythm at 375px — requires a real device pass (5g). [honest limitation]

---

## 10. ACCESSIBILITY CHECK (VISUALS)

- **Headings:** 1×H1 + 4×H2 in document order; section H2 `aria-labelledby` on its `<section>`; grid cards use H3 (no skipped levels). [FACT SSR]
- **Landmarks/links:** every portrait trigger is a `<button>` with a meaningful label (`Buka Potret Neon di penampil gambar` / `Open Neon Portrait in the image viewer`) — label includes the frame title, no "more"/"click" verbs; hero + CTA portrait links are real anchors with text. [FACT SSR]
- **Images:** 0 empty alts on /visuals; alt fallback chain contract-tested (`altEn || altId || title → fallbackTitle`). [FACT SSR + test]
- **Lightbox:** `role="dialog" aria-modal="true"`, focus trap (Tab/Shift+Tab cycle), ESC, `←`/`→`, swipe, body scroll lock, neighbor preload, **focus return to trigger** — code-reviewed this session; established component (no changes except 44px targets). [FACT code]
- **Keyboard-only path:** Tab → hero CTA (`#portraits` anchor) → screening controls → archive cards → **lead frame button → grid buttons** → CTA panel; every interactive element is a native `<button>`/`<a>`. Focus-visible ring = Phase 4 `2px signal, offset 2px` (lightbox buttons [FACT CSS]; frames inherit the global focus-visible rule).
- **Reduced motion:** section zoom disabled; lightbox has no animation (instant swap — trivially compliant); dust field reduce path from 5a. [FACT CSS]
- **Color contrast (sepia register):** token values from Phase 4 §3 (computed at Phase 4: sepia set passed at spec time); section text uses `--sepia-ink` on `--sepia-bg` and muted copy at 70–74% mix — **not re-measured this session**; flagged for the 5g audit. [INTERP/honest]
- **Not verified in a real browser:** runtime focus-trap behavior, scroll-lock on mobile Safari — code-reviewed only. [honest limitation]

---

## 11. PERFORMANCE CHECK (VISUALS)

Measured on the rebuilt production dist, served at `:4101`:

- **SSR HTML:** /visuals = 37.7 KB, /en/visuals = 40.4 KB (gzip before browser) [FACT curl].
- **Critical path:** 1 stylesheet, 2 image preloads (logo + hero portrait `fetchPriority="high"`); hero image eager with intrinsic `width/height` → **no CLS on first image** [FACT SSR].
- **Below-fold:** all section images `loading="lazy"` + `decoding="async"` + reserved `aspect-ratio` from intrinsic sizes → **no CLS when they load** [FACT SSR].
- **Video:** `OfficialMediaFrame` lazy-loads players only in the screening section (unchanged, 5a).
- **JS:** no new dependencies; no animation library (Phase 4 contract); section adds one trpc mutation call on mount (existing endpoint, same as old gallery).
- **Known cost [FACT]:** `/media/portrait/*.jpg` are proxied remote JPEGs served at **full source size** (neon = 3016×4032 ≈ multi-MB even when lazy; kx07 = 1055×1491). No mobile/AVIF variants exist in the pipeline (`responsiveImage.ts` INTRINSIC_SIZES only knows intrinsic dimensions, no generated sizes). This is the single largest real perf debt on the page — owned by 5g (image optimization pass), documented here rather than silently shipped.
- **Budgets (Phase 4):** fonts ≤205 KB unchanged (preloads ≈63 KB); no new CSS beyond 236 lines of section styles; no new runtime JS beyond the section component. [FACT]
- **Not measured:** real LCP/TTI (no browser) — the CLS story is verifiable from HTML (reserved dimensions); LCP is the hero portrait and is eager+preloaded. [honest]

---

## 12. DEVIATIONS FROM PHASE 3/4

- **D-1 · Photo-stories stay in `/universe` (smallest reasonable call).** Phase 3 L186 lists photo-stories under the /visuals row, but the binding heading sketch L407 (the stricter contract) has **no** photo-stories H2 for /visuals, and L392's H1 ("Video & potret.") covers video + portraits only. Photo-stories therefore remain an /universe concern (5e owns that page and its H2 sketch). Flagging rather than silently adding a 5th H2 that would break the verified heading chain.
- **D-2 · Lightbox buttons 36px → 44px.** Phase 4 §7 mandates 44px touch targets; the lightbox predates its public-page use (it lived on the now-deleted route) and had 36px. Fixed now that it ships on a public page. [FACT Lightbox.css]
- **D-3 · `#portraits` CTAs are native anchors, not wouter `Link`.** CONVENTIONAL: in-page anchors don't change the route; wouter adds SPA transition overhead and could race the browser's native scroll. No Phase 3/4 conflict — neither specifies the element type.
- **D-4 · Section sits AFTER the archive (not between screening and archive).** The 5a placeholder strip was between screening and archive; Phase 3's H2 order (L407) is Tayangan resmi → Arsip visual → **Studi potret** → CTA. The strip's position was 5a's placeholder guess, not a Phase 3 decision — the H2 sketch wins.
- **D-5 · `--hx-max/--hx-gutter` fall back in section CSS.** Those vars are scoped to `.an-site` (Home.css) which the 5a shell no longer renders (shell root is `an-public-shell an-editorial`); the section uses the same values as explicit fallbacks. Carried as a token-hygiene note for 5g (either scope the vars globally or drop the fallbacks).

No Phase 3/4 decision was silently overridden; each deviation above is a codebase-reality conflict resolved with the smallest call, per the standing instruction.

---

## 13. KNOWN LIMITATIONS

1. **No real-browser verification.** SSR HTML + curl + code review only: console errors, runtime focus-trap/scroll-lock/swipe, visual rhythm — all code-verified, not device-verified (5g owns the full pass).
2. **No image variants.** Full-size JPEGs for both portraits (up to 3016×4032); no AVIF/mobile sizes. Real LCP on slow connections will be heavy until 5g.
3. **Sparse by data, not by design.** Only 2 studies exist; the section renders lead + 1 card. This is honest curation (FACT: that's all the data is), but it means the grid's asymmetric rhythm is barely visible at 2 cards.
4. **Alt-fallback not runtime-triggered.** Both real studies have alt text; the fallback chain (alt → title → label) is contract-tested but has never fired in production.
5. **Scale 50 untested, 500 untested.** No such dataset exists to test against; the model in §7 is reasoned, not measured.
6. **Sepia contrast not re-measured.** Phase 4 computed the token set at spec time; the section's 70–74% opacity mix for muted copy hasn't been re-audited (5g).
7. **Lightbox is client-only.** Its HTML doesn't exist in SSR (opens on JS) — correct for a modal, but means the lightbox DOM is invisible to crawlers (acceptable: it's a viewer, not content).

---

## 14. OPEN RISKS FOR 5e–5g

- **5e (/universe + About):** photo-stories (D-1) must be resolved on /universe with its own H2 sketch — do NOT port them into /visuals mid-stream; the 301s and sitemap are already locked to the current /visuals contract. /universe must not re-introduce portrait content that now lives at `#portraits`.
- **5f (EPK/Inquiry/Booking):** the `/inquire?type=visual&source=visuals` link is live now; the inquiry form must honor the `type=visual` param or the CTA degrades to a generic inquiry (check when building).
- **5g (a11y/perf/SEO):** (1) image optimization pass is the single highest-impact item on this page (AVIF + mobile sizes for `/media/portrait`); (2) real-browser a11y pass: focus-trap, scroll-lock, mobile Safari; (3) re-measure sepia contrast ratios; (4) /visuals OG image for sharing; (5) token hygiene D-5 (globalize or retire `--hx-*` fallbacks).
- **CMS growth risk:** if the portrait workflow gets used heavily, the lead = first-CMS-row rule (§7) means curation order IS the public order — anyone with CMS access can change what the lead frame is. Fine at 2 rows; worth a note in ContentStudio if the set grows.
- **EN twin:** the section shares one component via `english` prop; any future EN-only portrait copy is already supported (`titleEn/copyEn/altEn` fields exist) but ID is the fallback for missing EN — verify when CMS rows are added.

---

*End of Phase 5d. Stopping here for instruction (5e next: About + Universe, incl. photo-stories per D-1).*
