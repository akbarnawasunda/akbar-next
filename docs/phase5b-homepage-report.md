# Phase 5b — Homepage · Implementation Report

Date: 2026-10-03 · Built on top of 5a (same working tree, committed together)

## 1. IA realized (Phase 3 home contract)

Desktop vertical order (verified in rendered HTML offsets):
1. Identity hero — official portrait, name, lede, **DENGAR SEKARANG** CTA, facts strip (Basis/Sejak/Genre)
2. Signature stage — wordmark surface, particle-assembled two names, aka line (sr-only), computed stats (RILISAN / MULAI / PLATFORM) — **era/timeline rows removed** (their home is `/universe`)
3. Signal board (`#signal`) — "YANG SEDANG BERJALAN." change-detector
4. **Latest-release document** (`#music`) — artwork plate, mono metadata, story, "Putar di sini" (MusicEmbed) + "Buka rilisan"
5. Channel index (`#platforms`) — typographic platform list + marquee
6. Game teaser → 7. Booking CTA → 8. Fan signal (unchanged)

The only structural move was slot 4 above slot 5 (`an-feature` above `an-channels`) — exactly Phase 3 §2 row 1 ("strip the duplicated journey/era timeline", "keep … latest-release document, channels …" in that order). The EN mirror (`/en`) got the same move: `section-current` (latest release) above `home-signal-deck` (platform rack).

Mobile: same DOM order (single responsive shell) — matches Phase 3 §7's mobile order where the release+play slot sits before the channel index. No mobile-only re-ordering needed because the desktop order already IS the mobile order per Phase 3 (they differ only in the header, handled in 5a).

## 2. Files changed

| File | Reason (one line) |
|---|---|
| `client/src/pages/Home.tsx` | Hero CTA single-sourced to `activeRelease` (R2); release-document block moved above channels |
| `client/src/pages/EnglishPages.tsx` | EN home: release document moved above platform deck (same IA decision) |
| `client/src/components/signature/SignatureStage.tsx` | Era/journey rows removed (identity-only stage per Phase 3); start year now from `publicJourney` milestones |
| `client/src/components/signature/SignatureStage.css` | Dead era-row styles removed; comments updated |
| `scripts/verify-ssr.sh` | Needle `DENGARKAN KARYA` → `DENGAR SEKARANG` (label now non-overridable) |
| `server/publicAccessibility.test.ts` | Stage contract: era rows asserted GONE; name + stats + sr-only aka still asserted |
| `server/signatureChrome.test.ts` | Stage DOM contract updated (aka sr-only present, no `stage-eras`) |
| `server/verifySsrNeedles.test.ts` | (auto) reads the updated script |

(5a files are in the 5a report; nothing in this list touches shell/nav/footer/tokens.)

## 3. Signature expression

The home signature is the **signal system**: wordmark stage (particles assemble "AKBAR NAWASUNDA" → "DJ AKBAR REMIX" — the two-names identity story), mono signal voice in kickers/labels, beacon in chrome, curtain on route change. After 5b the stage carries ONLY identity (name, aka, computed counters) — the journey narrative it was double-printing moved out. The particle morph between the two names stays because that morph IS the identity statement (Phase 4: home = wordmark/signal mode), not a timeline. Signature is intact; it just no longer duplicates `/universe` content.

## 4. Music presence (R2 resolved)

