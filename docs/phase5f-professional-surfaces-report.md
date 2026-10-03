# Phase 5f — Implementation Report: Professional Surfaces (EPK / Inquiry / Booking)

Repo: `akbarnawasunda/akbar-next` · branch `arena/01a0ffb8-akbar-next`
Binding: Phase 2 (creative direction), Phase 3 (IA — rows 6, 8, 9, 10, 11 + page contracts §3, H1/H2 sketch §8),
Phase 4 (design system), Phase 5a (shell/tokens/nav/footer), 5b (home), 5c (music), 5d (visuals), 5e (about/universe).

Labels: **[FACT]** = from the repo/deployed site · **[INTERP]** = derived reading · **[INVENT]** = new idea by the agent.
Verified (honest statement): `tsc --noEmit` clean · `vitest run` **311/311 pass** (54 files) ·
`scripts/verify-ssr.sh` **32/32 PASS** · production build clean · **rendered SSR HTML inspected by curl** for
`/epk`, `/en/epk`, `/inquire` (+ every `?type=` state), `/en/inquire`, `/live`, `/en/live`, `/licensing`,
`/en/licensing`. No browser and no database exist in this sandbox — form interaction and live submission are
code/unit-verified only (§13, stated honestly).

---

## 1. PROFESSIONAL SURFACES — IA REALIZED

**The professional set = four surfaces, no fifth** (Phase 3 rows 6, 9, 10, 11, and the two doors they open):

| Surface | Purpose (Phase 3 §3) | Shape implemented |
|---|---|---|
| `/epk` | let a promoter/editor do their job in under 60 seconds | one fact-sheet page: hero fact sheet → summary + working formats → assets → selected releases → contact → platforms |
| `/inquire` | the single low-friction form for every professional request, pre-aimed by the referring page | one form, four `?type=` states (booking / remix / collaboration / licensing), never a second form |
| `/live` | answer "when and where is the next show?", honestly route to booking when there is none | dates-only: hero → next-show document / honest empty state → confirmed index; exactly one booking exit block |
| `/licensing` | the honest clearance document in one screen, two exits | hero (pre-filled licensing inquiry + email) → usage routes → what-to-include checklist |

