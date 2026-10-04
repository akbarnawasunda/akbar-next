# Phase 4 — Design System & Visual Language

**Akbar Nawasunda — akbarnawasunda.my.id**
Date: 2026-10-03 · Branch: `arena/01a0ffb8-akbar-next`
Constraints: Phase 2 Creative Direction (binding, via carried context — see R1) · Phase 3 IA (closed).
No builds. No new routes. Every decision labeled **DERIVED** (traceable to Phase 1/2 evidence), **INVENTED**
(new idea, justified), or **CONVENTIONAL** (standard practice kept for usability, not disguised as identity).
File references point to the audited repository state at `0b29dba` + live fetch of 2026-10-03.

**The name of the language: NIGHT FREQUENCY.** [DERIVED — the platform's own established name in the
repository: docs, the `gameLeaderboard` "JEDAG RUN — NIGHT FREQUENCY" title, the `fanSignals` table comment.]

---

## 1. DESIGN PHILOSOPHY

This is the visual language of an after-hours studio in Bandung Barat: near-black graphite surfaces on which
the artist's **own images** — night-street photography, studio portraits, release artwork, the AN mark, the
doodle mascot — carry all the color, while the interface recedes to a single steel-blue "signal." [DERIVED from
the asset set: every authentic photo is night/studio-lit; the only non-photographic brand color in his own
assets is the mark's electric blue — `akbar-logo.webp`, `akbar-mascot-doodle.webp`, `akbar-night-frequency-stage-optimized.webp`.]
The interface speaks like a mixing console: mono labels, index rows, hairline and dashed hairline rules, and one
on-air point that tells you what is live. [DERIVED: the existing kicker dot, index rows, dashed rules in
`SceneKit.css`/`FanSignalSection.css`; the console voice of `Azeret Mono` is an INVENTED formalization of that
existing voice.] The system refuses the DJ-promo template (white + blue shards, icon rows — the look of his own
social-preview asset, which is a distribution poster, not his home), neon-cyan EDM, dashboard surfaces, and
"premium/futuristic" gloss. [DERIVED: execution-plan rule 5, `design-language.md` neon ban,
`mature-palette-notes.md` dashboard diagnosis.] Specificity comes from restraint plus the artist's artifacts:
the two-name catalog, the rights vocabulary, the WIB clock, the 1 November gold, the mascot — content, not
decoration. [DERIVED from Phase 3 IA + Phase 1 facts.] Nothing in the language may exist if the logo, name, and
labels were removed and the palette/type/motion/artwork could sit on any electronic artist's site — the steel
signal on warm graphite, mono-as-console, photo-as-night, and the mascot are the four things that cannot be
swapped. [INVENTED as a test, DERIVED as content.]

---

## 2. TYPOGRAPHY SYSTEM

> **AMANDEMEN FASE 6 (2026-10-03, branch `arena/01a10161-akbar-next`).** Bagian ini diubah secara sadar;
> perubahannya dicatat di `docs/phase6-signature-report.md`. Ringkasnya: (a) keluarga font naik dari tiga
> menjadi **lima**, (b) anggaran font naik dari **189,7 kB → 208,5 kB** (11 file woff2, +18,8 kB: Syne 800
> 13,7 kB + Noto Sans Sundanese 700 5,1 kB), (c) peran *display* dipecah menjadi **judul/H1 (Syne 800)** dan
> *heading lain (Clash Display)*, dan (d) seluruh clamp ukuran judul dikalikan **0,60** karena Syne menulis
> kata yang sama ±1,68× lebih lebar — lebar baris judul tetap, tinggi hurufnya yang turun. Angka lebar diukur
> dari advance width file font di repo (`scripts/measure-title-type.py`), bukan diperkirakan.

**Typefaces** — lima keluarga self-hosted; totalnya 208,5 kB di 11 file woff2
(`client/public/assets/fonts/fontshare/` + `client/public/assets/fonts/fontsource/`). [DERIVED — tiga keluarga
lama sudah ada; dua tambahan Fase 6 dipasang dari npm pack @fontsource dan di-host dari repo, bukan CDN.]

- **Syne 800** — *judul/H1 saja.* Potongan bersudut pada K/R/W/A/M membuat nama artis punya bentuk yang tidak
  dimiliki grotesk mana pun; inilah satu-satunya suara tipografi yang tidak bisa dipindah begitu saja. Satu
  bobot, 13,7 kB, SIL OFL. Token: `--font-title`. [Fase 6]
- **Noto Sans Sundanese 700** — *gema aksara Sunda saja* (blok U+1B80–1BFF, `unicode-range` dikunci sehingga
  tidak pernah ikut terunduh untuk teks Latin). 5,1 kB, SIL OFL. Token: `--font-sunda`. [Fase 6]

- **Clash Display** (500/600/700) — *heading H2/H3 (sejak Fase 6 bukan lagi H1).* A characterful geometric display, deliberately not a
  trending default; it carries the giant artist name and page titles. [DERIVED (asset) + INVENTED (role
  justification).]
- **General Sans** (400/500/600) — *body.* Warm neutral grotesque; the reading voice for Indonesian/English.
  [DERIVED (asset) + CONVENTIONAL (role).]
- **Azeret Mono** (400/500/600) — *metadata/console.* The angular mono is the **signal voice**: kickers,
  labels, index numbers, dates, rights chips, platform names, the WIB clock, and — the key rule — **button
  labels**. Controls speak mono; content speaks body; identity speaks display. [INVENTED rule, DERIVED asset.]

**Roles table** (values are the existing tokens in `client/src/index.css` unless marked):

| Role | Face | Size | Weight | Tracking | Line-height | Case |
|---|---|---|---|---|---|---|
| Display hero (home H1, stage wordmark) | **Syne 800** [Fase 6] | `--text-hero` clamp(1.5rem, 3.9vw, 4.08rem) [Fase 6: 0,60 × nilai lama] | 500 (600 for emphasis) | −0.045em | 0.98 | sentence case; UPPERCASE only for the artist name and two-line section headlines [DERIVED: existing usage] |
| Page title (inner H1) | **Syne 800** [Fase 6] | `--text-h1` clamp(1.44rem, 3vw, 2.4rem) [Fase 6: 0,60 × nilai lama] | 500 | −0.045em | 1.0 | sentence case + trailing period (existing convention, e.g. "Perjalanan Akbar Nawasunda.") [DERIVED] |
| Section title H2 | Clash | `--text-h2` clamp(1.85rem, 4.2vw, 4rem) | 500 | −0.045em | 1.0 | sentence case, or UPPERCASE two-line "headline" style (existing pattern, e.g. "YANG SEDANG BERJALAN.") [DERIVED] |
| Entry title H3 (releases, eras, cards) | Clash | `--text-h3` clamp(1.25rem, 2vw, 2rem) | 500 | −0.02em | 1.1 | **as written by the artist** — Javanese/Minang/pop titles keep their original casing; never force-uppercased [INVENTED rule from FACT: titles are content] |
| Lede | General Sans | `--text-lede` clamp(1rem, 1.25vw, 1.14rem) | 400 | 0 | 1.6 | sentence |
| Body | General Sans | 1rem | 400 (500 for list titles) | 0 | 1.7 [DERIVED: existing] | sentence; **never uppercase** [INVENTED rule] |
| Small body | General Sans | 0.86rem | 400 | 0 | 1.55 | sentence |
| Meta/label (kickers, index, dates, chips, clock) | Azeret Mono | 0.72rem (500) / 0.68rem micro (non-interactive only) | 500 | +0.11em (0.16em micro) [DERIVED: existing values] | 1.4 | UPPERCASE [DERIVED] |
| Button label | Azeret Mono | 0.75rem | 500 | +0.10em | 1.3 | UPPERCASE [INVENTED rule — controls speak mono; size CONVENTIONAL] |
| Nav link | Azeret Mono | 0.72rem | 500 | +0.11em | 1 | UPPERCASE [DERIVED: existing look, formalized] |

**Case rules:** UPPERCASE is allowed for mono labels, buttons, nav, and display "headline" H2s. Uppercase is
banned in body text, ledes, form help text, and release titles. [INVENTED rule, consistent with the existing
split between mono labels (caps) and body (sentence) — DERIVED.]

**Language coverage (diamandemen Fase 6):** Latin untuk seluruh teks yang dibaca; ditambah **satu** pemakaian
aksara Sunda (U+1B80–1BFF) sebagai gema nama di bawah judul hero dan sebagai frasa partikel alias — keduanya
`aria-hidden`/non-teks, dengan padanan Latin yang tetap hidup di DOM. Transliterasinya usulan dan menunggu
konfirmasi pemilik. Teks asli (sebelum Fase 6): Latin only — Indonesian + English, no diacritics required; the Javanese/Minang release
titles are Latin-script as written. Japanese text exists **inside artwork images only** (e.g. the
future-red portrait) and is not a typography requirement. [DERIVED: the served UI is ID/EN;
`content.json` multi-language bios are legacy, not rendered.]

**Loading strategy:** self-hosted woff2, `font-display: swap` (existing); preload exactly three critical files —
sejak Fase 6: `syne-800`, `general-sans-400`, `azeret-mono-500` (61,9 kB, turun dari 63,5 kB). Yang dikeluarkan
dari preload adalah `clash-display-500`: ia sekarang hanya melayani H2/H3 yang seluruhnya di bawah lipatan,
sementara H1 adalah elemen terbesar di layar pertama dan paling mahal kalau harus di-swap. Sisanya swap. No
external font origin.
[INVENTED optimization of the existing self-hosting; the files and weights are FACT.]

**Fallback stacks** (existing, kept): display → `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
body → same; mono → `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`. [DERIVED + CONVENTIONAL.]

**Mobile:** the fluid clamps are the mobile scale — no separate mobile type system. Floors: body ≥16 px,
mono ≥11 px. **Fase 6:** lantai H1 turun ke 1,44rem dan hero ≈28 px di 390 px — bukan pengecilan hierarki
melainkan konsekuensi lebar Syne: pada ukuran itu kata "NAWASUNDA." memakai lebar baris yang SAMA seperti
Clash 38 px sebelumnya (11,463em vs 6,963em). Kontrak yang dijaga `server/mobileLayout.test.ts` tidak berubah:
tidak ada kata judul yang keluar dari ruang teks di layar 320 px. Nilai lama (sebelum Fase 6) adalah
hero clamp(2.5rem, 6.5vw, 6.8rem) / H1 ≥2.4rem, hero ≈38–40 px at 390 px [DERIVED: existing
`--text-hero` + the foundation-audit inner-title clamp].

**How typography expresses the signature:** the mono voice *is* the signal voice — every surface where the
signal dot appears (kickers, player, clock, rights chips) is set in Azeret Mono. Identity moments (name, era
titles) are Clash. The reader never sees the two voices arguing. [INVENTED formalization of the existing
split.]

---

## 3. COLOR SYSTEM

**Mode decision: fixed dark. One mode.** [DERIVED: the entire public shell is dark (`color-scheme: dark`,
`--ink` base); the earlier light "parchment" section was already retired — the live fan-signal panel is
`--ink-soft` (`FanSignalSection.css`).] No light mode is planned: the artist's real imagery is all
night/studio; a light mode would be a costume. [INVENTED decision, DERIVED rationale.]

**Palette** (canonical values = the live editorial scope, `shell/EditorialRefresh.css`; contrast computed
against the stated surfaces):

| Token | Value | Role | Appears on | Contrast (computed) |
|---|---|---|---|---|
| `--ink` | `#101211` | page base — warm near-black, the floor everything sits on | all | — |
| `--ink-soft` | `#171a18` | raised panels: scrolled header, fan-signal band, drawer | panels | text on it: 15.3:1 (paper) |
| `--ink-card` | `#1b1e1c` | plates & instruments: artwork plates, player, embeds, inputs | cards | 14.9:1 (paper) |
| `--ink-hover` | `#232724` | hover surface for rows/cards/quiet buttons | states | — |
| `--paper` | `#f1efe9` | primary text — warm bone, never pure white | text on all | **16.4:1** on ink (AAA) |
| `--paper-soft` | `#d5d2ca` | secondary text at high emphasis (captions on images) | text | 12.5:1 |
| `--mute` | `#a6a69f` | secondary text: body second tier, meta at rest | text | **7.7:1** (AA normal) |
| `--mute-soft` | `#777a74` | decorative micro-labels only (4.3:1 — **non-essential text only**) [INVENTED restriction] | micro | 4.3:1 (AA-fail → restricted) |
| `--signal` | `#9bb9c1` | **the one accent** — kickers, active state, key actions, focus, live dot, buttons | UI | **9.1:1** on ink (AAA); 8.1:1 on ink-card |
| `--signal-dim` | color-mix(signal 55%, ink) ≈ `#5c6e72` | interactive borders/underlines — **never text** (3.5:1) [INVENTED restriction] | borders | 3.5:1 (non-text pass) |
| `--brand-azure` | the electric blue inside the AN mark (see logo; not a UI color) | reserved for the artist's own brand asset moments only | brand images | — |
| `--an-birthday` | `#dcb573` | warm gold — **1 November mode only**, time-boxed to the day (Jakarta time) | chip/note | 9.8:1 |
| `--state-ok` | `#7cf2a4` | success (form accepted, subscribed) | states | 13.5:1 |
| `--state-err` | `#ff7b72` | error (form, network) | states | 7.5:1 on ink (AA) |
| `--ink-line` | paper 13% | hairline rules, plate borders | lines | decorative |
| sepia set | bg `#151414`, panel `#0b0c0f`, line `#e4d9c4`, accent `#e7c7a4`, copy `#ebe4d9`, ink `#f2eadf` | the **darkroom register** — portrait studies only | `/visuals` portraits section | copy on bg 14.6:1 |

[All values FACT from `index.css`/`EditorialRefresh.css`/`StudioClock.css`; the two restrictions are INVENTED
from the computed ratios.]

**State colors & behavior:** hover = `--ink-hover` surface + paper text; focus-visible = 2px `--signal`
outline, 2px offset (on solid-signal surfaces the ring is `--paper` — INVENTED, see §11); active/selected =
`--signal` border or underline; disabled = `--mute` at 40%, no pointer; error = `--state-err` border + message;
success = `--state-ok`. [CONVENTIONAL state model on DERIVED tokens; the ring detail is INVENTED.]

**Artwork interaction rules:** artwork is a **document on a neutral surface** — it never gets palette
overlays, duotones, or tinted frames. The palette touches artwork only through (a) the mono caption strip
beneath it, (b) the hairline border, (c) the hero scrim (one gradient, §5). The steel signal does not sit on
artwork; the brand-azure belongs to the artwork's own world (the logo, the mascot). [INVENTED rule from
DERIVED assets — the photos already contain their own blue/violet light; doubling it with UI color would
read as template.]

