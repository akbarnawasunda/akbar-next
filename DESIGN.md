# Akbar Nawasunda — Public Website Design Handoff

> **Purpose:** a complete rebuild brief for another AI/design agent.
>
> **Reference version:** the established public-site direction that existed **before the experimental `Pressure / Roots` redesign**. Do **not** use the recent Pressure/Roots layout, its oversized jagged headlines, floating fixed player, sparse black voids, or poster-index treatment as the visual reference.
>
> **Scope:** public-facing website only. Exclude `/studio`, `/studio/inquiries`, `/studio/broadcasts`, `/admin`, and `/assets` from the design task.
>
> **Language priority:** Indonesian first, with a complete English mirror. The two languages must have equal information architecture and capability.

---

## 1. Product in one sentence

Create a dark, image-led official artist website for **Akbar Nawasunda**, a producer / remixer / DJ from **Bandung Barat, Indonesia**, where the experience feels like a calm nocturnal editorial record of music, visuals, live work, and artist history—not a SaaS dashboard, festival template, or over-decorated cyberpunk poster.

The emotional balance is:

- **Cinematic, but not glossy**
- **Electronic, but not neon-noisy**
- **Rooted in Bandung Barat / Sunda, but not folkloric costume design**
- **Editorial, but not museum-static**
- **Playful enough for the mascot and JEDAG RUN, but still credible for press, licensing, and booking**

---

## 2. Non-negotiable design direction

### Keep

1. A dark, near-black public surface with a muted steel-blue signal accent.
2. Real imagery as the main visual material: official portrait, release art, video thumbnails, portrait studies.
3. Fine rules, measured whitespace, mono metadata, and asymmetric editorial grids.
4. One understated mascot doodle as a recurring companion, never as repeated decoration.
5. A subtle “signal / transmission” language: small live dot, route sweep, restrained particle field, and precise cursor response.
6. Direct links to official platforms and clear booking / licensing paths.
7. Indonesian copy first, full English parity second.

### Do not do

1. Do **not** use the Pressure/Roots visual system or its giant fragmented display typography.
2. Do **not** put fixed UI over reading content. A player, palette trigger, cursor UI, or badge must never cover a CTA, title, image, or form.
3. Do **not** cover every section with particles, grain, grid, glow, circles, labels, and motion simultaneously.
4. Do **not** use generic rounded cards, glassmorphism, thick shadows, gradient blobs, or “dashboard” modules.
5. Do **not** use bright cyan, purple, hot pink, lime, or multicolor neon. There is one restrained blue-grey accent.
6. Do **not** invent tour dates, press quotes, release credits, platform links, awards, or biography facts.
7. Do **not** force-load third-party embeds. Official embeds must be interaction-triggered and have direct-link fallbacks.
8. Do **not** hide content behind animation or require scrolling tricks to read the page.

---

## 3. Brand and visual foundation

### 3.1 Palette

Use these as the canonical starting palette. Maintain contrast; do not introduce unrelated accent hues.

| Token | Value | Intended use |
| --- | --- | --- |
| `ink` | `#101211` | primary page background |
| `ink-soft` | `#171A18` | alternate dark surface / media backplate |
| `ink-card` | `#1B1E1C` | contained player or input surface only |
| `ink-hover` | `#232724` | hover fill for rows and controls |
| `paper` | `#F1EFE9` | primary light text and light editorial surfaces |
| `paper-soft` | `#D5D2CA` | secondary light text |
| `signal` / `acid` | `#9BB9C1` | only brand accent: CTA, live dot, active underline, focus |
| `mute` | `#A6A69F` | secondary metadata |
| `mute-soft` | `#777A74` | non-essential micro-copy only |
| `state-ok` | `#7CF2A4` | form success only |
| `state-err` | `#FF7B72` | form error only |

### 3.2 Surface rules

- Default background: `ink`.
- Use `paper` as an occasional full-width editorial break (for example: featured release or press sheet), not as a small card.
- Rules are 1px and low contrast: white/paper at roughly 13–16% opacity on dark; ink at roughly 16% opacity on paper.
- Corners are square or nearly square (0–2px). Use a true circle only for the mascot frame, a badge, or an intentional record/disc control.
- No decorative blur. No glow shadows. If depth is needed, use crop, contrast, a rule, an offset plate, or solid stacking.

### 3.3 Typography

The source site has self-hosted brand faces. Another AI may use the available files or close local substitutes, but must preserve the hierarchy—not copy a distorted display treatment everywhere.

