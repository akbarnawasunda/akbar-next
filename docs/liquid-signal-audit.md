# Liquid Signal Audit — Design Intelligence Pass

> Companion to `DESIGN.md`. This file records the discovery, the editorial
> judgment calls, what was changed, what was deliberately left alone (and
> why), and a self-critique against DESIGN.md §53 and the Generic Artist
> Website Test. It exists so the next session does not have to re-derive the
> same analysis from scratch.

## 1. What this codebase already is

Before touching anything, the repo was audited end-to-end: routes, pages,
content sources, fonts, the signature/particle runtime, and the existing
`docs/design-language.md` + `docs/REFACTOR-STATE.md` + `docs/phase*.md`
history. The conclusion that shaped every decision below:

**This is not a blank or generic site that needs a "liquid signal" identity
imposed on it. It is a mature, already-bespoke system that independently
arrived at most of DESIGN.md's intent across many prior phases**, and the
job here is targeted correction, not a rebuild. Evidence:

- `client/src/index.css` tokens (`--ink #101211`, `--paper #f1efe9`,
  `--acid/--signal #9bb9c1`, `--mute #a6a69f`, `--state-ok/--state-err`)
  already match DESIGN.md §9's palette almost to the hex.
- Three self-hosted type roles (Recons / NEXROID / Good Times) with
  `font-synthesis: none` and no external font requests — matches §11.
- `client/src/signature/routeSignal.ts` already assigns the exact per-route
  particle character DESIGN.md §5 asks for: Home → `wordmark`, Music/Live →
  `signal`, Visuals → `dust`, Universe → `era`, About/EPK/Privacy →
  `quiet`, game → `frequency`. Nobody had to invent this mapping — it was
  already the architecture.
- `client/src/signature/stagePhrases.ts` already encodes the DJ Akbar Remix →
  Akbar Nawasunda transformation (§13) as a scroll-driven particle
  aggregation/release, not a logo animation.
- No raw neon hex, no public-surface `backdrop-filter`/glassmorphism (every
  file that mentions `backdrop-filter` does so in a comment *disclaiming* it
  — e.g. `GlobalAudioPlayer.css: "Solid, tanpa backdrop-filter"`), no
  `filter: blur()` outside the admin Studio, no giant neon box-shadows.
- `/live` already renders an honest empty state
  ("No confirmed show is public yet.") instead of inventing tour dates.
- Audio player starts closed, autoplay is only set true after an explicit
  user play action.
- 330+ existing tests assert on rendered SSR HTML (not source text), and the
  team had already been actively *removing* generic patterns (see the
  `an-section-index`/decorative-number removal documented inline in
  `server/homeEnhancements.test.ts`).

Given that, rewriting the particle engine or re-architecting the page shell
would have been exactly the kind of "more effects instead of better
judgment" DESIGN.md §50 warns against. The right move was a precise audit
for the places where the system still contradicts its own stated rules.

## 2. The particle system specifically (DESIGN.md §3–4, §38)

`client/src/signature/field/particleField.ts` (1300 lines, Canvas 2D, no
WebGL, no animation library) was read in full. It already implements, by
name or by clear equivalent, nearly everything §4 asks for:

| DESIGN.md behavior | Where it already exists |
| --- | --- |
| Drift | Ambient `FREE` dust with per-point flow-field wander (`flowAngle`) |
| Magnetic response | Pointer repulsion + drag impulse (`repelRadius`, `dragX/dragY`) on every mode, including quiet/dust pages |
| Flow | `bursts` array — tap/drag/click create a short radial impulse |
| Gathering | Wordmark formation (`ATTACHED` points spring to sampled letterforms) |
| Dissolution | `release`/`FREE`/`PARKED` lifecycle — letters break apart into ambient dust that drifts into the next section instead of vanishing |
| Formation is occasional, not default | The wordmark only actually draws near the `data-signal-stage` DOM node; once `stage.visibility <= 0.02` and no points are in flight, the canvas clears and nothing is drawn. It is discovered by scrolling into the stage, not shown on every load. |
| Signal memory across routes | One engine, one `SignatureStore`, mode switches per route (`routeSignal.ts`) without resetting the whole system |
| Reduced motion / adaptive cost | `prefers-reduced-motion` gate, rolling 60-frame cost window that trims/grows point count automatically, tier-based (`off`/`lite`/`full`) budget |

