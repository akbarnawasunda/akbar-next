# Reference analysis: martingarrix.com → Akbar Nawasunda

Status: **analysis and principles only.** No layout, component, copy, or style changes were made. Implementation priorities are at the end and need a decision before any work starts.

Purpose: understand _why_ the Garrix site is pleasant to browse and scroll, then translate that into principles that fit Akbar Nawasunda's identity. Nothing here is meant to be copied visually.

---

## 0. Method and limits (read this first)

**Garrix site: partial evidence only.**

- I read the rendered markdown of `/`, `/music/`, and `/tour/` through the page fetch tool. That gives section order, copy, catalogue data, and image crop/size parameters from the CDN URLs.
- Direct network access to `martingarrix.com` is blocked in this sandbox. I could not inspect the live DOM, computed type sizes, easing, transitions, hover states, or mobile layout.
- Anything below about Garrix motion, hover, type scale, or mobile behaviour is marked **unverified**. I have not assumed it.

**Akbar site: directly measured.**

- Ran the local Vite dev build and captured full-page and viewport screenshots at 1440px and 390px.
- Measured computed heading sizes from the DOM.
- Read `Home.tsx`, `SignatureStage.tsx`, `Reveal.tsx`, `MotionOrchestrator.tsx`, `RouteTransition.tsx`, `SceneKit.css`, `DESIGN.md`, and `docs/design-language.md`.
- Caveat on my own captures: full-page screenshots do not trigger reveal animations. Sections looked empty in a full-page capture but rendered correctly in viewport captures. Every "empty" claim below was checked in a viewport capture.

---

## 1. What the Garrix pages actually show (verified structure)

### Homepage order (rendered content)

1. Cookie and fraud-warning notice (utility, not design).
2. **Tour:** six photos in one fixed 808×556 frame, each with a fixed crop. Event names are listed as short uppercase lines. One CTA ("Get your tickets") closes the group.
3. **Live set:** one video thumbnail and one line of copy.
4. **Latest releases:** five square 816px artwork tiles, each with title and artist. One "View all releases" link.
5. **Episode video:** one thumbnail and one line.
6. **Photo essay:** 1584×1040 landscape photos interleaved with short statement lines ("I'd like to make a little difference…", "Living life to the fullest!", "Family is everything.", "Life is crazy!").
7. Social links.

The first content after the notice is the tour row. There is no name-led hero heading in the rendered markdown. A full-bleed background image would not appear in markdown, so I cannot rule one out.

### /music/

- A large featured "new release" block at the top, with one link to "Read the story".
- Year filter chips (All, 2026, 2025, 2024…).
- One long chronological list. Each row shows date, title, artist, and "More info". Roughly 80 entries.

### /tour/

- One chronological list. Each row shows date, event name, city and venue, and "Get Tickets".

### Principles the structure reveals

**A. Frames are fixed, content varies.** Every tile type has one size: 808×556 for tour photos, 1584×1040 for the photo essay, 816 square for covers. The variety on the page comes from content type, not from new styles or new frames. Consistent frames make the scroll predictable.

**B. Text is one line or one title plus metadata.** The homepage has almost no paragraph copy. Long-form text lives on subpages or outside the site.

**C. Statement lines act as breath between photo groups.** They sit between image groups as their own beats. Their rendered size is unverified, but they are structurally separate from body text.

**D. Dates are the primary index in lists.** Both tour and music scan by date down one column. Each row has one action.

**G. Each group ends with one exit.** "Get your tickets" follows the tour tiles. "View all releases" follows the release tiles. The action is placed once per group, not on every row.

**H. Image crops are standardised.** Mixed photography (stage shots, lifestyle shots, cover art) is cropped to a fixed ratio via CDN parameters. The result is visually unified without a filter or overlay.

---

## 2. Scroll experience

### What creates momentum (principles)

1. **Alternate content types, not just sizes.** The sequence is tile row → single statement → list → square covers → photo sequence → statement. Each change of type gives the eye a reason to stop and a reason to continue.
2. **Roughly one visual event per screen.** Each viewport is dominated by one image group or one statement. This is inferred from order and frame sizes, not measured.
3. **Wayfinding is by content, not by chapter markers.** `PublicMotion.css` already states that editorial pages use labels, not numbered chapter markers. Garrix relies on dates, years, and venue names to orient the reader in lists.
4. **Silence is a single line, not an empty field.** A statement line between photo groups reads as a breath because it has content.