**Banned colors (and why, specifically for this artist):**
- Raw neon cyan family `#00d4ff / #1ee8ff / #18d7f2` + their rgba — already banned in `design-language.md`
  (FACT); it is the color of generic EDM templates and would pull the site back to the "DJ promo" look the
  whole mature-palette effort moved away from [DERIVED ban].
- Violet/indigo surface tints (`#8b5cf6`-family) — diagnosed by the repo as "developer dashboard" (FACT:
  `mature-palette-notes.md`); banned as surfaces [DERIVED].
- Pure `#fff` for text and pure `#000` for surfaces — bone and ink are warmer; clinical white/black would
  flatten the night-studio register [INVENTED, from DERIVED values].
- Gradient text fills and gradient surfaces [CONVENTIONAL + DERIVED: the existing `--gradient-*` tokens are
  flat same-color-to-same-color, i.e. already no-ops — keep it that way].

---

## 4. SPACING & LAYOUT SYSTEM

**Spacing scale** (existing fluid tokens, kept as the contract): `--space-2xs` 4–6 · `--space-xs` 8–12 ·
`--space-sm` 12–18 · `--space-md` 18–28 · `--space-lg` 28–44 · `--space-xl` 44–72 · `--space-2xl` 64–116 ·
`--space-3xl` 88–164 (all `clamp`). New spacing must come from this scale. [DERIVED: `index.css`; CONVENTIONAL
8px-derived, made fluid.]