**Conclusion:** the particle system already *is* a liquid-signal language —
material that gathers, separates, drifts, and occasionally reforms — built
from first principles rather than a particles.js background. It passes the
Generic Artist Website Test on its own: strip the name and portrait, and
what remains is still clearly a bespoke instrument tuned to this site's
scroll geometry and brand tokens, not a stock effect.

**Decision: preserve the engine as-is.** No structural changes were made to
`particleField.ts`, `stagePhrases.ts`, `routeSignal.ts`, or
`SignatureProvider`. Introducing new mechanics (e.g. forced pointer
attraction in addition to repulsion) was considered and rejected — DESIGN.md
lists attraction as *one possible* behavior, not a requirement, and the
current avoidance/repulsion metaphor already echoes the mascot-avoidance
idea in §17 ("particles slightly avoid it"). Adding more interaction surface
here would be effects for their own sake, which §50 explicitly tells us to
reject.

## 3. What was actually wrong, and why each fix is justified

Three concrete, verifiable contradictions between the shipped site and its
own rules were found and corrected. Each one is small in code size but
large in how often a visitor encounters it.

### 3.1 Mascot repeated on every single page (§17 violation)

**Found:** `NightFrequencyChrome.tsx`'s `NightFooter` — rendered on *every*
Indonesian public page, including `/privacy`, which §31 explicitly says must
not use the mascot — rendered a "KEMBALI KE BERANDA" badge with the mascot
doodle, animated with a perpetual 4.8s rotate/bob loop
(`@keyframes nf-mascot-signal`) that never stopped. `EnglishChrome.tsx`'s
footer did **not** have this element at all, so ID and EN were visually
inconsistent on top of the repetition problem.

DESIGN.md §17 is explicit: "Recommended placements: one hero appearance, one
subtle interaction or transition, 404, optionally one unexpected archival
moment... Never use the mascot as a sticker on every section." A perpetual
animation loop repeated on every footer of every page is precisely a
"sticker," and directly contradicts §38 ("do not run... loops when they add
no meaningful value") and the Generic Artist Website Test (identical
decoration site-wide reads as template filler, not identity).

**Fix:**
- Removed the mascot link from `NightFooter` (`NightFrequencyChrome.tsx`),
  bringing the ID footer back in line with the EN footer's plain
  logo+name+tagline brand block.
- Removed the now-dead `.nf-footer-mascot` CSS (including the perpetual
  keyframe) from `NightFrequencyChrome.css` and `EditorialRefresh.css`.
- Added one new, deliberate mascot appearance on the 404 page
  (`NotFound.tsx` — shared by `/404` and `/en/404`), exactly where §33 asks
  for it: a small badge at the corner of the portrait plate with a slow
  (8s, ~5px) drift, respecting `prefers-reduced-motion`. It reads as "the
  one thing still moving on a page that otherwise went quiet" rather than a
  decoration.
- Result: the mascot now appears in exactly two authored places — the home
  hero and the 404 page — matching §17's guidance precisely, and ID/EN are
  now identical in this respect.
- Added `server/mascotIdentity.test.ts` to lock this in: asserts exactly one
  mascot image on the home route, one on 404 (both locales), and zero on
  `/music`, `/visuals`, `/about`, `/privacy`, `/en/about`.

### 3.2 An endless scrolling marquee duplicating content already on the page (§7 violation)