### What we should not copy

- The exact sequence (tour → video → covers → photo essay → social).
- The lifestyle photo essay. Akbar's imagery is controlled portrait and archive material.
- Cover-tile grids as the main scroll device.

---

## 3. Visual hierarchy: Akbar measured against the principle

### Measured heading sizes (computed, desktop 1440px)

| Element                                    | Font size           | Notes             |
| ------------------------------------------ | ------------------- | ----------------- |
| Hero H1 "AKBAR NAWASUNDA."                 | 93.6px              | display face      |
| Signature wordmark (SignatureStage)        | 144px               | display face      |
| "YANG SEDANG BERJALAN." (EditorialSection) | 66.2px              | display face      |
| "Dengar di kanal resminya" (channels)      | 60.5px              | display face      |
| "MAIN JEDAG RUN." (game teaser)            | 79.2px              | display face      |
| "BAWA SUARA INI KE PANGGUNGMU." (CTA)      | 51.8px              | display face      |
| "JANGAN KETINGGALAN." (fan signal)         | 57.6px              | display face      |
| Pause quote "Breakbeat, electronic bass…"  | ~12px (`--step--1`) | 46% paper opacity |

Music page: H1 "Musik" at 96px. Three section titles at 60px. CTA at 72px.

Mobile (390px): the same headings scale to 29–47px. The hero H1 is 41px.

### What this shows

- **Too loud.** On the home page, seven heading-scale blocks at 52–144px sit in one scroll. All are set in the display face. The DESIGN.md anti-pattern "oversized fragmented headlines used everywhere" (§7) describes this exact pattern. The site violates its own guardrail.
- **Too repetitive.** Most sections repeat one template: display heading, small metadata line, one or two buttons. The sections do not look like different kinds of content.
- **Too quiet, in one place.** The pause band is the clearest problem. The quote is ~12px, low-contrast (about 4.2:1 by my estimate, below 4.5:1 for small text), centred in a dark band with `min-height: clamp(260px, 38vh, 440px)`. In the 1440px viewport it reads as an unfinished empty section, not as a breath. The DESIGN.md intent ("silence is part of the design") is not met.
- **Repetitive headings on the Music page.** The page title "Musik" is a one-word nav label set at 96px. That is louder than the page needs.

### What already works (keep)

- The channel list (`Dengar di kanal resminya`) is an index of typographic rows: icon, wordmark, arrow. It has the same logic as Garrix's date rows but is more distinctive. In the viewport capture it reads well.
- The paper-coloured channels section is a deliberate light beat in a dark site. It is the most effective pacing device I saw in the captures.

---

## 4. Media presentation

### Garrix (verified from CDN parameters)

- Fixed frames per type. Crops are set by the image pipeline, not by the designer on each page.
- Covers are shown square at 816px in a tile row.
- Photos are shown 3:2 or close to it.
- Alt text describes mood and light ("blue lights with the smoke give this picture a blue tint"). It is useful for accessibility and tells a visitor what the image is for.

### Akbar (measured and read)

- The hero portrait is the dominant visual at 800×1000. This is strong.
- The release document is artwork plus story plus an inline "play here" control. It is media-first, and it is better than Garrix's link-out release tiles. Keep it.
- Several media types (portrait, release art, channel icons, video, Universe archive) do not share a documented frame system.

### Principle

**Set media scale by role, not by page.** Define three named frame roles, each with one aspect ratio and one size range:

- **Feature:** the hero or the current release. Largest scale.
- **Archive:** the catalogue, Universe, or Visuals grid. Medium scale, one fixed ratio.
- **Thumbnail:** platform or inline use. Smallest scale.

Mixed photography then stays consistent without filters or overlays. This is a principle, not a visual treatment to copy.

### Do not copy

- The square cover grid as the main release display.
- The mixed lifestyle photo essay.

---

## 5. Interaction: meaningful versus decorative

### Meaningful (keep)

- **Route progress line** (`RouteTransition.tsx`): immediate click feedback, with a 160ms minimum visible time and a 180ms exit. This keeps the acknowledgement visible without delaying a fast route.
- **Scroll-driven signal stage with phrase jump buttons** (`SignatureStage.tsx`): scroll is also navigation. Buttons compute a scroll target and call `window.scrollTo`. Reduced-motion users get an instant jump. Scrolling is not intercepted.
- **Release player toggle** (`aria-expanded`): one state, one clear control.
- **Scroll progress bar** (`ScrollProgress.tsx`): tells the user where they are on long pages.