**Why `/live` and `/licensing` are in 5f:** Phase 3 assigns them explicit simplifications (row 6: "keep it as a
dates-only surface with one booking CTA"; row 11: "reduce to a one-screen clearance document … exactly two exits")
and no other sub-phase owns them; both are booking/licensing doors of the same professional set. **[INTERP — scope reading, documented rather than silent]**

**Desktop DOM order (verified in SSR):**

- `/epk`: kicker `Lembar fakta artis` + **H1 "Press & booking."** + lede + `Kontak press` (mailto) + `SAVE / PRINT EPK`
  ‖ fact sheet (portrait + `Berbasis di / Alias / Peran / Bio singkat / Genre / Kontak`) → **H2 "Tentang Akbar Nawasunda."**
  + working-format rows (→ `/inquire?type=…&source=epk`) + licensing note → **H2 assets** (only real files +
  request path) → **H2 selected releases** (3 + catalog link) → **H2 "Kontak proyek."** (booking / remix / press)
  → **H2 platforms** (6).
- `/inquire`: kicker + **H1 (type-specific)** + intro + facts (status / base / direct email) ‖ **H2 context/checklist**
  aside (always-visible mailto) + the form: type row → **H2 "Tentang kamu"** → **H2 "Rencana"** → **H2 "Brief"** →
  submit row → success/error block.
- `/live`: **H1 "Jadwal & panggung."** + meta `JADWAL / VENUE / TIKET` (+ ticket CTA only when a show exists) →
  **H2 next-show document** (or the honest empty state) → **H2 confirmed index** (only when dates exist).
- `/licensing`: **H1 "Lisensi musik."** + lede + two exits ‖ usage-boundary plate → **H2 "Jalur penggunaan."**
  → **H2 "Yang perlu disertakan."** (nothing after — the duplicated CTA panel is gone).

**Mobile order:** identical reading order, single column everywhere; the EPK fact sheet stacks to one column per
row; every action stays above the fold of its own block; no surface hides contact behind a menu. **[FACT: SSR DOM order + CSS media blocks]**

---

## 2. FILES CHANGED (5f scope)

| File | Why |
|---|---|
| `client/src/pages/PressKit.tsx` | H1 → "Press & booking." (§8); fact sheet gained the verified short bio + genres rows; EN sheet no longer shows Indonesian CMS text. |
| `client/src/pages/PressStage.css` | Sheet bio row stacks full-width; no hard-coded colors added. |
| `client/src/pages/Inquiry.tsx` | Form accessibility rebuild: `for`/`id` labels, `autocomplete`, client-side field validation mirroring the server, focusable `role="alert"` error summary, focus + `role="status"` success, no console logging, `type=visual` alias. |
| `client/src/pages/InquiryStage.css` | Error summary / field error / legend heading styles (tokens only); dead `.an-inq-form-title` removed. |
| `client/src/pages/Live.tsx` | Dates-only surface: H1 + dates-first meta; hero actions only for real dates; service rows removed; single booking exit block; terminal CtaPanel removed. |
| `client/src/pages/ShowcaseStage.css` | Removed the dead `.an-live-booking*` block + its breakpoint entry. |
| `client/src/pages/Licensing.tsx` | Duplicated terminal CtaPanel removed (Phase 3 row 11); exactly two exits remain; panel-only copy deleted. |
| `scripts/verify-ssr.sh` | `/live` needle follows the dates-first meta (`JADWAL / VENUE / TIKET`). |
| `server/artistContentContract.test.ts` | Honesty marker re-pointed to the /live status + dates line. |
| `server/editorialRedesign.test.ts` | "always has an inquiry CTA" now asserts the aimed booking route on both locales (escaped-`&` form), not a display string. |
| `server/mediaFallback.test.ts` | Re-pointed to the single booking route `/inquire?type=booking&source=live`. |
| `docs/phase5f-professional-surfaces-report.md` | This report. |

Not touched: shell/nav/footer/tokens (5a), home, music, visuals, about/universe (5e), a11y/perf/SEO pass (5g).

---

## 3. EPK — CONTENT MODEL

**Contains (all verified — §5):** fact sheet (base, alias, role, **short bio**, **genres**, contact email) ·
summary (the long bio already published) · four working formats as routable rows → `/inquire?type=…&source=epk` ·
assets · three selected releases with official platform links + `Buka katalog` → `/music` · contact panel
(booking inquiry / remix / press) · six official platforms.

**Omits, and why:**

| Omitted | Why |
|---|---|
| Invented bio of any length | The page uses the artist's own published short/long bio. **[FACT: `shortBio`/`longBio`]** |
| Press quotes / reviews / endorsements | None exist in the repo or the deployed site — omitted entirely. |
| Performance history, festival lists, tour dates | Never provided; `/live` holds only CMS-confirmed dates. |
| Technical rider, stage plot, tech specs | Not provided. No row claims one; the request path covers it. |
| One-sheet PDF, photo pack, logo pack | No files exist → the filter hides those rows (`cmsAssets` only renders when a URL exists) **[FACT: `PressKit.tsx` filter]**; a working `Request material` mailto is offered instead. |
| Superlatives ("genre-defying", "critically acclaimed") | Unverifiable adjectives — banned by the brief. |
| A second catalog | Three selected releases + one link to `/music`. |

**Downloadable assets and where they point:** `Official logo` → `/assets/akbar-logo.webp` (13.6 kB, exists
**[FACT: file on disk]**) · `Official visual` → `/assets/akbar-social-preview-optimized.webp` (136 kB, exists) ·
everything else → `mailto:` request rows. **No link promises a file that does not exist.**

**Bio status:** *provided* — `pressKit.snapshotBio` (CMS) else the verified profile bio; EN always uses the
verified English bio so the English sheet never shows Indonesian text **[FACT: SSR — "Produser musik, remixer, dan
DJ dari Bandung Barat…" on /epk, English equivalent on /en/epk]**. Not fabricated.

**Print:** `SAVE / PRINT EPK` calls the native `window.print()`; a print stylesheet already exists
**[FACT: `EpkReady.css` L389 `@media print`]**.

---

## 4. INQUIRY / BOOKING — CONTENT MODEL

**Form, not mailto** — because a real backend exists: tRPC `inquiry.submit` → `createArtistInquiry` → MySQL
`artistInquiries` → owner inbox `/studio/inquiries` **[FACT: `server/routers.ts` L197, `server/db.ts` L318,
`drizzle/schema.ts` L72]**.

**Fields (minimum necessary, each justified):** `name`* (who is asking) · `email`* (reply) · `organization`
(agency/label context) · `projectTitle`* (event/project) · `location` (market) · `timeline` (when) ·
`budgetContext` (optional context, never a required price) · `message`* (brief, 12–4 000 chars). **No sensitive
data** — no phone, no address, no payment, no ID.

**Validation:** client mirrors the server's zod rules (name ≥ 2, email format, project title ≥ 2, brief ≥ 12)
**[FACT: `server/routers.ts` L199-209 ↔ `Inquiry.tsx` `onSubmit`]**; `noValidate` so the messaging is ours, not
the browser's; per-field inline errors + a focusable `role="alert"` summary; the server remains the authority.

**Type states:** four types (booking / remix / collaboration / licensing); the H1 follows `?type=` and the query
is honoured **server-side** too **[FACT: SSR — `?type=remix` renders "Remix inquiry."]**. `?type=visual` (the
`/visuals` CTA, prescribed by Phase 3's /visuals contract) maps to **collaboration** — no fifth type is added
(§12 D-b).

**Submission target / what happens after (honest):** the message is stored in the artist's database and appears
in the owner-only inbox; the confirmation says exactly that ("pesanmu sudah masuk ke inbox Akbar Nawasunda") and
**promises no response time** — the page's status line stays "Akan ditinjau" ("under review"), which Phase 3
names as the correct ceiling **[FACT]**. On failure the page says the message was not sent and offers the direct
email address (always visible in three places: hero facts, sidebar, footer).

**Spam handling:** **honest "no protection yet"** — there is no honeypot, no rate limit, and no CAPTCHA on the
endpoint **[FACT: grep of `server/` — no rate-limit/captcha/honeypot code]**. The brief allows this state if
stated; it is stated here and flagged as an owner/deploy decision (§13). No CAPTCHA means no sighted-mouse
requirement — nothing about the form excludes assistive users.

---

## 5. CONTACT VERIFICATION

| Method | Where verified | Public today? |
|---|---|---|
| `akbarnawasunda@gmail.com` (mailto on EPK, Inquiry, Live, Licensing) | `verifiedArtistProfile.bookingEmail` **[FACT: `artistPlatform.ts` L115]** | Yes — same address used on the deployed site. |
| Press email | `pressKit.pressEmail` (CMS) **else** the same verified booking email **[FACT: `PressKit.tsx`]** | Yes when published; fallback is the verified one. |
| Booking route `/inquire?type=booking&source=live` | `/live` empty state; preselected on the form | Yes. |
| Platform links (EPK 6, footer 10) | `platformLinks` / `allPlatformLinks` **[FACT]** | Yes — real artist profiles (Spotify, YouTube, SoundCloud, Instagram, Apple Music, Deezer, Amazon Music, Tidal, TikTok, X). |
| Social-only contact | Instagram/TikTok/X rows in the footer | Yes. |

**Removed because they could not be verified:** none were invented in the first place — no phone number, no
WhatsApp, no management/label contact, no physical address appears anywhere on these surfaces.

---

## 6. SIGNATURE EXPRESSION

All four routes run in **quiet** mode **[FACT: `routeSignal.ts` L29-32]**: the signal dot at rest in every kicker,
the cursor signal, the route curtain sweep, the footer clock strip — and the particle **field yields to ×0.35
density** **[FACT: `particleField.ts` L412-421]**.

**Where it is deliberately absent:** inside the inquiry form (Phase 4 §8 excludes forms — focus clarity) and in
the EPK's document body (a professional document gets the point, never the field or a pulse). **No pulse** is used
on these pages: nothing here carries a live state, and a pulse that carries no information is banned by Phase 4 §8.

**Why subordinate to function:** every interaction a promoter needs (open the fact sheet, copy the email, pick a
type, submit) is standard, labelled, and keyboard-reachable; the signature adds zero interaction cost — it never
overlays text, never intercepts clicks, and never animates between an error and its field. **[DERIVED Phase 4 §8 exclusions]**

---

## 7. FIRST 60 SECONDS — VERIFIED (walked through the rendered HTML)

| Time | What a promoter with no context sees |
|---|---|
| **≤5 s** (`/epk`) | Kicker "Lembar fakta artis", **H1 "Press & booking."**, the artist's portrait, `Kontak press` (mailto) and `SAVE / PRINT EPK` — identity, purpose, and a contact action in the first viewport. |
| **≤15 s** | The fact sheet (base, alias, role, short bio, genres, email) and, one block down, `Tautan resmi untuk editor dan promotor` with three playable/opening release links. |
| **≤30 s** | Contact in three places: the hero mailto, the fact-sheet email row, and the `Kontak proyek.` panel (booking inquiry / remix / press) wherever they are on the page. |
| **≤60 s** | Submission: `Kontak proyek.` → booking row → `/inquire?type=booking&source=epk` with the type preselected; or from `/live` → `/inquire?type=booking&source=live`; or the direct email at any moment. |

**Friction removed this phase:** the EPK no longer buries the bio in the second screen (it is in the fact sheet);
`/live` no longer opens with a booking pitch (it opens with the dates answer and one exit); `/licensing` no longer
ends with a second CTA panel competing with the hero's exits. **[FACT: diff]**

---

## 8. MOBILE VERIFICATION

- **Contact reachable without opening a menu:** every surface shows the mailto (or a mailto/inquiry CTA) inside
  its first content block **[FACT: SSR]**. The mobile drawer is not required to reach the artist.
- **Form UX:** labels are visible text (never placeholder-as-label); inputs are `min-height: 48px` with 0.95 rem
  text (no iOS zoom trap); the submit button is 48 px on mobile **[FACT: `InquiryStage.css`]**; the error summary
  renders **above** the fields so the fix is visible without searching; the success block replaces the form's
  context and receives focus.
- **Keyboard types / autofill:** `type="email"` on the email field; `autocomplete="name|email|organization|organization-title"`.
- **EPK scanning:** the fact sheet becomes one column per row at small widths (each row is a labelled line, not a
  wall) **[FACT: CSS contract]***; assets and contact rows are single-column full-width tap targets; the release
  rail scrolls horizontally with native swipe (the one horizontal exception Phase 4 allows) — no table or wide
  spec list exists, so there is no horizontal overflow.
- **Downloads:** the two real asset files are plain webp behind direct anchors (no forced desktop view, correct
  MIME from the static server).
- **Live/Licensing:** single column; the two licensing exits sit in the hero (reachable immediately).
- **Deviation from desktop:** none by design — order is preserved; only stickiness and multi-column layouts drop.

\* `PressStage.css` stacks all sheet rows at the mobile breakpoint, so the new bio/genres rows inherit the same
behaviour without a second rule. **[FACT]**

---

## 9. ACCESSIBILITY CHECK (PROFESSIONAL SURFACES)

- **Labels & names:** every `input`/`textarea` is wrapped by a `<label for="…">` with a matching `id`
  **[FACT: SSR audit of /inquire — 8/8 labelled]**; the type buttons form a labelled `role="group"` with
  `aria-pressed`.
- **Required:** `required` + a visible "wajib" marker; optional fields carry a visible "opsional" marker.
- **Error association:** `aria-invalid` + `aria-describedby` point at the field's own error `<p id="…-error">`
  (rendered only when invalid) **[FACT: code]**; the summary is `role="alert"` + `tabIndex={-1}` and **receives
  focus on failed submit**; on success, focus moves to the `role="status"` confirmation.
- **Announcements:** error summary is assertive (`alert`), success is polite (`status`), and no live region fires
  for untouched fields. Field errors clear as the visitor types (the association is removed with them).
- **Keyboard-only submission:** the whole flow is native form controls (type buttons → fields → submit);
  no hover-only or drag-only interaction exists. Escape/arrow handling in the lightbox is unrelated.
- **Contact link labels:** the mailto links expose the address as their text on `/inquire` (`akbarnawasunda@gmail.com`)
  and are labelled "Kontak press"/"Email studio" elsewhere — never "click here".
- **Contrast:** the new error styles use the Phase 4 state tokens (`--state-err` for text/borders, `--signal` for
  the focus ring) — `--state-err` is measured at 7.5:1 on ink in Phase 4 §11 **[FACT: token use, no hex literals added]**.
- **Reduced motion:** the form's 200 ms state transitions are removed under `prefers-reduced-motion: reduce`
  **[FACT: `InquiryStage.css` L454]**, same for the EPK's contact rows **[FACT: `PressStage.css` L476]**.
- **Heading order:** single H1 per page; EPK's five H2s follow §8's sketch; fieldset legends are H2s on `/inquire`
  (the Phase 3 sketch asks for exactly that); no heading is used for decorative size.

---

## 10. PERFORMANCE CHECK

- **JS added:** **none.** No form library (native HTML + ~40 lines of validation), no PDF renderer (native
  `window.print()`), no mask/validation dependency. `react-hook-form` exists in `package.json` but was **not**
  introduced here **[FACT: imports unchanged]**.
- **Third-party scripts:** **none added** — no Turnstile/reCAPTCHA, no form service, no analytics on these routes.
- **SSR payload (uncompressed HTML incl. dehydrated state):** `/epk` 52.1 kB · `/inquire` 31.4 kB ·
  `/live` 29.4 kB · `/licensing` 30.7 kB **[FACT: curl, production dist]** — the professional set is the lightest
  part of the site after /about.
- **Images:** EPK portrait eager + intrinsic 667×1000; release thumbs lazy + `artworkThumb`-downsized (300–640 px
  sources); `/live` hero uses the existing `<picture>` with a mobile variant, eager, sized 1440×1440; every image
  carries intrinsic dimensions → **no CLS from images** **[FACT: SSR audit]**. `/licensing` and `/inquire` carry
  no content images at all (only the shell logo, lazy below the fold).
- **Budget compliance:** all four routes are far under the Phase 4 route-class ceilings (no video, ≤7 images,
  one small remote request on the EPK's release rail). **[DERIVED]**
- **CSS:** the removed `/live` service block and `/licensing` terminal panel also removed their styles
  (−49 lines in `ShowcaseStage.css`, plus the panel came from the shared EditorialKit already on the page).

---

## 11. SECURITY & PRIVACY

- **Where submissions go:** browser → `POST /api/trpc/inquiry.submit` → `createArtistInquiry()` → MySQL table
  `artistInquiries`; readable only through `inquiry.list` (**adminProcedure**), surfaced in `/studio/inquiries`
  **[FACT: `server/routers.ts` L197-216, `server/inquiry.test.ts` asserts the admin-only boundary]**.
- **What is collected:** the eight form fields + `inquiryType` + `source`. No IP, no user agent, no fingerprint,
  no cookies are added by the form. Nothing sensitive is requested.
- **Client logging:** the previous `console.error("Inquiry error:", error)` was **removed**; failures are mapped
  structurally (which fields the server rejected) and never log the visitor's content **[FACT: diff]**.
- **Secrets:** none in client code; the tRPC endpoint has no client-side key. **[FACT]**
- **Email exposure:** the only address used is the artist's already-public booking email; no private address is
  emitted anywhere on these pages **[FACT]**. `mailto:` links pre-fill a subject only.
- **Third-party services:** **none** — no captcha, no form SaaS, no tracking pixel, no third-party script on any
  of these routes **[FACT: SSR script audit — only the site's own bundle]**. Disclosing a third party is therefore
  a non-event today.
- **Spam:** no protection yet (stated, §4) — the honest state the brief allows; the endpoint is public and
  zod-validated.

---

## 12. DEVIATIONS FROM PHASE 3 / 4

- **D-a · `/live` and `/licensing` implemented inside 5f.** Their Phase 3 simplifications (rows 6 + 11) are
  professional-surface work and no other sub-phase owns them — documented here rather than deferred. **[INTERP]**
- **D-b · `?type=visual` maps to *collaboration*.** Phase 3's /visuals contract prescribes
  `/inquire?type=visual&source=visuals` while the /inquire contract locks the form to **four** types. Smallest
  call: keep the prescribed URL, map it in the form (aliases `visual`/`video` → `collaboration`), no fifth type,
  no new labels. **[FACT + INTERP]**
- **D-c · `source` values beyond the DB enum collapse to `epk`.** `/live` → `source=live` and `/visuals` →
  `source=visuals` (both prescribed) cannot be stored: `artistInquiries.source` is a MySQL enum of four values
  **[FACT: `drizzle/schema.ts` L83]**. The client keeps sending its own four-value set and falls back to `epk`;
  storing finer origins needs an enum migration (owner/deploy). Documented in code and §13 — nothing is faked.
- **D-d · `/live` H1 "Booking & panggung." → "Jadwal & panggung."** Phase 3 §8 fixes the dates-first H1
  ("stable across empty/populated states"). Also changed: the mono meta line (`BOOKING / REMIX / KOLABORASI` →
  `JADWAL / VENUE / TIKET`), the hero lede (booking pitch → dates-first sentence), hero actions (only a real
  ticket CTA remains), and the terminal `CtaPanel` + service rows are **removed** (row 6: dates-only + one booking
  CTA; §3 MUST-NOTs). The `verify-ssr.sh` needle was updated with the contract. **[FACT]**
- **D-e · `/licensing` terminal CtaPanel removed** (row 11: "duplicated CTA panels beyond one exit block"). The
  two remaining exits are exactly those the contract names (pre-filled licensing inquiry + email). The
  contract's "/music (secondary: hear the catalog)" intent is served by the persistent nav/footer — no page-local
  second exit block was kept. **[FACT]**
- **D-f · EPK H1 → "Press & booking."** (Phase 3 §8: purpose-first; the artist name is already the persistent
  brand). The kicker now carries the document type ("Lembar fakta artis" / "Artist fact sheet"). **[FACT]**
- **D-g · EPK fact sheet gained two rows** (short bio + genres) because §3 lists the fact sheet as
  "bio snapshot, genres, based, alias, contact". The bio shown is the short verified one, not a new text. **[FACT]**
- **D-h · No signature amplification on these pages.** Phase 4 §8 already excludes fields/pulses for professional
  surfaces; nothing was added to compensate — quiet mode only. **[FACT]**

---

## 13. KNOWN LIMITATIONS

1. **No live submission was possible in this sandbox:** there is no `DATABASE_URL`/`.env` and no browser, so the
   submit path was verified by (a) the rendered form contract, (b) `server/inquiry.test.ts` (public submit
   accepted + optional fields normalized + admin-only inbox), and (c) code review — **not** by an end-to-end
   submit against MySQL. Stated plainly per the brief.
2. **Spam protection does not exist** (no honeypot/rate limit/CAPTCHA). Owner/deploy decision; noted in §11.
3. **`source` granularity is capped by the DB enum** (D-c) — `/live` and `/visuals` inquiries are stored as
   `epk`. Needs an enum migration to fix.
4. **The form requires JS.** Without JavaScript the tRPC submit cannot run; the always-visible mailto link is the
   documented fallback (it appears in the hero facts and the sidebar). No fake success state exists.
5. **CMS assets are absent** (one sheet, photo pack, logo pack, technical rider): the rows correctly do not
   render, so the only downloadables are the logo and the social/identity visual. When the artist publishes
   those files, the rows appear with no code change.
6. **`/live` populated state is unverifiable here** — the repo has zero confirmed events, so the index + countdown
   path is code/SSR-contract verified only (the empty state is what the site actually renders today).
7. **Print output was not rendered on a real print engine** — the print stylesheet exists and the button calls
   the native dialog; visual print QA is 5g.

---

## 14. OPEN RISKS FOR 5g

- **Real-browser a11y pass:** focus order on failed submit in Safari/Firefox, error-summary announcement with
  VoiceOver/NVDA, autofill behaviour, and the success-focus hand-off (all currently code-verified only).
- **Inquiry end-to-end + anti-spam:** run one real submission against the production DB, then decide the spam
  approach; if a CAPTCHA is added, it must keep a non-visual alternative (Phase 4 §11).
- **`source` enum migration** (D-c) so `/live` and `/visuals` attribution survives.
- **SEO/OG:** `/epk` and `/live` OG images and titles; the `/live` title still reads "Live Dates | Akbar Nawasunda"
  (accurate) while its H1 is now "Jadwal & panggung." — confirm the pairing reads well in search results.
- **Print QA** for the EPK (headers/footers, the fact sheet's page break, colour on white paper — the contact
  panel is the one light surface and has `!important` overrides from an earlier phase **[FACT: `EpkReady.css` L36-37]**).
- **`/live` when dates exist:** verify the index rows, countdown `aria-hidden` digits, and the nav slot
  auto-restore (`buildNavItems(hasConfirmedEvents)`) with a real CMS event.
- **Form-level hardening later (not blocking):** consider a time-to-fill check or a disclosed honeypot; keep any
  added protection invisible to assistive technology.

---

*End of Phase 5f. Stopping here — 5g (full a11y/perf/SEO pass) only on instruction.*