| Role | Original role / suggested behavior | Rules |
| --- | --- | --- |
| Primary display | `Recons` | brand-only hero/title moments; use sparingly and never so large that a word breaks unintentionally |
| Secondary display | `NEXROID` | section titles and selected release names; not body copy |
| UI / body / metadata | `Good Times` or a clean geometric sans fallback | navigation, paragraphs, form controls, lists, labels |
| Latin signature | `Towards` | only adjacent to Sunda script / identity signature |
| Sunda script | `Noto Sans Sundanese` | actual Aksara Sunda only |
| Game | `Fluorite` | isolated to JEDAG RUN only |

**Readability rule:** normal reading copy must be a clean sans at approximately 15–17px with 1.55–1.7 line height. Display faces should never be used for paragraphs, dense lists, platform names, form fields, or long release titles.

### 3.4 Type hierarchy

Use three levels in one viewport whenever possible:

1. **Display:** one dominant title / release / artist name.
2. **Reading:** one lead paragraph or supporting sentence.
3. **Metadata:** kicker, date, platform, index, caption, and status.

Recommended sizes:

| Element | Desktop | Mobile |
| --- | --- | --- |
| Hero title | 64–96px, fluid | 42–58px, fluid |
| Section title | 36–56px | 30–40px |
| Release title | 28–44px | 24–32px |
| Body | 15–17px | 15–16px |
| Metadata | 10–12px | 10–11px |

Use uppercase and increased tracking only for metadata/UI, not body copy. Long words must wrap safely at 320px.

---

## 4. Global public shell

### 4.1 Desktop navigation

A compact sticky masthead, not a giant control console.

**Left**
- Logo badge (about 30–34px).
- Text lockup: `AKBAR NAWASUNDA` and `Producer · Remixer · Bandung Barat`.

**Center**
- `Musik`
- `Visual`
- `Perjalanan`
- `Tentang`
- `EPK`
- `Kontak`
- `Jadwal` is added only when a confirmed event exists.

**Right**
- ID / EN language switcher.
- One compact `Dengarkan` CTA linking to `/music`.
- Menu button only when navigation collapses.

**Behavior**
- Sticky after the top edge.
- Hairline bottom rule.
- Home can begin visually behind a slightly transparent version; after ~32px scroll it becomes solid.
- Active item gets a 1–2px signal underline.
- Keyboard shortcuts may remain: `M` music, `V` visuals, `E` EPK, unless focus is in a form field.

### 4.2 Mobile navigation

- Header: logo / wordmark, `Dengarkan`, menu button.
- Open a full-height dark drawer from the right.
- Each link has a visible index, page title, and short descriptor.
- Include language switcher in the drawer footer.
- Focus must be trapped; Escape and a close button must work; background scrolling is locked while open.
- Touch targets are at least 44–56px high.

### 4.3 Footer

The footer is a quiet colophon.

- Brand block: logo, artist name, `Producer / Remixer / Indonesia`.
- Small mascot link back to home.
- Explore column: Music, Visual, Live, Journey, About, JEDAG RUN.
- Contact column: official platforms, EPK/booking, privacy.
- Bottom row: copyright, Bandung Barat / WIB studio clock, optional birthday chip.
- It must not become a giant second homepage or use oversized display type.

### 4.4 Global layers

Only keep layers that add purpose:

| Layer | Behavior | Constraint |
| --- | --- | --- |
| Scroll progress | 1px top-line only | no large progress widget |
| Route transition | short signal sweep | 350–600ms; no blocking preload screen |
| Particle field | ambient / route transition only | low density; disabled or lite on touch/reduced motion; never obscure text |
| Cursor signal | fine-pointer only | small dot/ring; no permanent heavy RAF loop; native cursor remains usable |
| Command palette | Cmd/Ctrl+K | hidden until invoked; no floating trigger over content |
| Audio player | user-initiated only | no autoplay, no initial floating obstruction, closed state remembered |

---

## 5. Public route map

Every Indonesian public page has an English equivalent unless noted.