- `heroActionUrl = activeRelease.href` — the CMS `primaryActionUrl` override is removed. Hero CTA, signal-board release row, release document, and global player now share ONE source (`isCurrent` CMS release → catalog fallback).
- Live inconsistency from production (hero → "Ngertenono Ati" SoundCloud while document/player → "Masih Mencintainya") can no longer recur: there is no second URL to drift.
- Label: `DENGAR SEKARANG` (or `TONTON VISUAL` if the current release URL is YouTube — derived from the real URL, not an owner override, so label and target can't disagree).
- Verified in rendered HTML: hero CTA href = `soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda` = the release document's own "Buka rilisan" target.

## 5. First 5 seconds (verified by actual SSR render)

What a visitor sees before scroll: full-bleed official portrait, "AKBAR NAWASUNDA." title, one-line identity lede, a SOLID DENGAR SEKARANG button (one tap to the current track), a quiet "Lihat visual" secondary, and the facts strip (Bandung Barat / 2020 / Breakbeat–Indo Bass). No invented stats, no fake percentages (preloader contract unchanged). The stage (140vh scroll runway) and signal board live just below the fold, so the first 5 seconds are: identity + one action. [FACT: rendered offsets; visual polish needs a human browser]

## 6. Mobile verification

- DOM order is the mobile order (Phase 3 §7) — verified in the same rendered HTML.
- Header mobile: logo + DENGAR SEKARANG (44px) + menu (5a).
- Touch: release-document buttons use `.an-btn` (≥44px via shell); channel rows are full-width links.
- No horizontal overflow introduced (no new fixed widths; fluid clamps only).
- Honest limit: no browser in sandbox — layout at 390px needs one human check (flagged 5g).

## 7. A11y check (home scope)

- Single H1 per route preserved ("AKBAR NAWASUNDA." with `aria-label` on the masked spans).
- Stage: era rows were visible text; their removal doesn't lose information (same content lives on `/universe`). aka line remains sr-only text for screen readers; stats labels remain as sr-only `<dt>` + visible counter labels.
- No new focusable elements; no new ARIA needed; `aria-busy` on the release doc while CMS loads preserved.
- Contrast: only canonical tokens used (paper/ink 16.4:1, mute 7.7:1) — no new color.

## 8. Perf check (home scope)

- No new assets, no new dependencies, no new scripts. Stage lost DOM (two era paragraphs) — smaller payload.
- Artwork plate: `ResilientArtworkImage` with backup src (unchanged); no shadow added (Phase 4 plate rule holds).
- Preload set unchanged (3 critical fonts ≈63 KB).
- Honest limit: Lighthouse numbers deferred to 5g.

## 9. Deviations from Phase 3 / 4

1. **EN home header CTA INQUIRE→LISTEN** (made in 5a, affects home): Phase 3 §7 promotes "Dengarkan" into the mobile header; the EN chrome's CTA was INQUIRE (a booking action in the listen slot), inconsistent with the ID chrome. Smallest call: EN CTA = LISTEN → `/en/music`; inquiry remains one tap away (nav CONTACT, footer, footer CONNECT). Documented, not silent.
2. **Stage stat "MULAI 2020" kept** although the hero facts strip already says "Sejak 2020": Phase 4 anti-pattern-6 allows computed counters and Phase 3 only ordered the *era timeline* removed; removing a second identical fact was not mandated. Kept for minimum change.
3. **Hero label default changed** DENGARKAN KARYA → DENGAR SEKARANG: consequence of R2 (label can no longer come from CMS, so the code default had to be the live label the owner was actually serving). Verified via the 5a live-site fetch (live button read "DENGAR SEKARANG").

## 10. Known limitations

- No browser in sandbox: visual first-5-seconds, mobile layout, and console cleanliness verified via SSR HTML/HTTP only — one human pass needed (5g).
- `contentIsLoading` skeleton path (CMS down) renders the same structure with "Memuat rilisan…" — behavior unchanged, not re-tested live here (no MySQL in sandbox; SSR used fallback content, which is the tested path).
- Game teaser / booking / fan-signal sections were out of 5b's structural scope and untouched.

## 11. Open risks for 5c–5g

- 5c (Music): the "Dengar di kanal resminya" channel list also appears on home — if 5c restructures `/music` channels, keep `publicPlatformLinks` as the shared source (home must not fork its own list).
- 5d (Visuals): "Lihat visual" hero secondary + `#portraits` anchor landings must exist after 5d.
- 5g: Lighthouse + a11y audit + console check; verify JADWAL nav appearance when a confirmed event is published in CMS.
- Content: `activeReleaseStory` fallback copy ("Putar langsung di sini…") is generic until the CMS release has a story field — content gap, not code.