**Grid:** conceptual 12 columns; three container widths — shell `--container-max` 1440, editorial frame
`--container-frame` 1180, reading measure `--container-text` 62ch; editorial gutter
`clamp(22px, 6vw, 104px)`. Breakpoints (existing, documented): 640 / 768 / 900 / 1080 / 1440; mobile primary
targets 360/375/390. [DERIVED: `index.css`.]

**Vertical rhythm:** between major sections = `--section-y` (space-2xl); inside scenes = space-lg/xl; inside
index rows = space-xs/sm. No ad-hoc margins. [DERIVED + CONVENTIONAL.]

**Section spacing:** SCENE registers (hero, about, universe, live, visuals) breathe at space-2xl/3xl; INDEX
registers (catalog rows, channels, events, EPK lists) sit dense on hairlines with space-xs/sm. Two named
registers, chosen per page in Phase 3's contracts — the archive pages are dense because they are lists, the
story pages are spacious because they are reading. [INVENTED naming of the DERIVED split.]

**Density posture:** editorial and image-led by default (Phase 2's image-driven direction); density is earned
only by lists of equal-weight records (catalog, channels, events, assets) — never by decoration. [DERIVED from
Phase 2 carry + existing page behavior.]

**Alignment:** left-aligned by default everywhere. Centering is allowed for exactly three things: the
wordmark stage, the 404, and the hero title block at ≤640 px. Centering is banned for body copy, ledes, and
index lists. [CONVENTIONAL; the three exceptions are DERIVED from existing centered moments.]

**Asymmetric vs symmetric:** scenes are asymmetric (media ↔ copy, alternating sides per page — the existing
scene pattern); symmetry only for index rows and forms. [DERIVED: every current page alternates
copy-left/media-right or the inverse.]

**Full-bleed vs contained:** full-bleed for hero photography and the About portrait band (existing
`.an-ab-band`); contained (framed, gutter-respecting) for catalog rows, forms, and the EPK document.
[DERIVED from existing usage.]

**Mobile adjustments:** the fluid clamps *are* the mobile scale (gutter ~20 px, section-y ~64 px at 390 px);
no second scale exists. [INVENTED simplification; CONVENTIONAL fluid design.]

---

## 5. ARTWORK & IMAGE TREATMENT

**Release artwork:** 1:1 square (platform-standard — FACT: every catalog art is square). Displayed as a flat
**plate**: 1px `--ink-line` border, radius 0, no shadow, no overlay, no hover motion — the artwork is a record,
shown like a document. Row size ≤200 px (the existing `artworkThumb` CDN-size pattern — FACT), release-detail
hero ≤520 px. Caption beneath: mono meta (year · platform · rights chip). **Hover changes the row surface and
the title underline only — never the image.** [DERIVED plate + INVENTED no-motion rule: moving a 120 px
thumbnail on hover is exactly the "card hover" template behavior this system refuses.]

**Missing artwork:** the fallback plate — `--ink-card` fill, the AN logo **badge tile** (the existing
treatment: 36 px mark on `--ink-soft` with a 1px rule — FACT: `OfficialBrand.css`) centered, plus a mono line
"ARTWORK MENYUSUL". The logo badge is asset-safe (the file exists). [DERIVED pattern; blocked-pending note:
a transparent AN monogram (referenced in `asset-audit.md` but not in this repo) would make a cleaner fallback —
**blocked pending that asset**, the badge works until then.]

**Photography (portraits, stage):** plates at 4:5 or 2:3 (existing ratio tokens — FACT); bleed to the plate
edge, **no border, no filter, no duotone** — the photos already are the night; enhancing them would be lying.
Mono caption strip beneath (paper-soft). Text over photo is allowed in exactly two places — home hero and
live hero — with the single existing linear-gradient scrim at ≥40% `--ink` under the text block. [DERIVED:
both scrims exist (`HomeStage.css`); the two-place limit is INVENTED from that fact.]

**Visual archive (videos):** 16:9 plates (existing `--ratio-cinema`), YouTube thumbnail as the face, mono label
("VIDEO TERBARU" etc. — FACT), on-demand embed. The archive keeps its **rhythmic dense grid** (existing
"kolom berirama" — FACT), not uniform cards. [DERIVED.]

**Portrait studies:** the **sepia/darkroom register** — the only place the warm sub-palette appears (existing
`--sepia-*` set — FACT). Lead frame + grid + in-site lightbox, as closed in Phase 3. [DERIVED.]

**Formats & loading:** AVIF/WebP `srcset` with intrinsic sizes via the existing `lib/responsiveImage.ts`
system (FACT); `loading="lazy"` below the fold; hero images `eager` + `fetchpriority="high"` (existing);
decode crossfade `--image-fade` 320 ms from the `--image-surface` plate (existing token). [DERIVED +
CONVENTIONAL.]

**Video rules:** no autoplay, no muted looping, no looping at all; captions where the platform provides them
(YouTube embeds); iframes always inside fixed-ratio containers (the repo's absolute rule against horizontal
overflow — FACT: execution-plan rule 8). [CONVENTIONAL + DERIVED rule.]

**Audio preview rules:** the only audio is (a) the **global player** — user-initiated, never autoplay,
session-persisted (FACT: `GlobalAudioPlayer.tsx`) — and (b) the game's own audio on the game route
(FACT: game SFX assets). Nothing else plays. [DERIVED + CONVENTIONAL: audio that isn't the artist's music
would compete with the music.]

---

## 6. MOTION SYSTEM

**Principles — motion is for exactly four things:** (1) navigation feedback (route change), (2) state truth
(the signal dot: live/playing/current), (3) one reveal per section on first scroll, (4) rhythm (the platform
marquee — the only continuous motion, and it carries the 10 official channels, i.e. information). Motion never
decorates content. [INVENTED formalization of the existing four uses: curtain, kicker dot/SignalIndicator,
`Reveal` components, `PlatformMarquee`.]

**Durations** (existing tokens kept): `--dur-fast` 160 ms (control feedback) · `--dur` 280 ms (state changes,
reveals) · `--dur-slow` 520 ms (route content entry) · route curtain ±840 ms total (FACT:
`RouteSignalCurtain.tsx` comment) · signal pulse 2000 ms ease-in-out infinite (INVENTED — a slow on-air
breath, not a beat) · marquee one loop 28–40 s (INVENTED within conventional legible speed).

**Easing:** one curve for the whole system — `cubic-bezier(0.16, 1, 0.30, 1)` (existing `--ease` — FACT),
named **signal-ease**: fast departure, soft landing, like a fader. Only the pulse uses `ease-in-out`.
[DERIVED + INVENTED naming.]

**What may move:** the route curtain (wordmark rises → signal line sweeps → destination label → content
enters — FACT); the signal dot pulse (state-bearing only); the cursor signal trail (existing layer — FACT);
the particle field in its per-route mode; the platform marquee; section reveals (offset ≤12 px + fade,
stagger ≤40 ms — the design-language contract — FACT doc); the EventCountdown digits (data-driven); the
player waveform/progress (deterministic, existing — FACT); hover row surfaces.

**What may NOT move:** body text (the single sanctioned exception is the home hero title's word-mask entrance
— existing `hero-title-mask`, FACT — and it is identity, not decoration); **artwork never moves** (no parallax,
no hover scale, no slow zoom); icons get no independent micro-motion; form fields don't animate; backgrounds
other than the field are static. [INVENTED rules, DERIVED from the existing restraint.]

**Signature via motion:** the dot *breathes* (2 s), the curtain's sweep *is* the signal line, the field *is*
the signal's environment. One concept, three registers (point / line / field). [INVENTED consolidation — the
three already exist separately as FACT; naming them one signature is the decision.]