### Decorative, or at risk of being decorative

- **Magnetic hover on the primary hero CTA** (`data-signal-magnetic`). A pull effect on the main call to action adds motion without adding information. It also stacks with the particle field, the custom cursor, and the mascot. DESIGN.md §6 warns against several pointer effects in one zone.
- **Persistent floating player bar.** In the viewport captures it sits over the game teaser card and the channel rows. DESIGN.md §12 says the hero should not contain an always-visible player. The global player is not the hero, but it covers content. This is a real conflict.

### Garrix (unverified)

Filters, "More info", and "Get Tickets" are functional links. I cannot judge their hover or transition behaviour.

---

## 6. Motion rhythm

### Garrix

Unverified. I have no evidence of its motion beyond what the markup structure suggests. I will not describe easing, durations, or transitions.

### Akbar (read from code)

Akbar has several motion systems running at once:

1. Lenis smooth scrolling (`SmoothScroll.tsx`, `setupSmoothScroll`).
2. A particle field (canvas), with drift and magnetic response.
3. A scroll-bound sticky wordmark stage.
4. Three reveal mechanisms:
   - `useScrollReveal` (channels, pause, game teaser).
   - `<Reveal>` (release document).
   - `MotionOrchestrator`, which applies `reveal-pending` to every `main > section:not(.reveal-target)`.

   The channels section and the pause band are direct children of `main`, so they can receive both `useScrollReveal` and `MotionOrchestrator` behaviour. I have not verified this at runtime. It is a risk, not a confirmed bug.

5. Route progress and a route curtain.
6. Staggered word-mask entrance in the hero title (`--hero-word-index`).

### Principle

**Motion needs one owner and one grammar per zone.**

- Use one entrance grammar: one distance, one duration, one easing.
- Assign each section to one reveal system. Do not stack three.
- Reserve scroll-bound motion for the signal stage.
- Allow one pointer effect per zone.

Motion becomes a design language when it is consistent and rare. Right now the entrances are uniform, but the number of systems is high. That combination makes the site feel busier than its content.

---

## 7. Responsive design

### Garrix

Unverified. I could not measure its mobile layout.

### Akbar (measured at 390px)

- The home page keeps the same nine sections in the same order. Desktop is 8790px tall; mobile is 8267px. The mobile version is a shrink, not a restructure.
- Headings scale down to 29–47px, which is reasonable.
- The navigation collapses to a drawer (`MobileNav.tsx`).
- The channel list and the release document both stack without breaking.

### Principle

**Mobile should reduce the number of beats, not only the size of type.** Nine sections in the same order on a phone means nine scroll pauses. Candidates for merging or hiding on small screens are the pause band and one of the two CTA panels. This needs a content review before changing anything.

---

## 8. Content density

### Garrix

Each group carries about one statement and one exit. Long text is not on the homepage.

### Akbar

Each editorial section carries a display title, a lede, a metadata line, and often two buttons. Seven sections use this pattern.

### Principle

**Give each section one job and one exit.** Title, one object, one action. Put detail on its own page. Akbar already does this for Universe, Music detail, and EPK. Apply the same logic to the home-page editorial sections, so that a section does not also carry a second CTA and a long lede.

---

## 9. Page personality

### Garrix

Three reading modes under one brand:

- Home: a feed of stories and images.
- Music: an archive index sorted by date.
- Tour: a date table.

### Akbar

Five or more route types:

- Home: scene and narrative.
- Music: catalogue.
- Live: schedule.
- Universe: archive.
- EPK: document.

DESIGN.md §5 already defines this (Home active, Music structured, Visuals observational, About restrained). The problem is execution: Home and Music both use the same display-heading-plus-CTA template instead of their own reading mode.

### Principle

**Each route has one reading mode.** Scene, index, document, or archive. The signal runs through all of them. Cohesion comes from a shared material and a shared rhythm of light and dark, not from identical sections.

---

## 10. Comparison table