| Indonesian route | English route | Page role |
| --- | --- | --- |
| `/` | `/en` | Home / artist entry point |
| `/music` | `/en/music` | Music catalogue |
| `/music/:slug` | `/en/music/:slug` | Release detail |
| `/visuals` | `/en/visuals` | Video and portrait archive |
| `/live` | `/en/live` | Live dates and booking route |
| `/universe` | `/en/universe` | Artist journey / archive |
| `/about` | `/en/about` | Artist profile |
| `/epk` | `/en/epk` | Press and booking kit |
| `/inquire` | `/en/inquire` | Booking / collaboration form |
| `/licensing` | `/en/licensing` | Music licensing information |
| `/privacy` | `/en/privacy` | Privacy policy |
| `/game/jedag-run` | `/en/game/jedag-run` | Standalone browser game |
| `/visuals/portraits` | `/en/visuals/portraits` | Redirect to `/visuals#portraits` |
| unknown route | matching locale | Branded 404 |

All routes need server-rendered meaningful content, canonical URLs, `hreflang` for ID/EN/x-default, social metadata, and a real `<h1>`.

---

## 6. Page-by-page design specification

## 6.1 Home (`/`)

### Job
Introduce the artist quickly, prove that the work is active, and give three immediate exits: listen, view visuals, or make an inquiry.

### Composition

#### A. Cinematic hero
- Full first-screen composition with a **single official portrait** on the right or as a full-bleed image plate.
- Left/lower-left contains the artist name, small signal kicker, Aksara Sunda plate, short profile, and two CTAs.
- A dark scrim keeps type readable over the portrait.
- Place the mascot doodle once as a small companion on the portrait edge; it must read as intentional, not as a sticker collage.
- Hero metadata: `Bandung Barat`, `Since 2020`, `Breakbeat / Indo Bass`.
- CTA 1: current release / listen. CTA 2: visuals.
- Small scroll cue at the edge.

#### B. Signature stage
- One contained “signal” stage after the hero. It may show the official name / alias relationship through subtle particles or typography.
- The alias must remain readable in DOM text: **DJ Akbar Remix** and **Akbar Nawasunda**.
- Do not place a giant particle wordmark over the hero portrait.

#### C. Current signal board
- An editorial status strip for current release, next confirmed event (if any), and booking/contact.
- Use rows, not cards.
- If no confirmed live event exists, show an honest booking-oriented state rather than a fake date.

#### D. Featured release document
- Two-column layout: square release artwork on one side, story/metadata/actions on the other.
- Title, format, year, platform, and direct official link are clear.
- “Play here” lazily opens a contained official player. “Open release” goes to the platform.
- No iframe is present before the user requests it.

#### E. Official channels
- Typographic platform list: Spotify, YouTube, SoundCloud, Instagram, Apple Music, Deezer, Amazon Music, Tidal, TikTok, X as available from CMS.
- Use a platform icon and an outbound arrow per row.
- A restrained platform marquee/rail is acceptable on desktop; on mobile it becomes a static wrapping row.

#### F. Short pause / identity transition
- One low-visual-noise section that gives the page breathing room. It can use a dark panel, one short line, and a field/rule—not another hero.

#### G. JEDAG RUN teaser
- A small distinct invitation to the public browser game.
- This is the only place where playful game energy is appropriate on the main site.
- Show one clear CTA; do not embed the game in the home page.

#### H. Private signal / newsletter
- The only signup form in the public experience.
- Explain the benefit: releases, studio notes, and live news.
- One email field, consent/short privacy note, success/error state.

### Home anti-patterns
- No giant three-line fragmented artist name.
- No fixed audio shelf covering the release section.
- No more than one major photograph above the fold.
- No repeated “listen now” cards.

---

## 6.2 Music (`/music`)

### Job
A usable official discography, not merely an artwork gallery.

### Sections

1. **Catalog hero**
   - Large current release artwork.
   - Page title: `Music` / `Official discography`.
   - Brief explanation of originals and remixes.
   - A clear scroll/anchor to the catalogue.

2. **Featured current release**
   - Artwork, release title, format/year/platform, short context, direct platform CTA, release detail CTA.
   - Keep it contained, readable, and image-led.

3. **Official listening routes**
   - Rows for official platforms, not icon-only links.
   - Each outbound link names its destination accessibly.

4. **Release rail / archive**
   - Horizontal rail allowed on desktop with visible previous/next buttons, native scrolling, keyboard focus, and a “swipe to view” cue.
   - On mobile, convert to an accessible vertical list or full-width cards—never a tiny, inaccessible horizontal strip.
   - Each item has artwork thumbnail, index, title, format, year, platform, and release-detail route.

5. **Licensing / remix band**
   - Full-width editorial CTA to licensing and inquiry, not a promotional card.

### Original catalogue facts to retain
- Catalog includes original work under **Akbar Nawasunda** and remixes/bootlegs under **DJ Akbar Remix**.
- It spans 2024–2025 and official links vary by release (Spotify, Apple Music, SoundCloud, etc.).
- Never fabricate platform availability or credits.