**Rhythm:** the artist's music is breakbeat/jedag — syncopated and bass-heavy, not four-on-the-floor EDM.
The site's motion therefore never locks to a fast grid: pulse at 2 s, marquee at a walking speed, reveals
staggered 40 ms (a human cadence). The *beat* lives where it belongs — in the game canvas and in the audio
itself. [INVENTED interpretation of FACT genre data; deliberately not literalized into strobing UI.]

**Reduced motion — first-class path:** the curtain is skipped today already (FACT: `reduced` check in
`RouteSignalCurtain.tsx`); the full path: field off, curtain → 120 ms crossfade **with the destination label
still announced** (`role="status"` `aria-live` — existing), pulse → static dot, marquee → static wrapping row,
reveals → instant, cursor trail off, hero word-mask → static title. No information is lost under reduced
motion — only the sweep. [DERIVED existing behavior + INVENTED completion of the path.]

**Low-perf:** the existing capability tiers (desktop / lite ≤480 particles / off — FACT: `capability.ts`)
govern the field. Mobile: field **off by default**, lite only on devices that report capability
(INVENTED default-off; the point/line registers cost ~0 and stay). [DERIVED tiers + INVENTED mobile default.]

**Field mode per route** (the field *yields to the music*): home = wordmark/signal · music = **quiet** ·
visuals = quiet · universe = era · about = quiet · live = sparse signal · epk = **off** · inquire / licensing /
privacy = **off** · game = **off** (its own canvas). [INVENTED per-route assignment; the per-route mode
mechanism already exists — FACT: `SignatureStage`/`PublicShell` mode system.]