| Reference principle                               | Akbar current state                                                          | What could improve                                                                       | What should not be copied                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Fixed frames per media role                       | Hero, release, channels, and archive media have no shared frame system       | Define feature, archive, and thumbnail roles with one ratio each                         | Square cover grid, lifestyle photo essay                                        |
| One line of text between image groups as a breath | Pause band has a ~12px quote at 46% opacity in a 260–440px band              | Give the pause a readable line, a legible index, or the aksara plate; or shrink the band | Tweet-like statements such as "Life is crazy!"                                  |
| Dates as the index in lists                       | Channel rows and the signal board are already index-like                     | Use date or year as a visible key in Music and Live                                      | Year chips with 80 entries (catalogue too small)                                |
| One exit per group                                | Sections often carry a lede, meta, and two buttons                           | One primary action per section                                                           | Link-out-only cards                                                             |
| Mixed type scale, large sparingly                 | Seven display-scale headings in one home scroll                              | Cap display scale at about three per page; the rest drop to 28–44px                      | Marquee-style repeated uppercase lines (DESIGN.md §7 bans endless marquee text) |
| Motion is rare and consistent                     | Three reveal systems, a sticky stage, Lenis, particles, cursor, magnetic CTA | One reveal owner per section; one pointer effect per zone                                | Motion copied from any reference we have not verified                           |
| Mobile reduces beats                              | Mobile keeps all nine sections in order                                      | Merge or hide one or two beats under ~700px                                              | Desktop layout shrunk down                                                      |

---

## 11. What Akbar does better or more uniquely (keep)

- **Release document** with artwork, story, and an inline player. This is more intimate and more media-led than Garrix's link-out tiles.
- **Signal stage with particle-spelled name and scroll-driven phrases.** Scroll is used as narrative and as navigation. Reduced-motion and fallback paths are implemented and tested (`signatureRuntime`, `motionFallback`, `scrollReplayAndStudioMap` tests).
- **Sundanese script plate** (aksara). It carries identity without folkloric decoration.
- **Light and dark alternation** (paper channels section, dark pause band). The most effective pacing device in the captures.
- **Channel list as typographic rows.** Index-first, with icon, wordmark, and arrow.
- **Existing wayfinding:** scroll progress, route progress line, and a sticky header with clear active states.
- **JEDAG RUN** as an independent play layer. Garrix has no equivalent in its public pages.
- **Editorial darkness with real photography.** The portrait carries the hero.

---

## 12. Principles for Akbar Nawasunda

These are the design principles that follow from the study. They are written for Akbar, not for Garrix.

**P1. Scale is earned.** One display-scale statement per viewport at most. Across a page scroll, cap display-scale headings at about three. Everything else sits at 28–44px. Display type is a moment, not the default.

**P2. Silence must be legible.** A quiet beat needs either content (a readable line, an index, a date) or a clear visual mark (an aksara plate, a single fine rule). No empty minimum-height band without a job. Text in silence must meet 4.5:1 contrast.

**P3. Every section has one job and one exit.** Title, one object, one action. Detail lives on its own route.

**P4. Frames are assigned by role.** Feature, archive, and thumbnail, each with one ratio and one size range. Mixed photography stays consistent through the frame system, not through overlays.

**P5. Lists are indexed.** Date, year, or index number leads each row in Music and Live. Channel rows already prove this pattern.

**P6. Motion has one owner and one grammar.** Each section is controlled by one reveal system. One entrance distance, duration, and easing across the site. Scroll-bound motion is reserved for the signal stage. One pointer effect per zone.

**P7. Persistent UI does not cover content.** The global player must dock, collapse, or hide on pages and sections where its own player is visible, and must not overlap cards or text. This follows DESIGN.md §12.

**P8. Mobile reduces beats, not only size.** On small screens, merge or drop one or two sections where the content allows, so the number of scroll pauses falls.

**P9. Identity carries silence.** Use the Sundanese aksara plate, the particle field, or a single fine rule as the quiet beats. This turns a blank band into a deliberate moment that belongs to Akbar.

**P10. Each route has one reading mode.** Scene (Home), index (Music, Live), document (EPK), archive (Universe). Shared material and rhythm, not identical sections.

---

## 13. Implementation priorities

These are ordered by value and risk. Nothing here has been implemented. Please confirm the order before any work starts.