---

## 6.3 Release detail (`/music/:slug`)

### Job
A release is a document with context, not a generic product page.

### Required composition

- Back link to Music.
- Dominant square artwork with a stable intrinsic ratio.
- Release title, format, year, platform, and rights/clearance language where relevant.
- One short story/context block.
- Official direct link(s).
- Optional official SoundCloud/YouTube player that loads only after an explicit click.
- Related route: back to full catalogue and inquiry/licensing.
- Missing release page has an honest `Release not found` state and a return link.

---

## 6.4 Visuals (`/visuals`)

### Job
Present moving image and portrait work as an archive, not a social feed.

### Sections

1. **Visual hero**
   - Large anchor portrait or still.
   - `Visual` title, short explanation, YouTube CTA, anchor to portrait studies.
   - Facts: number of videos, portraits, channel.

2. **Screening room**
   - One or two official YouTube pieces.
   - First item can be visually larger.
   - Use play-to-load `youtube-nocookie` embeds; otherwise show poster, title, provider, and a direct YouTube link.

3. **Visual archive**
   - Asymmetrical grid or density-based editorial grid, not identical cards.
   - Filter bar only when there is useful content to filter.
   - Item opens official source or in-site detail/lightbox as appropriate.

4. **Portrait studies (`#portraits`)**
   - Lead frame plus image grid.
   - Open images in a full-screen lightbox with title/caption, count, arrows, Esc, close button, and focus management.
   - The old `/visuals/portraits` route redirects here.

5. **Closing CTA**
   - Link to music, inquiry, or portrait anchor depending on content.

---

## 6.5 Live (`/live`)

### Job
Be trustworthy about live availability and offer a professional booking path.

### States

- **If a confirmed event exists:** show date, city, venue/title, status, official outbound/location link if available, and a small next-show feature.
- **If no confirmed event exists:** use a clear, honest empty state: headline, one sentence, booking CTA. Do not fake an event poster.

### Sections

- Live hero with an official stage image.
- “Next show” feature or honest empty state.
- Event index/timeline with chronological rows.
- Booking CTA and direct inquiry route.

---

## 6.6 Universe / Journey (`/universe`)

### Job
Explain the movement from DJ Akbar Remix to Akbar Nawasunda.

### Sections

- Archive hero with a short thesis: one catalog, several chapters.
- Timeline/era index with year, alias, role, and release/artwork references.
- Studio note or one visual artifact.
- Route cards/links into Music and Visuals.

### Tone
Editorial and factual. This page should feel like a concise archive, not an autobiography with invented mythology.

---

## 6.7 About (`/about`)

### Job
Provide a credible artist profile for listeners, curators, and collaborators.

### Sections

- Portrait-led hero and concise location/role line.
- Biography with comfortable reading measure (max ~62ch).
- Artist vocabulary/band: producer, remixer, DJ; breakbeat, Indo Bass, local-language material.
- Short factual outline/timeline.
- Direct CTA to EPK or inquiry.

---

## 6.8 EPK / Press Kit (`/epk`)

### Job
A professional downloadable/readable kit, optimized for promoters, media, and booking teams.

### Sections

1. Hero: artist title, concise press positioning, primary download/contact actions.
2. Summary: verified bio, base, genres, role, aliases.
3. Assets: approved portraits/logo/artwork previews and download links where available.
4. Selected releases: rail/list with titles, years, platforms, official links.
5. Contact/booking: explicit contact route, direct email if configured.
6. Platform list: official listening/social channels.

Design it like a clean press sheet: pale editorial surface is allowed, dense facts, simple rules, no decorative clutter.

---

## 6.9 Inquiry (`/inquire`)

### Job
Turn an interest into a well-structured brief without hiding the direct contact route.

### Layout

- Hero with a concise reason to contact the artist.
- Left/context column: types of work, response expectation, direct email/official contact.
- Right/form column with three clear field groups:
  1. About you: name, email, organisation.
  2. Plan: inquiry type, project date/budget where applicable.
  3. Brief: project details and links.
- Keep labels above inputs; do not rely on placeholders.
- Submit states: idle, sending, success, retry/error.
- Preserve query-string context such as `?type=remix` or `?source=home` when it exists.

---

## 6.10 Licensing (`/licensing`)

### Job
Explain how to ask for rights without pretending to offer legal advice beyond the available content.

### Sections