**Page transition model:** the curtain, total ±840 ms, label from route metadata (not hardcoded — FACT).
First page load: no curtain (no LCP penalty — existing behavior — FACT). Back/forward: same curtain.
[DERIVED.]

**Loading-state motion:** no spinners for content — the mono "MEMUAT…" line (existing pattern — FACT);
images: 320 ms crossfade from the plate (existing token — FACT); route suspense: existing `PageLoading`.
Skeletons are **not** used: the mono line is cheaper and honest, matching the console voice. [INVENTED
decision, low cost.]

**Performance ceiling:** max **one** canvas field per route (desktop ≤1,200 particles — INVENTED cap,
lowering the engine's current "thousands" budget for frame headroom; Phase 5 A/B check, see R5); max **two**
continuous CSS animations per route (marquee + pulse); reveals ≤6 staggered elements per viewport; the field
pauses when the tab is hidden (requirement — verify in Phase 5). [INVENTED ceilings on DERIVED systems.]

---

## 7. SOUND SYSTEM

**No site-level sound** outside the music player and the game. [INVENTED decision, DERIVED rationale:] the
only authentic sound this world contains is the artist's music (and the game's in-world SFX); an ambient drone
or UI "blip" layer would (a) compete with the music the mission says must feel most important, (b) have no
source asset — the no-fabrication rule means no licensed UI-sound kit, and (c) break the night-studio quiet.
The player is user-initiated, never autoplay, session-persisted (FACT: `GlobalAudioPlayer.tsx`). The game
loads its SFX/BGM only on the game route, user-initiated (FACT: `CmsGameConfig` + `public/assets/media/*.mp3`).
Sound is never required for comprehension; the mute/close controls are always visible. [CONVENTIONAL
accessibility floor.]

---

## 8. SIGNATURE — VISUAL EXPRESSION: THE SIGNAL (*sinyal*)

Phase 2's signature name is not available in the repo (R1). The decision here: **one signature — the signal**:
a single point that carries a state (on-air / playing / live / current), with a line register (the sweep) and a
field register (the ambient environment). This is a consolidation of four layers that already exist and already
share this vocabulary — the kicker dot, `SignalIndicator`, the cursor signal, the route sweep, the particle
field [FACT: all present in `client/src/components/signature/` and `shell/PublicShell.tsx`]. Nothing new is
added; the four are declared one system. [INVENTED consolidation, DERIVED artifacts.]

**At rest:** a 6 px dot in `--signal` with a 4 px halo at 14% opacity — the exact existing kicker dot
(FACT: `SceneKit.css`). It appears in every page kicker, the player, the footer clock line, the signal-board
rows, the mobile drawer's news block. Resting, it says: this surface is part of the broadcast.

**On interaction / in state:** the dot **pulses (2 s ease-in-out)** only when it carries a live state —
"Live dari studio", the playing player, the next-show status. Hover on interactive rows: the row surface
shifts to `--ink-hover` and the signal dot's halo widens 14%→30%. The cursor leaves a fading signal point
(existing cursor layer — FACT). A route change: the signal line sweeps (curtain — FACT). The player's
waveform ticks in signal-dim (existing deterministic waveform — FACT).

**Where it appears:** every public route's kicker; home signal board; global player; live page status; footer
clock; mobile drawer.

**Where it deliberately does NOT appear:** the game (its own world); the EPK beyond the kicker dot (a
professional document gets the point, never the field or pulse); forms (focus clarity); privacy; **artwork**
(it is never drawn onto images). [INVENTED exclusions, DERIVED from the page contracts in Phase 3.]

**Degradation:** reduced motion → static dot, no pulse, no cursor trail, no field, crossfade curtain — the dot
still *identifies* the surface, so the signature survives with zero animation. Low-perf/off tier → same, plus
no field. The point register costs ~0 (one CSS circle), so the signature is visible even in the cheapest mode.
[DERIVED: existing reduced-motion skip + INVENTED completion.]

**Gimmick test / how it avoids being one:** (1) the dot always carries a state — if a pulse would carry no
information, it is banned; (2) one place pulses at a time per viewport — no site-wide strobe; (3) the pulse is
slow (2 s) — on-air light, not beat; (4) the field yields on music and professional pages; (5) nothing in the
signature is load-bearing for comprehension — remove it and the site still works, which is exactly what makes
it a signature instead of a crutch. [INVENTED criteria, DERIVED restraint.]

**Second-signature check:** the route curtain, cursor trail, and particle field are the signal's *registers*
(line / point / field), not second signatures. No other signature idea is introduced. [Per instruction: no
second signature.]

---

## 9. COMPONENT RULES (SPEC ONLY)