**Found:** `PlatformMarquee.tsx` — a two-row, opposite-direction, infinitely
looping (`28s linear infinite`, no pause except on hover/focus) ticker of
platform names — was rendered directly underneath the `an-channels-list`, a
clean, accessible, editorial list of the exact same platform links, on both
the Indonesian and English home pages. The same five or six links were
printed twice: once correctly (§35: "accessible platform name, icon,
outbound indicator"), once as marquee.

DESIGN.md §7 names "endless marquee text" explicitly as a banned
AI-slop/generic pattern, and §38 says permanent motion is reserved for
particle ambience and mascot drift only — a scrolling text ticker is neither.
It also directly contradicts the restraint this same codebase had already
applied elsewhere (the `homeEnhancements.test.ts` comment about removing
decorative section numbers because they "only repeat information and make
the homepage feel like a template" applies word-for-word to this marquee).

**Fix:**
- Removed `<PlatformMarquee>` from both `Home.tsx` (ID) and
  `EnglishPages.tsx` (EN home). The already-existing "Buka katalog
  musik"/"View music" link now closes the section on its own, right-aligned
  behind a hairline rule (`.an-channels-foot`), consistent with §10's "fine
  rules" surface language instead of an empty flex gap.
- Deleted the now-unused `PlatformMarquee.tsx`/`.css` component and its dead
  CSS rules duplicated across `Home.css` and `HomeStage.css` (three
  generations of the same selector had accumulated there across phases —
  cleaned up rather than left as inert weight).
- Updated `server/homeEnhancements.test.ts` to assert the marquee is now
  *absent* instead of present, with the rationale written inline.

### 3.3 The entire site's buttons were capsule/pill-shaped (§7 and §10 violation)

**Found:** `.an-btn` in `client/src/shell/SceneKit.css` — the single shared
primitive behind nearly every text CTA on the public site (hero "DENGAR
SEKARANG"/"Lihat visual", the 404 actions, the nav's "Dengarkan" button via
`.nf-signal`, the Inquiry type-selector chips, the EPK platform links) — was
defined with `border-radius: 999px`, i.e. a full stadium/pill shape.

DESIGN.md is unusually explicit on this exact point:
- §7 (Anti-AI-Slop): "excessive pill-shaped UI" is listed as a generic
  AI-generated pattern to avoid.
- §10 (Surface Language): "Corners should generally be: square, 0–2px,
  occasionally circular when the shape has semantic purpose... Do not round
  everything by default." A circle is reserved for "mascot framing,
  record/disc interaction, status indicators, deliberately circular media
  objects" — a text button is none of those.

This was the single highest-leverage finding of the whole audit: one
un-overridden, non-`!important` declaration controlled the primary
interactive language across the entire public site. Fixing it changes the
site's silhouette everywhere at once, which is exactly the kind of
system-wide identity correction the brief is asking for, with minimal risk
(verified there was no competing selector or `!important` elsewhere — see
§4 for the audit method).

**Fix:** changed `border-radius` from `999px` to `2px` (DESIGN.md's own
upper bound for "square-ish") on:
- `.an-btn` (`SceneKit.css`) — the shared text-button primitive
- `.nf-signal` (`ChromeRedesign.css`) — the header "Dengarkan" CTA
- `.an-inq-type-row button` and `.an-inq-feedback button`
  (`InquiryStage.css`) — the inquiry type chips and retry action
- `.an-press-platform` (`PressStage.css`) — EPK platform links

**Left untouched on purpose:** genuinely circular, equal-width/height icon
controls, which DESIGN.md explicitly allows — `.an-catalog-controls button`
(44×44 prev/next transport controls on the music rail), the cursor dot/ring
(`CursorSignal.css`), era timeline markers (`EraTimeline.css`), and the
once-a-year birthday status chip (`StudioClock.css`, a badge, not a button,
and only ever visible on November 1st Jakarta time). These are the "status
indicator"/"deliberately circular media object" exception, not the rule
being violated.

## 4. Audit method (what was checked but found already compliant)

To avoid manufacturing work, the following were explicitly checked and
found to already satisfy DESIGN.md, so nothing was changed:

- Raw neon hex (`#00d4ff` family) — none found anywhere in `client/src`.
- `backdrop-filter`/glassmorphism on public surfaces — none; every match was
  a comment disclaiming its use.
- `filter: blur()` — confined entirely to `client/src/studio/studio.css`
  (admin CMS, explicitly out of public design scope per §48).
- Large neon glow `box-shadow` (`0 0 40px+`) — none found.
- `/live` empty state — honest, no invented tour dates.
- Audio player — closed by default, autoplay flag only flips true after an
  explicit user play action.
- `.ed-button`/`.ed-button--ghost` (the CTA-panel button family used for
  booking/EPK CTAs) — already square (no `border-radius` declared at all).
- Universe/`EraTimeline` — factual timeline with real years and aliases, no
  invented mythology.
- Mobile nav — single real drawer (`.nf-mobile-drawer-root`), not three
  competing systems.

Known, pre-existing architectural debt that was **not** addressed in this
pass, because fixing it safely requires a larger, separately-scoped
refactor and is already tracked in `docs/design-language.md` §7:
- Three overlapping token layers (`index.css`, `EditorialRefresh.css`,
  `CinematicReference.css`).
- ~1100 `!important` declarations, concentrated in
  `CinematicReference.css` and `MaturePalette.css`.
- Two parallel home implementations (`.an-site` ID vs a different
  `home-platform-card` grid system on the EN home) instead of one shared
  component.
- `client/src/studio/studio.css` still uses `backdrop-filter`/`blur()`
  and one `overflow-x: hidden` — flagged by `pnpm audit:layout`, but Studio
  is explicitly outside the public design scope (§48).

Touching any of these now would mean rewriting thousands of
cascade-dependent lines under time pressure with no browser available in
this sandbox to visually verify every breakpoint — the wrong trade against
§39/§50 ("prioritize... composition, not expensive effects" and "design
less, mean more"). They are left as named debt rather than silently ignored.

## 5. Verification

- `pnpm check` (tsc --noEmit): clean.
- `pnpm test` (Vitest, SSR-rendered HTML assertions): 333/333 passing,
  including the new `server/mascotIdentity.test.ts` and the updated
  `server/homeEnhancements.test.ts`.
- `pnpm build`: production client + SSR + API bundles build successfully.
- `pnpm audit:layout`: the only two findings are pre-existing and confined
  to `client/src/studio/studio.css` (admin tool, out of public scope); no
  new findings introduced.
- Manually diffed the dev-server SSR output for `/`, `/privacy`,
  `/music`, and a bad route to confirm: exactly one mascot image on the
  home route, zero on `/privacy`, the marquee markup is gone, and
  `.an-btn` now serves `border-radius: 2px`.
- No visual browser/screenshot tooling was available in this sandbox
  (Playwright's browser download is blocked by the sandbox's network
  egress policy). Verification here is therefore source- and
  SSR-HTML-level, not pixel-level; the user should still eyeball the
  button shape and footer change on a real device before merging.

## 6. Self-critique against DESIGN.md §49 and §53

Running through §49's questions honestly:

- **Identity** — Yes, more than before: the two things a visitor sees on
  every page footer and every CTA (a bobbing mascot sticker and a pill
  button) were the most generic-feeling, least-authored elements on the
  site, and both are now intentional/restrained.
- **Restraint** — The marquee and the repeated mascot were removed; nothing
  new was added to replace them except a single hairline rule and one
  small, slow 404 mascot drift. Net decoration went down.
- **Originality** — The particle engine, the stage-based name transformation,
  and the per-route signal-mode map remain the most ownable things on the
  site, and they were left untouched because they already are the liquid
  signal language — not generic WebGL decoration.
- **Rhythm** — Unaffected positively: the quiet pages (About/EPK/Privacy)
  were already appropriately silent; the home page's "pause" section and
  per-section particle modes were not disturbed.
- **Photography** — Untouched; real portrait and artwork remain the primary
  visual material.
- **Signal** — Confirmed coherent across routes via `routeSignal.ts`
  (unchanged).
- **Alias** — The DJ Akbar Remix ↔ Akbar Nawasunda narrative
  (`stagePhrases.ts`, `/universe`) was already well-built and untouched.
- **Culture** — `SundaScript`/`sundaneseScript.ts` already render real
  Sundanese script as text, not a particle effect or costume motif; this
  pass did not touch it.
- **Interaction** — Cursor remains a small dot+ring with magnetic buttons on
  fine pointers only; untouched and already restrained.
- **Readability** — Unaffected; no typography was changed.
- **Distinction / Generic Artist Website Test** — Before this pass, a
  visitor could have landed on the homepage and seen a perpetual mascot
  badge + an infinite marquee + a fully pill-shaped button language — three
  of the exact patterns §7 calls out as generic. After this pass, those
  three are gone, and what's left (the sharp-edged button system, the
  single intentional mascot moments, the liquid-signal particle field) does
  not read as interchangeable stock decoration. The site now has fewer
  places where it is accidentally quoting generic templates, and the
  distinctive parts (particle engine, stage transformation, Sundanese
  script treatment, honest content) are no longer competing with
  off-the-shelf UI tropes for the visitor's attention.

This was a corrective pass, not a rebuild, because the honest assessment of
the existing system did not support a rebuild: most of DESIGN.md's intent
was already implemented, and the remaining gaps were specific, nameable,
and fixable without touching the parts that already work.

## 7. Round two — testing for "could this only belong to Akbar Nawasunda"

The first pass fixed rule violations. This pass asked a harder question:
with the name, portrait, and artwork removed, would the remaining
*composition* still be distinguishable from a generic electronic-artist
template? That required reading every interior page's actual rendered
markup (not just grepping for banned keywords) and comparing them against
each other, because genericness here is a **structural, cross-page**
problem — a single page can look fine in isolation and still feel
templated the moment you notice four other pages do the exact same thing.

### What was found

Every interior page (`/music`, `/visuals`, `/live`, `/universe`, `/about`,
`/epk`, `/inquire`, `/privacy`) is built from one shared editorial system
(`EditorialKit.tsx`/`.css`, plus the `.an-*` primitives in `SceneKit.css`).
That system is a genuine strength — it's why the site doesn't have five
different half-finished design languages. But two specific primitives in
it had drifted into the exact kind of furniture that makes any portfolio
site feel interchangeable, regardless of its color palette:

1. **The `dl.an-facts` "three-stat infobox."** A row of three small
   label/value pairs (Based in / Alias / Active since, or Videos /
   Portraits / Channel) placed directly under the hero copy. This is the
   single most common "personal brand site" device there is — it's the
   same shape as a LinkedIn header, a Notion bio page, or a no-code
   portfolio template. It appeared, with near-identical markup, under the
   hero on **About**, **Visuals**, and **Universe**. Worse, About's
   "Alias" stat duplicated a line that already exists a few hundred pixels
   lower on the same page (the "Aka DJ Akbar Remix / ..." caption next to
   the biography), and About's "Based"/"Since" duplicated Universe's
   "Based"/"Since" word-for-word. A visitor moving from About to Universe
   would see the same two facts presented in the same three-box shape
   twice.
2. **The `.ed-cta` "agency CTA band."** A bordered card with a thick
   accent-colored left stripe, a tinted background, a bold headline, and
   two stacked buttons — appearing, byte-for-byte identical in structure,
   at the close of **Home**, **Music**, and **Visuals** (and their English
   mirrors, so six instances total). This exact shape — boxed panel,
   colored left rule, "problem copy + two CTAs" — is the default closing
   section of countless unrelated SaaS, agency, and freelancer websites.
   It is not tied to anything about Akbar Nawasunda; the copy was specific
   and honest, but the *container* could have shipped on any business site.

Both were real, repeatable, and traceable to a cause in the code (not a
vague feeling) — exactly the standard asked for.

### What was changed

- **`.ed-cta` was de-boxed.** `EditorialKit.css` no longer wraps the
  closing CTA in a bordered, tinted panel with a thick accent stripe. It
  now sits flush with the page (the wrapping `.ed-section` already
  supplies a hairline top rule and the page's own padding), with a single
  thin `border-left: 1px solid var(--ink-line)` acting as a quiet reading
  guide — the same register as a pull-quote, not a conversion widget. This
  is a single CSS change with no JSX changes, so it instantly affects all
  six occurrences across both languages — the same "one definition, whole
  site" leverage as the earlier button-radius fix.
- **The redundant stat-box was removed from About and Visuals**, and kept
  only on **Universe**, where it is the one page explicitly framed as an
  archival record (`/universe` sits next to a real timeline and is the one
  place DESIGN.md's "record of becoming" language applies literally). On
  **About**, the same real facts (location, active-since year) now appear
  as a single quiet metadata caption line under the lede — turning
  bureaucratic infobox chips into one sentence of editorial voice, and
  removing the alias duplication entirely (it still reads once, correctly,
  next to the biography). On **Visuals**, the stat row (video count,
  portrait count, "Channel: YouTube") was removed outright — that content
  measured activity the way an Instagram profile header does, which
  directly contradicts §22's instruction that Visuals "should not feel
  like an Instagram clone," and removing it gives the hero a quieter beat
  before the screening-room section gets dense, which is the
  dense/quiet/dense rhythm §6 asks for rather than identical furniture on
  every hero.

No copy was invented or removed to make this work — every fact that was
visible before (location, start year, alias, video/portrait counts) is
still true and still real; only the three-page-repeated container and one
literal duplication were removed.

### What was re-examined and deliberately left alone

Several places that looked, on first read, like they might be generic were
checked against their actual implementation and found to already be
specific, bespoke, and worth preserving:

- **The DJ Akbar Remix → Akbar Nawasunda transformation
  (`EraTimeline.tsx` on `/universe`).** This is not a static timeline
  component. Scrolling through it drives an `IntersectionObserver` that
  reports the active era into the Signature Runtime
  (`useSignatureRuntime().actions.setEra`), which the particle engine
  (`particleField.ts`, `case "era":`) uses to reshape the ambient particle
  field to match the chapter in view. The alias transition is genuinely
  told through the particle system reacting to scroll position, which is
  exactly the "archival layering / timeline transition" device §13 asks
  for — not a flashy logo animation, not two names side by side. Left
  untouched.
- **The Visuals archive grid (`.an-vis-archive`).** Already an
  asymmetrical dense grid (a deliberate 3,3,2,2,2 column-span rhythm, not
  a uniform square grid), satisfying §22's "asymmetrical image/video
  composition" direction. Left untouched.
- **The Music catalogue (`CatalogStage.css`/`Music.tsx`).** Already rows
  (`.an-rail`/`.an-release`, `.an-index-row` for platform links), not
  cards — satisfies §20's explicit "avoid repetitive generic cards"
  instruction. Left untouched.
- **The Live page (`Live.tsx`).** Already rows for confirmed dates and an
  honest, specific empty state when there are none — no invented tour
  data. Left untouched.
- **Global navigation (`NightFrequencyChrome.tsx`).** Already the compact
  left/center/right masthead §14 asks for, with real, localized labels
  (`MUSIK`/`VISUAL`/`PERJALANAN`/`TENTANG`/`EPK`/`KONTAK`, with `JADWAL`
  appearing only when a confirmed event exists). "Perjalanan" (Journey) as
  the label for `/universe` is a small, specific choice rather than a
  bland "Archive" — left untouched.
- **`EcosystemPages.css`** (1593 lines) is mostly **dead** CSS from an
  earlier design generation — classes like `.nf-page-hero`,
  `.nf-catalog-card`, `.nf-visual-card`, `.nf-universe-card`, and
  `.an-event-card` that would read as the exact kind of generic
  card-grid/hero template this audit went looking for, if they were still
  rendered. They are not: nothing in the current `.tsx` files references
  them. The file is still imported on every page (it supplies a handful of
  genuinely live rules, like `.nf-page`), so it is a bundle-size and
  clarity debt worth a future cleanup pass, but it has no effect on what a
  visitor actually sees today, so it was left out of this round's scope
  rather than risk an unrelated, large, hard-to-verify deletion.

### Net effect

This round's diff is five files, no new dependencies, no new components,
and no layout rebuild — two component-level primitives were corrected
(one CSS-only, one content-and-CSS) because they were the specific,
demonstrable source of "this could be anyone's site" furniture, while the
page-level systems that already carry Akbar Nawasunda's identity (the
era-reactive particle field, the asymmetrical archive grid, the editorial
rail, the honest empty states, the real navigation) were verified in
detail and preserved rather than disturbed for the sake of a bigger diff.

Re-run after this round: `pnpm check` clean, `pnpm test` 333/333,
`pnpm build` succeeds end-to-end, `pnpm audit:layout` unchanged (the same
two pre-existing, out-of-scope `studio.css` findings, no new ones). Dev
server HTML was diffed directly for `/about`, `/visuals`, and `/universe`
to confirm the stat-box is gone from the first two and still present on
the third, and the EditorialKit CSS served by the dev server was fetched
directly to confirm the CTA panel's new, de-boxed rule is live.