- Calm document hero.
- Licensing routes / what the user can request.
- What a complete request should include.
- Clear inquiry CTA.

Use numbered sections, reading-width content, and no media-heavy decoration.

---

## 6.11 Privacy (`/privacy`)

### Job
A readable policy page, not a marketing surface.

### Requirements

- Simple document hero with last-updated information.
- Narrow reading column.
- Sections for short version, collection, cookies, services, user rights, and contact.
- Visible heading hierarchy (`h2`, `h3`), internal anchors if useful.
- No particles, mascot, oversized title, or card grid beyond a compact summary block.

---

## 6.12 JEDAG RUN (`/game/jedag-run`)

### Job
A deliberately separate playable micro-world for the artist’s Jedag Jedug identity.

### Requirements

- Separate game palette/type treatment is allowed here only.
- Header returns to main site.
- Intro: title, how to play, clear start/gate state.
- Game canvas/stage, controls, mute/pause/restart as appropriate.
- Username gate and public leaderboard.
- English parity.
- Must remain responsive and usable by keyboard/touch.
- Do not leak game UI/type into the main artist website.

---

## 6.13 404

- Branded but minimal.
- Honest copy: this route is not on the frequency.
- One route back to home and one route to Music.
- Mascot may appear here as the exception; keep it friendly and light.

---

## 7. Components and interaction specification

### Buttons

| Type | Appearance | Use |
| --- | --- | --- |
| Solid | signal fill, ink text, 1px signal border | primary listen / send brief / main action |
| Quiet | transparent, paper or ink rule, matching text | secondary action |
| Text link | inline, hairline underline, arrow icon when outbound | contextual navigation |

- Uppercase UI labels are okay, but must stay readable.
- Use text plus icon, not icon-only, unless `aria-label` is explicit.
- Hover: small color/border change only; no large translation, glow, or wobble.
- Focus: 2px signal outline with offset; on signal-filled controls use paper outline.

### Media

- Every image has an intrinsic ratio before it loads.
- Hero images get `eager`, `fetchPriority="high"`, and responsive `<picture>` sources.
- All non-critical artwork/portrait thumbnails are lazy-loaded.
- Release art uses a fallback chain to an official social preview rather than a broken image.
- Image captions are small and factual: role, place, provider, format, year.

### Embeds

- YouTube uses privacy-enhanced `youtube-nocookie` URL.
- SoundCloud/YouTube iframe appears only after user click.
- Before click, show a static poster/plate with provider label and play CTA.
- Failure state always offers an official direct link.

### Audio player

If rebuilding the original player:

- Never autoplay.
- It is **closed on first visit**.
- It can become a slim persistent bottom bar only after a user explicitly starts a track.
- Close state is remembered for the session.
- On mobile it uses layout space rather than covering footer/form controls.
- It must never be the default floating bar shown above every page section.

### Forms

- One email signup form lives on Home only.
- Inquiry form uses real labels, `aria-invalid`, `aria-describedby`, and visible messages.
- Input surface: dark card/ink, 1px rule, square corners, clear focus state.
- Do not use animated placeholders or floating labels.

---

## 8. Motion and performance budget

### Allowed motion

- Route enter: 8–12px upward fade, ~420ms, only after client-side navigation.
- Route signal curtain: short sweep, ~420–840ms total.
- Button/row hover: color/border change, 160–220ms.
- Image reveal: one-time fade/crop reveal, no permanent floating.
- Mascot: optional very slow 4–6s float, disabled for reduced motion.
- Particle field: low-density ambient points only, and only on capable desktop devices or during route transitions.

### Motion constraints

- No scroll-jacking.
- No continuous canvas/RAF loop while the user is reading a static page.
- Do not animate title letters individually on every section.
- Do not combine marquee + particle canvas + cursor trail + grain + rotating disc + wave field in the same viewport.
- All `prefers-reduced-motion` users see every content element immediately and get no unnecessary animation.

### Performance constraints

- Code split page routes.
- Lazy-load heavy media and iframe embeds.
- No external font/CDN dependency; use local assets.
- Avoid `filter: blur()`, full-screen backdrop filters, excessive box shadows, or large fixed SVG noise overlays.
- Keep fixed layers to a minimum: header, thin progress line, optional transition/cursor. Nothing else should remain fixed.

---

## 9. Responsive rules

### Target widths

Validate at: **320, 360, 375, 390, 640, 768, 900, 1080, 1440px**.

### Mobile design behavior