**Buttons** — three tiers. *Solid*: `--signal` fill, `--ink` text (9.1:1 — computed), mono 0.75rem +0.10em
uppercase, padding 14 px/24 px, radius `--r-xs` (2 px), no shadow. *Quiet*: transparent, 1px `--paper-line`
border, paper text, mono, same padding. *Text link*: mono, signal on hover, underline. States: hover — solid
darkens via `color-mix(signal 90%, ink)`; quiet gains `--ink-hover` fill; active — `translateY(1px)` (the
"physical instrument" press from the repo's interaction philosophy — FACT: `design-language.md`).
A11y: never icon-only without `aria-label`; toggles expose `aria-expanded` (existing player toggle — FACT);
the accessible name of a CTA names the action *and* the object where ambiguous (Phase 3 risk: "Buka rilisan"
must carry the release title). Perf: CSS-only states, no JS hover. [DERIVED tokens/states + INVENTED
labeling rule.]

**Links** — inline: paper text, `--ink-line` underline → signal underline on hover (CONVENTIONAL). Nav: mono
uppercase 0.72rem +0.11em; active = 2px signal underline (existing). Outbound: + ArrowUpRight 14 px icon,
`target="_blank" rel="noreferrer"` (existing pattern — FACT), accessible name includes the destination
(Phase 3 rule). Never bare "klik di sini"/"more". [DERIVED + Phase 3 carry.]

**Forms** — label: mono 0.72rem uppercase +0.11em paper; required/optional markers in mute ("wajib/opsional"
— existing). Input: `--ink-card` fill, 1px `--ink-line` border, radius 2 px, paper text 1rem; placeholder body
400 mute. Focus: 2px signal ring, 2 px offset. Error: `--state-err` border + mono 0.75rem message beneath.
Success: `--state-ok` confirmation block (existing inquiry success state — FACT). The inquiry form keeps its
fieldset/legend structure (Tentang kamu / Rencana / Brief — existing), mono type-selector, submit solid with
the "MENGIRIM…" pending state (existing), and the direct email always visible beside the form (low friction —
existing). A11y: every label bound (`htmlFor` — existing), `aria-invalid` + `aria-describedby` on errors,
no placeholder-only labels. Perf: no form animation beyond focus. [DERIVED existing + INVENTED error wiring.]

**Navigation** — desktop: fixed thin bar; brand = logo badge tile (32 px — existing) + name block; 6 mono
links (Phase 3: Musik · Visual · Perjalanan · Tentang · EPK · Kontak); tools = birthday chip, ID/EN, the
"Dengarkan" CTA (→ `/music`), menu button. Transparent over the home hero, solid `--ink` + hairline after
32 px scroll (existing behavior — FACT). Active link = signal underline. A11y: one nav landmark,
`aria-current="page"` (existing), skip link (existing), the m/v/e hotkeys kept (existing power-user feature —
FACT: `NightFrequencyChrome.tsx`). Mobile: right-hand full-height drawer, ink background, 6-item flat list
(Phase 3), each item = mono index + display 1.5rem label + mono description (existing pattern — FACT);
language toggle in drawer footer; focus trap + Escape + scroll lock (all existing — FACT). [DERIVED + Phase 3.]

**Cards** — the system has **no SaaS cards**. Two permitted surfaces: *PLATE* (media container — 1px
`--ink-line`, radius 0–2 px, no shadow, no lift) and *ROW* (index row — hairline divider, hover `--ink-hover`,
no box). CTA panels are full-bleed bands with hairlines (existing `CtaPanel` — FACT). A row that is a link is
one `<a>` wrapping the row (existing pattern — FACT), not a div-with-button. [INVENTED consolidation of the
existing two patterns; CONVENTIONAL a11y rule.]

**Embeds** — fixed-ratio container (1:1 audio / 16:9 video), 1px border, mono provider label ("PEMUTAR 01 ·
SOUNDCLOUD" — existing), **play-to-load** (iframe injected on first user play — existing
`OfficialMediaFrame` — FACT), fallback on iframe failure = the source link (existing). No horizontal overflow
ever (absolute repo rule — FACT). Perf: iframes absent from initial DOM; fixed dimensions prevent CLS.
[DERIVED.]

**Modals / drawers** — exactly two are allowed: the mobile nav drawer and the portrait **lightbox** (full
ink at 92%, 4:5 image never cropped, mono caption + index 01/03, arrows/Esc/backdrop close, focus trap —
existing `LightboxProvider` — FACT). No marketing modals; no cookie banner (no cookies to declare — the
privacy page explains; CONVENTIONAL restraint). [DERIVED + INVENTED limit.]

**Empty states** — the live page's empty state is the pattern: mono meta label + display title + one honest
line + one action (existing — FACT). No illustrations, no mascot except the 404 (asset exists — FACT; usage is
a Phase 5 option, R8). [DERIVED.]

**Error states** — form/network: mono `--state-err` line + retry + fallback email (existing inquiry error
pattern — FACT). Missing media: the fallback plate (§5) or mono "media menyusul" — never a broken-image icon.
[DERIVED + INVENTED missing-media rule.]

**Loading states** — mono "MEMUAT…" line (existing), image crossfade 320 ms (existing token), route
`PageLoading` (existing). No skeletons, no spinners. [DERIVED + INVENTED no-skeleton decision.]

**Music player surface** (the hard decision): a **persistent bottom bar** — bottom-left on ≥1080 px,
full-width bottom on mobile. `--ink-card` fill, 1px `--paper-line` border, radius 2 px, the one sanctioned
elevation shadow (`--shadow-soft`). Contents: 40 px square artwork (r-xs, 1px border), title (body 600
0.9rem) + platform (mono meta mute), controls (prev/play/next, 40 px icon buttons, mono), close (X) and
minimize (chevron). States: expanded (on play) / minimized (slim bar) / closed (removed, remembered in
`sessionStorage` — existing). Waveform = deterministic ticks in signal-dim (existing — FACT). It persists
across routes (existing — FACT), never autoplays (existing rule — FACT), and yields layout space on small
screens (existing `data` attribute behavior — FACT). A11y: track-title changes announced via
`aria-live="polite"`; controls labeled; the close decision is remembered, so the site never re-offers a
dismissed player in the session. Perf: `visual=false` iframe only while playing (existing). [DERIVED
architecture + INVENTED placement/size spec.]

---

## 10. MOBILE LANGUAGE

*Mobile is designed, not shrunk — but the fluid system already does most of the work; what follows is the
deliberate delta.*

- **Typographic scale:** same fluid clamps; floors — body 16 px, mono 11 px, H1 ≥2.4rem, hero ≈38–40 px at
  390 px (existing tuned clamps — FACT). No mobile-only typeface or family. [DERIVED + CONVENTIONAL floor.]
- **Spacing scale:** same fluid scale at its lower bounds (gutter ~20–22 px, section-y ~64 px at 390 px).
  [DERIVED: the clamps already resolve there.]
- **Navigation:** header = logo (home) + "Dengarkan" (→ `/music`) + menu button; right-hand drawer with the
  6-item flat list (Phase 3); items ≥56 px tall (existing generous pattern — FACT); language toggle in drawer
  footer. Reachable without the menu: home, music, and every in-page CTA. [Phase 3 decision, DERIVED
  chrome.]
- **Signature:** the dot stays (kickers, player, drawer news block); cursor trail N/A; field **off by
  default**, lite on capable devices (§6); pulse stays — it costs nothing. [DERIVED + INVENTED mobile
  default.]
- **Motion:** reveals stagger halved to ≤24 ms; curtain keeps its timeline but reads as a single sweep;
  **marquee → static wrapping row below 640 px** (reduced-motion parity without waiting for the media query —
  INVENTED); no new mobile motion. [INVENTED, justified by the motion budget.]
- **Artwork:** hero portrait 4:5 full-bleed width (existing mobile srcset variants — FACT); catalog rows =
  72 px square art + text stack (Phase 3 mobile IA); portrait grid and the archive wall collapse to one
  column (existing behavior — FACT: `verification-an-archive-notes.md`). [Phase 3 + DERIVED.]
- **Horizontal scrolling:** permitted only for the EPK selected-releases rail and (≥640 px) the platform
  marquee; both get edge-fade + a mono counter (01/03) and native swipe; the existing "GESER UNTUK LIHAT"
  affordance (FACT: live home) is the label pattern. Everything else is vertical (Phase 3 closed this).
  [DERIVED affordance + INVENTED counter rule.]
- **Background scroll:** locked while drawer/lightbox open (existing `useLockBodyScroll` — FACT). [DERIVED.]

---

## 11. ACCESSIBILITY COMMITMENTS

- **Contrast targets (measured, not assumed):** body 16.4:1 (paper/ink — AAA); secondary 7.7:1 (`--mute` —
  AA normal); large display 9.1:1 (`--signal` — AAA); non-text UI ≥3:1 (`--signal-dim` borders 3.5:1 pass;
  `--mute-soft` 4.3:1 is therefore **restricted to non-essential micro-labels**); state colors: ok 13.5:1,
  err 7.5:1 (AA normal) — all computed against `--ink`/`--ink-card`. **No information may ride on a border
  alone** (hairlines are decorative). [DERIVED values, INVENTED restrictions from the computed ratios.]
- **Focus ring:** 2 px solid `--signal`, 2 px offset, on every focusable element, on all surfaces. On
  solid-signal fills the ring switches to `--paper` (signal-on-signal would vanish — INVENTED detail,
  standard technique). [CONVENTIONAL spec on DERIVED tokens.]
- **Target sizes:** interactive ≥44×44 px (CONVENTIONAL); drawer items already exceed this (FACT); icon
  buttons 40–44 px (§9).
- **Text on artwork:** only the home hero and live hero, with the existing scrim at ≥40% ink under the text
  block; everything else sits on ink/ink-card. [DERIVED + INVENTED two-place limit.]
- **Reduced motion:** the full first-class path in §6 — no information lost, the destination label is still
  announced. [Commitment restated per brief.]
- **Zoom to 200%:** the fluid clamps + 62ch measure hold; no fixed-height text containers anywhere (spec
  requirement for Phase 5); the header collapses to logo+menu at high zoom; the drawer stays fully usable.
  [INVENTED spec, CONVENTIONAL technique.]
- **Text-spacing overrides:** layouts are block-flow; mono labels may wrap under `letter-spacing` overrides —
  acceptable, no critical ellipsis allowed (spec). [CONVENTIONAL.]
- **`prefers-contrast: more`:** hairlines step up to paper 20%, `--mute` steps up to `--paper-soft`. Cheap,
  two-token change. [INVENTED, low cost.]
- **Live regions:** the curtain `role="status"` (existing — FACT); player track changes `aria-live="polite"`
  (spec); the countdown's ticking digits are `aria-hidden` with the readable date text visible (INVENTED:
  the digits are noise for AT, the date is the fact).