1. **Display-scale audit (low risk, high impact).** Reduce 4 of the 7 home-page display headings to the 28–44px range, starting with the signal title, the CTA, and the fan-signal title. Keep the hero, the signal stage, and one closing moment at display scale. Verify with the existing `typographyFloor` test.
2. **Pause band fix (low risk).** Raise the quote to a readable size and contrast, or add the aksara plate, or cut the minimum height. The current state reads as an accident.
3. **Global player placement (medium risk).** Dock or hide the floating player where a card or embed sits underneath. Confirm the behaviour with the user before changing it.
4. **Reveal ownership (medium risk).** Verify at runtime whether channels and pause receive both `useScrollReveal` and `MotionOrchestrator`. If they do, assign each section to one system.
5. **Media frame roles (medium risk).** Document three frame roles in `docs/design-language.md` first, then apply them to the existing media.
6. **Mobile beat trim (needs content review).** Decide which beat to merge or hide under 700px before touching the layout.
7. **Pointer effect audit (low risk).** Keep one pointer effect per zone. Consider removing magnetic from the primary hero CTA, since the particle field and cursor already respond to the pointer.

Verification after each step: `pnpm check`, `pnpm test`, `pnpm audit:layout`, and a viewport capture at 1440px and 390px.

---

## 14. Summary: what Akbar can learn without imitating

Garrix's site works because its frames are consistent, its text is brief, its lists are indexed by date, and each group ends with one exit. Those are structural habits, and they transfer to any artist.

Akbar's current site is not weak in identity. It is loud in one place (seven display headings in one scroll), quiet by accident in another (the pause band), and it runs more motion systems than its content needs. The fixes are about restraint and ownership: fewer display moments, legible silence, one motion grammar, and a global player that does not cover the work.

The distinct parts of Akbar's identity (aksara, the particle signal, the release document, the JEDAG RUN layer, and the editorial darkness with paper beats) should stay exactly as they are. They are the parts that make it impossible to mistake this site for anyone else's.

---

## 15. Decisions applied (implementation pass)

This section records what was changed, not a new study. Visual checks were done at 1440px and 390px on the running dev build.

**Typography: four registers, assigned by content role** (`--display-*` in `index.css`)

- `statement` (closing CTA): 60px at 1440. Used once per page.
- `route` (page title): 63px desktop, 37–47px mobile. Was 74–96px on every route.
- `section` (informative headings and the release title): 48px desktop, 32px mobile. Was 60px on every route.
- `index` (headings directly above data rows, e.g. channels and "technical" titles): 33px desktop. Was 60px.
- Hero, the particle wordmark, and JEDAG RUN keep their own identity scale.

**Pause band: a deliberate interruption**

- Solid ink background, so the particle signal goes silent in the band.
- Shorter than neighbouring sections (150–230px).
- Quote left-aligned on the editorial gutter, readable (1.15–1.65rem, 76% paper), replacing the 10px centred quote at 46% opacity.

**Global player: listening surface, not a widget**

- Hidden on arrival. It appears only after something plays.
- Entry point: "Putar di sini" in the home release document. Its inline embed was removed, so there is one player.
- Flat bottom bar, full width. The embed shelf opens upward, so controls never leave the bottom edge.
- Paused and minimised states drop the filled accent button.
- Hidden and paused on JEDAG RUN routes (ID and EN).
- Reserved page padding matches the bar height, so footer and last catalogue rows sit above it.

**Motion: one arrival grammar, one owner per section**

- Shared tokens: `--motion-arrive` (560ms), `--motion-ease-arrive`, `--motion-travel` (18px).
- Replaced 42px/720ms, 20px/760ms, and 18px/520ms variants.
- The pause band and game teaser no longer run a second reveal; the global orchestrator owns them.
- The channel list keeps its per-row stagger, because the row sequence is the index's meaning.

**Pointer effects**

- Removed magnetic pull from the hero CTAs. The cursor and particle response remain.

**Mobile header**

- Hid the "Dengarkan" header button under 480px, where it collided with the wordmark. The menu drawer still links to music.

**Route personality**

- The existing per-route signal modes in `routeSignal.ts` are unchanged; they were already the right model.

**Verified**

- `pnpm test`: 59 files, 347 tests pass. `tsc --noEmit` clean.
- `pnpm audit:layout`: two errors in `client/src/studio/studio.css` (an overflow-x hidden and a backdrop-filter on a studio surface). Both are pre-existing and outside this change.
- ID and EN parity confirmed for heading tiers, pause text, and the play action.

**Known limits**

- SoundCloud embeds cannot load in the sandbox, so the playing shelf shows a blank white frame here. The embed's own colour in production is not verified.
- Mobile was checked for the home page and header. Other mobile routes were checked by heading metrics only, not by eye.
