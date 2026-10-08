# Motion Performance + Liquid Signal Pass — Diagnosis

**Date:** 8 Oktober 2026 · **Branch:** `arena/8751ebb7-akbar-next` (builds on the
visual-QA/cursor pass, commit `a2ac377`) · **Status: do not merge until verified**

This pass evolves motion, scroll, and the particle system. It is NOT a redesign.
Baseline evidence: `pnpm exec tsx scripts/bench-particle-field.ts` (repo's own
benchmark — measures the particle loop's JavaScript cost per phase).

---

## 1. Motion systems audited

| System | Mechanism | Always-on? |
|---|---|---|
| `signature/field/particleField.ts` (1312 lines) | one shared Canvas2D engine, rAF loop | **yes — every frame, every route** |
| `signature/pointerSignal.ts` | one global pointer/scroll listener layer, rAF-throttled scroll reads | listeners only; scroll rAF self-terminates when velocity decays to 0 |
| `components/signature/CursorSignal.tsx` | one rAF loop + **its own** pointer/down/up/cancel/focusin listeners | yes (loop), listeners duplicated with pointerSignal |
| `lib/smoothScroll.ts` (lenis 1.3.26) | site rAF wrapper pumping `lenis.raf()` | **yes — but idle `raf()` is a no-op** (`Animate.advance` returns when `!isRunning`) |
| `components/signature/GlobalAudioPlayer.tsx` | rAF loop writing `--an-amp` every frame | only while playing |
| `signature/audioSignal.ts` | rAF loop reading analyser / deterministic beat | only while audio active; decay loop on stop |
| `components/ScrollProgress.tsx` | rAF-throttled scroll listener → transform write | event-driven ✓ |
| `components/signature/EraTimeline.tsx` | rAF-throttled scroll → **`setProgress` React state per frame** | while scrolling |
| `components/NightFrequencyChrome.tsx` | `setScrolled(window.scrollY > 32)` **per scroll event, unthrottled** | while scrolling |
| `components/signature/InteractiveArtworkCard.tsx` | pointermove → direct CSS var writes (no setState) ✓ | hover only |
| `MotionOrchestrator` / `Reveal` / `useScrollReveal` | IntersectionObserver ✓ event-driven | no |
| `RouteTransition` / `RouteSignalCurtain` / splash | timeouts + CSS animations ✓ event-driven | no |
| CSS infinite animations (clock pulse, player wave, mascot float, hero breathe/sweep, blink, dot pulse, spin disc, eq bars, shimmer, loading states) | transform/opacity only on tiny elements | cheap, compositor-friendly ✓ |
| `signatureStore` | two-layer: discrete snapshot (React) + high-frequency `signals` (canvas reads, no React) | no React re-renders from pointer/scroll/amplitude ✓ |
| `StudioClock` | 1s interval | trivial ✓ |

## 2. Baseline measurements (bench, before changes)

Desktop full tier, 1440×900 / 1920×1080, wordmark settled ("terkunci"):
**0.158ms avg JS loop @ 5200 points** (p95 0.231ms). Forming: 0.663ms.
Phone lite: 0.034ms settled. The JS loop is cheap — **the unstubbed cost is the
canvas paint**: 5200 `fillRect` + full-screen clear/fade **every frame at 60fps,
forever, on every route**. That is the continuous work a reader pays for.

## 3. Bottlenecks found (highest cost first)

- **B1 — Particle field never idles (highest).** The rAF loop runs full physics
  + full redraw every frame on every route. The only idle-out is home's stage
  early-out (stage invisible + nothing flying). On inner routes (signal/dust/
  era/quiet ambient modes) there is **no idle state at all**: pointer still, no
  scroll, no audio → still 60fps full activity. The engine has an adaptive cost
  governor (cuts point count when a frame exceeds 9ms) but no idle governor.
- **B2 — CursorSignal duplicates the global pointer listeners.** pointerSignal
  already owns pointermove/down/up/cancel/focusin; CursorSignal registers the
  same set again → two handler dispatches + two `closest()` selector scans per
  pointermove. Plus: unconditional per-frame transform writes even when the
  pointer is still and the mascot has converged.
- **B3 — NightFrequencyChrome `setScrolled` per scroll event** (unthrottled;
  React bailout keeps it cheap but it is per-event work + a re-render at the
  threshold crossing).
- **B4 — EraTimeline `setProgress` per scroll frame** → React re-render of the
  whole timeline per frame while scrolling, only to update one CSS variable.
- **B5 — GlobalAudioPlayer writes `--an-amp` every frame** while playing,
  regardless of change.
- **B6 — lenis pump always scheduled.** Idle `lenis.raf()` is a no-op, so the
  cost is one rAF callback/frame — but it keeps a second always-on loop alive
  even when the page is fully idle. Lenis exposes `isScrolling`
  (`false | "native" | "smooth"`) — a reliable public idle signal: "smooth"
  from `onStart` until completion `reset()`, "native" for 400ms after the last
  native scroll (its own timeout, independent of rAF).
- **B7 — Live and Music are identical** (`signal` mode): the brief wants Live
  more energetic than Music. No per-route intensity exists.

## 4. What is already good (preserve)

- Single shared particle engine, Canvas2D only, no WebGL, no libraries.
- Adaptive cost governor (frame-cost feedback cuts/grows active points).
- `visibilitychange` → full stop; route unmount → `destroy()`; game route never
  mounts the field; reduced-motion/save-data/weak device → tier `off` → no canvas.
- Pointer→particle Liquid Signal behavior already exists and is subtle:
  130px repulsion + pointer-velocity drag + click/touch bursts; scroll velocity
  pushes particles; audio amplitude modulates spring/wobble/wave (honestly
  marked `analyzable=false` for third-party iframes).
- Home wordmark formation/release choreography (ATTACHED → FREE → PARKED,
  two-way), phrase morphing on scroll, text-target caching, DPR capped at 1.5.
- Two-layer store: high-frequency signals never touch React.
- All scroll handlers are rAF-throttled except B3/B4; `instr-progress` uses CSS
  `scroll-timeline` (compositor).
- All infinite CSS animations are transform/opacity on small elements.

## 5. Fix plan (in brief order)

1. **Particle state machine + idle mode (B1).** Activity = pointer moved
   recently / pressed / scroll velocity ≠ 0 / amplitude > 0.015 / transition
   active / bursts pending / releasing / forming / points flying. When inactive
   the loop **sleeps to ~8fps via setTimeout(120ms)** instead of stopping —
   residual life (time-based wordmark breathing, ambient drift) stays visible,
   paint cost drops ~7.5×. Instant wake on `pointermove` / `scroll` /
   `pointerdown` (passive field-local listeners) + store subscription (discrete
   changes: route/transition/audio/frequency/era) + existing visibilitychange.
   Physics integrates with the existing `delta` cap, so speed is preserved on
   wake; idle drift simply becomes extremely subtle (the brief's SETTLE → IDLE).
2. **Cursor loop dedup + write elision (B2/B7).** Hover resolution
   (stop/music/point/aware), magnetic element, and drag tracking move into
   pointerSignal's single listener layer (`signals.hover`, `signals.dragging`,
   `signals.magneticElement`). CursorSignal keeps ONLY its rAF loop: pose
   machine + transforms + per-frame magnetic application, reading signals.
   Transform writes are elided when the dot/mascot have not moved (epsilon).
   The cursor never waits for the particle engine (separate loops, unchanged).
3. **rAF-throttle `setScrolled` (B3).**
4. **EraTimeline progress via ref + `style.setProperty` (B4)** — no per-frame
   React re-render.
5. **`--an-amp` written only on material change (B5)** (epsilon 0.004).
6. **Lenis pump gated on `isScrolling` (B6)**: the site rAF wrapper stops when
   lenis is idle and restarts on wheel/touchmove/scroll/keydown (passive) and
   after every programmatic `scrollTo`. A fully idle page then runs exactly ONE
   rAF loop — the cursor loop — matching the brief's budget.
7. **Per-route intensity (B8→brief §11):** `routeSignal` gains `intensity`
   (Live 1.2 > Music 0.9 > home 1.0 > universe 0.85 > visuals 0.65 > quiet 0.5);
   the engine scales wobble/drift subtly. Page personalities stay distinct.
8. **Bench extended** with an idle-phase measurement (frames actually executed
   per simulated second while reading) — the performance evidence for B1.
9. **Contract tests** (`server/motionPerformancePass.test.ts`) guarding each fix.

## 6. Deliberately NOT changed

- Particle identity: AKBAR NAWASUNDA / DJ AKBAR REMIX formations, release
  choreography, phrase system — untouched.
- No fluid simulation, no metaballs, no WebGL, no blur/glow pipelines, no new
  canvases, no cursor trails, no magnetic buttons (the dormant
  `data-signal-magnetic` pull stays dormant in behavior; only its plumbing
  moves into the shared listener layer).
- Audio: no autoplay, no forced audio, no FFT visualizer; amplitude-only
  influence stays subtle; single-player behavior unchanged.
- JEDAG RUN keeps its own system (game route never mounts the field).
- Reduced motion: tier `off` still means zero canvas/cursor/lenis; CSS nuke
  unchanged. Mobile: no lenis, no custom cursor, lite particle tier — plus the
  new idle sleep helps battery most there.
- Typography, header, palette, photography, route personalities — untouched.

## 7. Verification plan

- `pnpm lint`, `pnpm test` (all suites + new contracts), `pnpm build`,
  `pnpm audit:layout`, `scripts/verify-ssr.sh` (dev server).
- Bench before/after: per-phase loop costs must stay equal (the hot loop is
  untouched); new idle phase shows ~8fps vs 60fps while reading.
- SSR smoke of all public routes.
- **Limitation stated honestly:** no browser is installable in this sandbox, so
  real FPS/paint/jank could not be measured in a live renderer. Evidence is the
  repo benchmark (loop cost), source contracts, and SSR — a manual pass in a
  real browser (scroll, hover, audio, idle) is recommended before merging.

---

## 8. Results (after implementation)

**Bench (`pnpm exec tsx scripts/bench-particle-field.ts`), after:**

| Fase | Desktop 1440×900 (full) | Catatan |
|---|---|---|
| merakit (forming) | 0.13–0.60ms avg | sama seperti sebelum — hot loop tidak disentuh |
| terkunci (settled wordmark) | **0.135–0.167ms** @ 4629–5200 titik | sama seperti sebelum (0.158ms baseline) |
| lepas / melintas / debu | 0.05–0.28ms | sama |
| **diam (membaca tenang)** | **74 frame dalam 10 detik ≈ 7.3fps** | vs 60fps penuh — **8,2× lebih sedikit frame yang dieksekusi** (dan paint) saat idle; wordmark tetap bernapas (4629 titik tetap digambar), debu tetap melayang |

Engine yang sama juga mengukur dirinya sendiri: Governor biaya frame aktif
memangkas titik saat frame > 9ms — tidak berubah.

**Test:** 379 lulus (363 baseline + 16 kontrak baru
`server/motionPerformancePass.test.ts`). Suite particle field yang sudah ada
(`signatureField.test.ts` 16 tes, `stagePhraseRotation.test.ts` 4 tes) tetap
hijau — perilaku formasi/pelepasan/debu tidak berubah; harnessnya kini ikut
menggerakkan tidur idle (timeout), bukan hanya rAF.

**Typecheck:** clean. **Build:** client + SSR + server OK. **audit:layout:**
hanya 2 error pre-existing di `studio.css` (sama dengan baseline). **SSR:**
semua rute publik 200; `verify-ssr.sh` 29/29 cek konten (3 cek redirect butuh
lapisan Vercel produksi — pre-existing).

**Perubahan yang diimplementasikan (ringkas):**

1. **Mesin idle engine partikel** — aktivitas (pointer baru bergerak / tekan /
   gulir belum mereda / audio menyala / transisi / burst / pembentukan /
   titik non-ambient terbang) → rAF penuh; tanpa itu → tidur 120ms (~7.3fps).
   Bangun instan oleh pointermove/pointerdown/scroll + subscription store
   (perubahan state diskrit) + visibilitychange. Debu ambient tidak lagi
   menahan laju penuh (`flyingCore`). Tab tersembunyi tetap mati total.
2. **Satu loop kursor** — resolve hover (stop/music/point/aware), drag, dan
   target magnetik pindah ke pointerSignal (satu listener global; CursorSignal
   tidak lagi memasang listener pointer sendiri — tidak ada lagi dua `closest()`
   scan per gerakan). Penulisan transform di-elide saat pointer diam dan mascot
   konvergen. Magnetik dihitung ulang hanya saat pointer bergerak (tanpa layout
   read per frame). Identitas kursor, pose, dan arsitektur layer tidak berubah.
3. **Pompa lenis di-gate** — berhenti saat `lenis.isScrolling === false`,
   bangun oleh wheel/touchmove/scroll/keydown dan setiap scrollTo programmatic.
   Halaman yang benar-benar idle kini hanya menjalankan SATU loop rAF (kursor).
4. **Header `scrolled`** di-throttle ke satu setState per frame.
5. **EraTimeline** — progres garis ditulis sebagai CSS var via ref, bukan
   setState React per frame saat scroll.
6. **Player global** — `--an-amp` hanya ditulis saat berubah ≥ 0.004.
7. **Intensitas per rute** — LIVE 1.2 > MUSIC 0.9, VISUAL 0.65, halaman senyap
   0.5; engine menyalurkannya ke wobble/drift (formasi tetap sama).
8. **Bench diperluas** — fase "diam" mengukur laju idle; stub timeout agar
   harness bisa menggerakkan tidur idle.

**Tidak berubah (sengaja):** formasi AKBAR NAWASUNDA / DJ AKBAR REMIX,
koreografi lepas/terbang/parkir, perilaku pointer partikel (repulsi 130px,
seret, burst), reaktivitas amplitudo audio (termasuk penanda jujur
`analyzable=false` untuk iframe pihak ketiga), single-player & no-autoplay,
JEDAG RUN, splash, tirai rute, reduced-motion (tier `off` = tanpa canvas,
kursor, dan lenis), strategi mobile (tanpa lenis/kursor, tier lite — kini juga
idle-hemat baterai), dan seluruh arsitektur z-index/layer dari pass sebelumnya.