- Content remains one vertical narrative; only deliberately swipeable rails may scroll horizontally.
- Hero portrait becomes full-width 4:5 / portrait plate, then title/copy/CTAs; do not overlap all four elements.
- Hero title must fit without accidental word fragmentation.
- Desktop two-column sections collapse to a predictable image → copy or copy → image order.
- Catalog rows keep a 48–72px artwork thumbnail, title, and arrow; secondary metadata may collapse below or disappear.
- Platform rows retain number, name, and outbound arrow; platform icon may hide if space is tight.
- Footer becomes a single column.
- The mobile drawer is the only mobile navigation system.

---

## 10. Content and data contract

The design must accept CMS data and have honest fallbacks.

| Data | Required display behavior |
| --- | --- |
| Hero title, kicker, body, image | home hero with official portrait fallback |
| Profile / portrait | About and Home image fallback |
| Releases | title, format, year, platform, official URL, artwork, optional story/credits |
| Current release | featured on Home and Music |
| Platform links | official exits only; render all valid entries |
| Events | show only confirmed/upcoming public events; honest empty state otherwise |
| Visual assets / videos | show archive/screening only when data exists |
| Inquiry / fan signup | visible loading, success, and error states |
| Site settings | canonical URL, SEO/social preview, basic contact/brand configuration |

Never replace missing data with invented claims. If an optional section has no legitimate data, hide it rather than show an empty decorative shell.

---

## 11. Accessibility and SEO requirements

- One `h1` per page and meaningful heading order.
- Skip link points to main content.
- Keyboard navigation works in nav drawer, rail controls, lightbox, embedded player controls, and forms.
- All non-decorative images have descriptive alt text; mascot used as decoration has `alt=""`.
- Lightbox and drawer trap focus and close via Escape.
- Do not communicate state only by color.
- Respect reduced motion and color contrast.
- Server-render meaningful content; do not render a blank client shell.
- Canonical, Open Graph, Twitter image/title/description, structured artist data, `hreflang` ID/EN/x-default, sitemap, robots remain intact.

---

## 12. Asset inventory for the rebuild

Use the supplied/local assets rather than generating unrelated replacement photography.

- Official logo / wordmark
- Official portrait and fallback portrait
- Portrait/stage image variants for mobile and desktop
- Official social preview
- Release artwork from CMS/static release catalog
- Mascot doodle (`akbar-mascot-doodle.webp` / AVIF)
- Local self-hosted font files
- Platform SVG icons
- JEDAG RUN game assets/audio only inside the game route

For any generated visual asset, match the existing muted dark editorial world and do not add a second unrelated art direction.

---

## 13. Acceptance checklist for the other AI

A rebuild is complete only if all of the following are true:

- [ ] It recreates the **original public-site direction**, not the Pressure/Roots redesign.
- [ ] Home has portrait hero, mascot, Sunda identity, current signal, featured release, official channels, game teaser, and one fan signup.
- [ ] Music catalogue is navigable, uses official links, and has release detail routes.
- [ ] Visuals contains video screening, archive behavior, and in-page portrait studies/lightbox when assets exist.
- [ ] Live does not invent dates.
- [ ] About, Universe, EPK, Inquiry, Licensing, Privacy, Game, 404 all have distinct purposeful layouts.
- [ ] Indonesian and English route pairs are equivalent in structure and function.
- [ ] No initial audio player, particle wall, giant floating utility, or fixed overlay blocks content.
- [ ] No section relies on unreadable oversized display type.
- [ ] No generic rounded-card dashboard appears.
- [ ] The site is functional at 320–390px and desktop.
- [ ] All images, embeds, forms, direct links, metadata, and accessible names have graceful fallbacks.

---

## 14. Short implementation prompt for another AI

> Rebuild the public website for Akbar Nawasunda from this document. Use a dark nocturnal editorial system with muted steel-blue signal accents, real official images, fine rules, asymmetric image-led composition, calm motion, and a compact utility masthead. Preserve all public routes, Indonesian-first / English parity, official release/platform links, CMS fallbacks, SEO, accessibility, and the JEDAG RUN game. The homepage must be a cinematic portrait-led entry point; Music must be a usable catalogue; Visuals must be an archive with optional lightbox; Live must be honest about event data; EPK, Inquiry, Licensing, and Privacy must feel professional. Do not use the rejected Pressure/Roots redesign, giant fragmented titles, global floating audio player, always-on particle wallpaper, generic cards, glassmorphism, neon gradients, or cluttered fixed overlays.