---

## 12. PERFORMANCE BUDGET

- **Fonts:** ≤205 KB total, 9 self-hosted woff2 (FACT: measured file sizes); preload 3 critical ≈63 KB
  (INVENTED list); `font-display: swap`; no new families; no external font origins. [DERIVED + INVENTED.]
- **Images per route class** (INVENTED ceilings, DERIVED from current asset sizes): home ≤550 KB (hero
  portrait ≤150 KB — current optimized file is 83 KB FACT — + featured art ≤40 KB + mascot ≤30 KB; the game
  teaser is pure CSS — FACT); music ≤450 KB (8 × 200 px arts ≤320 KB + featured ≤150 KB); visuals ≤600 KB
  (≤80 KB per video thumb); release detail ≤250 KB; epk ≤400 KB.
- **Video:** 0 KB until user action (play-to-load — existing — FACT).
- **Motion:** one canvas field per route; particle caps desktop ≤1,200 (INVENTED, down from the engine's
  "thousands" — FACT comment), lite ≤480 (FACT), off 0 (FACT); ≤2 continuous CSS animations per route
  (marquee + pulse); reveals ≤6 staggered elements per viewport; field pauses on hidden tab (Phase 5
  requirement). [INVENTED ceilings on DERIVED systems.]
- **Animation library: NOT needed.** The entire motion spec is implementable with CSS transitions/keyframes +
  the one existing canvas engine (FACT: `particleField.ts`, 1,193 lines, already tiered). A motion library
  would add 30–50 KB gzip for zero unique capability here. [INVENTED decision, justified — this answers the
  brief's real question.]
- **Banned by performance:** `backdrop-filter` blur (repo audit policy — FACT: `scripts/audit-layout.mjs`
  policy); background video; animating `box-shadow` or `filter` on >200 px images; more than 20 animated DOM
  nodes per viewport; canvas work when the tab is hidden. [DERIVED policy + INVENTED counts.]
- **System target:** the language must be implementable with **zero new JS dependencies and at most one
  canvas**. If a future design element needs a second canvas or a new runtime, that element is rejected at
  review. [INVENTED target statement.]

---

## 13. ANTI-PATTERNS

*What this system must not become — specific to this artist:*

1. **The DJ-promo template** — white ground, electric-blue shards, icon rows, "MUSIC CONNECTS US". This is
   the look of the artist's *own social-preview asset* (FACT: viewed) — it is his distribution poster, not his
   home. If the site starts looking like it, it has become mass-produced. [DERIVED: execution-plan rule 5
   bans exactly this family.]
2. **Neon cyan EDM** — `#00d4ff`-family anywhere (repo ban — FACT). It is the color of the generic Indonesian
   DJ-poster world this site is stepping out of.
3. **Violet dashboard** — indigo/violet surfaces (repo diagnosis: "developer dashboard" — FACT:
   `mature-palette-notes.md`).
4. **Cosmos/space imagery for "universe"** — the route is now Perjalanan; stars, orbits, or galaxy graphics
   would resurrect the dead fan-universe concept (Phase 3 closed this — DERIVED).
5. **Strobe / beat-locked UI** — flashing or 1 Hz+ pulsing anywhere. His music is heavy and syncopated
   (breakbeat, jedag) — the beat belongs in the audio and in the game canvas; the night-studio UI breathes at
   2 s. A strobing site would misread the artist. [INVENTED interpretation of FACT genre/game data.]
6. **Stats bands** — no follower counts, stream counts, or "23+ platforms"-style number walls. The legacy
   stats were deliberately not migrated (FACT: `legacy-content-migration-audit.md`); a visual component that
   frames them would re-fabricate dead numbers. Only *computed* facts (release count, channel count) may
   appear. [DERIVED.]
7. **Card hovers** — lift/shadow/scale on hover anywhere. Surfaces shift color; images never move.
   [INVENTED, from §5.]
8. **Mascot as texture** — the doodle mascot is a face, not a pattern. Sanctioned slots: home hero corner,
   footer, (optionally) 404 — never repeated, never in music or EPK surfaces. [INVENTED limit, DERIVED
   asset character (the sticker-culture counterpoint to the nocturnal system).]
9. **Uppercased release titles / Latinized "fancy" rendering of Javanese/Minang titles** — titles are
   content, set as written (FACT: catalog titles carry the artist's casing). [INVENTED rule from FACT.]
10. **Glassmorphism, gradient text, and "premium" gloss shadows** — the repo already bans the first family
    (FACT); the last two would push the site toward the "premium/futuristic" frame the carried Phase 2 context
    explicitly rejects. [DERIVED carry.]

---

## 14. OPEN RISKS & UNKNOWNS

- **R1 (carried from Phase 3) — the Phase 2 Creative Direction document is not in the repository.** This system
  assumes Phase 2 = the carried mission (an authored, content-derived world; explicitly *not*
  cool/premium/futuristic optimization). §8's signature consolidation ("the signal") is the one place a missing
  Phase 2 name could bite: if Phase 2 named a different signature element, §8 and the per-route field modes
  must be re-checked before Phase 5. Flagged, not overridden.
- **R2 — `--brand-azure` has no sampled hex.** The logo's electric blue was viewed but could not be measured
  in-sandbox (no image tooling). It is defined descriptively and is **not a UI color**; if Phase 5 needs the
  token (e.g., a birthday × brand moment), sample from `akbar-logo.webp` first. [FACT: asset exists; value
  unverified.]
- **R3 — No transparent/light version of the AN monogram exists in this repo.** Both logo files are
  dark-on-white (FACT: viewed). The header badge (white tile) and the artwork fallback plate (§5) work on that
  basis; `asset-audit.md` references a transparent cut that lives outside this repo. **Blocked pending the
  asset** — until it lands, the badge tile is the spec.
- **R4 — The "future" artwork (future-red/future-yellow) contains Japanese text and an anime style.** These
  are stylized brand artwork, **not portraits of the artist** — the official portrait is the identity photo.
  Plating rules must not crop them into their text blocks, and no copy may present them as photographs of the
  artist. [INVENTED risk from FACT: viewed assets.]
- **R5 — The particle cap change is a visible change.** Lowering the desktop budget from "thousands"
  (FACT: `capability.ts` comment) to ≤1,200 will alter the field's density. Phase 5 must A/B it on a real
  device before freezing; the lite/off tiers are unaffected. [INVENTED cap, needs visual verification.]
- **R6 — `--mute-soft` (4.3:1) sits below AA for normal text.** It is restricted to non-essential
  micro-labels (§3). If Phase 5 finds it in use for essential text, it must be bumped to `--mute`.
  [INVENTED restriction from computed ratio.]
- **R7 — Clash Display licensing.** Self-hosting from Fontshare is the existing practice (FACT). Before any
  *new* weight or a variable conversion, re-verify the Fontshare license terms. [CONVENTIONAL diligence.]
- **R8 — Mascot on the 404.** The asset exists; the 404 currently has no mascot (FACT: `NotFound.tsx`).
  Using it there is permitted by §13.7's slot list but is a Phase 5 choice, not a system requirement.
- **R9 — Birthday gold × other accents.** `--dcb573` is 1 November-only by rule. If the artist extends the
  mode (e.g., a week-long celebration), the color's time-box must be re-decided — it must not become a
  second standing accent, which would break the one-accent rule. [INVENTED guard.]
- **R10 — The scrim two-place limit (§5) may be tested by new CMS content.** A CMS-published live poster
  (`posterUrl` — FACT: the live hero already supports it) must pass the same scrim rule; Phase 5 should add it
  to the verification checklist.

---

*End of Phase 4. The language is specified, not built; no routes were touched; no assets were assumed that
do not exist (the three blocked-pending items are named: R2, R3, R8). Stopping here — awaiting instruction
for Phase 5.*
