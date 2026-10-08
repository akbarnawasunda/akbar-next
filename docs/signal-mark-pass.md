# Cursor Replacement — Signal Mark Pass — Diagnosis

**Date:** 8 Oktober 2026 · **Branch:** `arena/8751ebb7-akbar-next` (builds on
`a2ac377` visual-QA pass + `899e5fe` motion pass) · **Status: do not merge until verified**

Core decision (from the brief): **remove the custom cursor system entirely** —
dot, mascot companion, lerp, magnetic pull, hover poses, cursor RAF loop,
cursor pointer tracking, cursor portal, `cursor: none` — and restore the fully
native pointer. Replace it with one tiny ambient element: the **Signal Mark**.
The particle system stays untouched (PARTICLE = MATERIAL, LIQUID = BEHAVIOR).

---

## 1. What the old cursor system consists of (removal inventory)

| Piece | Location | Disposition |
|---|---|---|
| Cursor component (dot + mascot + portal + rAF loop + pose state) | `components/signature/CursorSignal.tsx` | **delete** |
| Cursor CSS (dot, 8 mascot poses, `--z-cursor`, `cursor: none` gate, magnetic/drag transforms) | `components/signature/CursorSignal.css` | **delete** |
| Pose state machine (pure) + `STILL_THRESHOLD_MS` / `DRAG_THRESHOLD_PX` | `signature/cursorPose.ts` | **delete** (`DRAG_THRESHOLD_PX = 6` was only imported by `useDragScroll` — the hook is legitimate drag-to-scroll on the Music rail, so the constant moved in as a local; its `data-dragging` attribute went too: only the deleted cursor read it) |
| Pose machine tests | `server/cursorPose.test.ts` | **delete** (replaced by Signal Mark regression tests) |
| Cursor mascot pose assets (16 PNG, `client/public/assets/cursor/`) | only referenced by the deleted files | **delete** |
| Shell mount `<CursorSignal />` | `shell/PublicShell.tsx` | replace with `<SignalMark />` |
| Cursor z-index token | `index.css` `--z-cursor: 10000` | **remove** (scale returns to splash-only top) |
| Native-cursor hiding (`html[data-signature-cursor="on"] * { cursor: none }`) | CursorSignal.css | **delete** → native cursor restored everywhere |
| Cursor signals: `hover`, `hoverElement`, `magneticElement`, `dragging`, `interactive`, `magnetic` | `types.ts`, `signatureStore.ts`, `pointerSignal.ts` | **remove** (`interactive`/`magnetic` were already write-only dead state) |
| `pointerPressed` | `types.ts`, `signatureStore.ts`, `pointerSignal.ts` | **keep** — the particle field's idle check reads it (~`particleField.ts` activity test); it is field behavior, not cursor state |
| Cursor selectors `STOP/MUSIC/POINT/MAGNETIC/DRAG`, `resolveHover`, `applyHover`, drag tracking | `pointerSignal.ts` | **remove** |
| `INTERACTIVE_SELECTOR` + `data-signal-interactive` (27 sites, 8 files) | various TSX | **remove** (only the cursor read them) |
| `data-cursor` hints (`point`/`music`/`drag`) | 8 TSX files | **remove** |
| Mascot hero image `/assets/akbar-mascot-doodle.webp` | Home hero | **keep** — legitimate non-cursor use (the mascot itself stays on the site; only its cursor-following behavior goes) |
| Native cursor affordances (`cursor: pointer` on buttons etc.) | SceneKit etc. | **keep** — native cursor must work normally |
| Tests referencing the cursor | `desktopQaCursorPass`, `motionPerformancePass`, `signatureChrome`, `signatureField`, `stagePhraseRotation`, `signatureRuntime` stubs, `bench` stubs | update / replace |
| DESIGN.md §16 "CUSTOM CURSOR" | `DESIGN.md` | rewrite → native cursor + Signal Mark |

**What the pointer layer KEEPS** (the particle field depends on it — do not remove):
pointer position/velocity/active tracking, `pointerMovedAt`, scroll velocity +
self-decaying rAF chain, stage measurement, click/touch **bursts** (particle
ripple — field behavior, not cursor), focusin pointer positioning (keyboard
users still disturb the field).

## 2. Signal Mark — concept

"A dark room after the music has stopped, with one tiny residual signal still
moving." A 48×12px viewport-level ambient mark in the bottom-right safe area:
a 1px graphite hairline trace with **three asymmetric steel-blue segments**
(10/16/6px — a minimal signal code, echoing the signature-rail ticks and section
hairlines) and **one 3px signal point** that slowly travels the line. No text,
no numbers, no labels, no spinner/equalizer/waveform reading.

Form ingredients come straight from the existing system: `--acid` steel blue,
`--ink-line` hairlines, tabular micro-geometry, square/lightly-rounded only.

## 3. Position — inspected, not blind

Bottom-right safe area (`right: 28px; bottom: 28px`, safe-area inset on mobile),
because the audit shows:

- **Audio dock** (fixed, full-width bottom, `--z-player` 48) occupies the strip
  when visible → the mark **lifts above it** with pure CSS, reusing the dock's
  own state attributes: `html[data-an-player="visible"]` →
  `bottom: calc(68px + 28px + safe-area)`; shelf open → `+166px`; the mobile
  variants (76px ≤640px, 80px coarse) mirror the dock's own body-padding rules.
- **Footer bottom bar** (copyright left, live clock right) owns the bottom-right
  at page end → one IntersectionObserver on `.footer-bottom` suppresses the mark
  (fade out) whenever that row is near the viewport bottom. It never covers text.
- **Signature rail** (`nf-signature-rail`) is dead code — not mounted anywhere —
  so no right-edge conflict at any width. `.an-shell-hint` is not rendered —
  bottom-left free (unused; mark stays right for one consistent composition).
- **JEDAG RUN** — the mark is mounted by `ShellSurfaces`, which only runs on
  editorial routes → automatically absent in the game. Studio routes likewise.
- **Mobile drawer** (z 9999) covers it when open; touch devices pay ~zero cost
  (see §5).
- **Z-index:** the mark gets its own token `--z-mark: 60` — above the route
  curtain (58) and field-transit (59), below lightbox (70). The curtain veil is
  opaque ink during a route transition, so a mark at `--z-hint` (40) would be
  hidden exactly when its transition sweep should be seen. Above the dock's
  `--z-player` (48) is safe: spatially the mark always lifts above the dock
  (see below), so the two never overlap. `--z-cursor` is gone; the scale's top
  is splash-only again.

## 4. Motion states — all CSS, zero permanent JS animation

| State | Trigger (event-driven) | Behavior |
|---|---|---|
| IDLE | default | point drifts the line over 9s (alternate); segments breathe (opacity, staggered 5–7s). Compositor-only keyframes. |
| SCROLL | `pointerSignal` toggles `data-signal-scroll="up\|down"` on `<html>` only on velocity **transitions** (idle→scrolling, direction change, scrolling→idle — guarded writes, no per-frame work) | line stretches (scaleX 1→1.12), point quickens (9s→2.8s); direction reverses the point's drift. Absent attribute = zero animation work. |
| AUDIO | `audio.state` (discrete React subscription) → `data-audio-state` on the mark; amplitude bridge: the dock's existing epsilon-throttled loop also writes `--an-signal-amp` on `:root` (one extra style write per frame **while playing only**, piggybacking shared infrastructure — no new loop). On stop/pause the property is **removed** again, so the mark returns to pure idle breathing instead of remembering the last amplitude. | point pulse quickens; opacity follows `calc(0.35 + amp*0.4)` — a breath, not an equalizer. |
| TRANSITION | `transition.phase` (discrete) → `is-transit` class while phase is `sweep`/`settle` | one short sweep (640ms): line scaleX 0.7→1.14→1 + the point dashes across once (`forwards`). No second transition system. |
| REDUCED MOTION | `prefers-reduced-motion` | all movement off; a static subtle mark remains (segments at low opacity, point parked). |

No RAF loop, no pointermove listener, no pointer tracking, no canvas, no
per-frame React state, no layout reads/writes. The only JS: two discrete
subscriptions (audio state, transition phase), one IntersectionObserver (footer),
and the guarded scroll-direction attribute in the shared pointer layer.

## 5. Performance — what is removed vs. what remains

**Removed:** the cursor rAF loop (per-frame transform writes + pose machine +
`setPose` renders), the cursor's duplicate pointer listeners (hover `closest()`
scans per pointermove), the cursor portal + layer, the `cursor: none` cascade,
the magnetic layout reads, the mascot pose preloading, 16 image assets, the pose
state machine + its tests.

**Remaining idle cost of the Signal Mark:** two CSS keyframe animations on a
48×12px element (compositor), one IntersectionObserver (fires only when the
footer row crosses the threshold), and guarded attribute writes on scroll
transitions. When nothing happens: no JS animation work at all. The particle
field keeps its own (already idle-throttled) engine — untouched, unmerged.

## 6. Verification — results (8 Oktober 2026)

- `pnpm lint` (tsc --noEmit): **clean**.
- `pnpm test`: **61 files / 383 tests green** (was 379 after pass 2 —
  `cursorPose.test.ts` removed, `signalMark.test.ts` added with 12 regression
  contracts: native cursor restored — no `cursor: none`, no
  `data-signature-cursor`, no `--z-cursor`, no cursor files/assets left, no
  `data-cursor` attributes; SignalMark mounted in the shell and absent from SSR
  HTML; no rAF/pointer/scroll listeners in the mark; reduced-motion CSS;
  scroll/audio/transition states wired through the shared signals; safe-area
  placement, dock lift, footer suppression; `desktopQaCursorPass` +
  `motionPerformancePass` cursor blocks replaced with native-cursor + Signal
  Mark contracts; `signatureChrome` shell layers + `signatureRuntime`
  reduced-motion file list updated; field/stage-phrase/bench stubs no longer
  carry the removed cursor signal fields).
- `pnpm build` (vite client+SSR + esbuild server): **OK**.
- `pnpm audit:layout`: **baseline-identical** — only the 2 pre-existing
  `studio.css` errors (studio is not a public surface; out of scope).
- `BASE=http://localhost:3000 bash scripts/verify-ssr.sh`: **29/29 content
  checks pass**; the 3 redirect checks fail on the dev server because the
  Vercel redirect layer only exists in production (pre-existing, covered by
  `vercelRouting.test.ts`).
- SSR smoke of `/` and `/music`: served HTML contains **no** `an-signal-mark`,
  `data-cursor`, `cursor: none`, or `an-cursor` — the mark is client-only, like
  the old cursor layer was.
- Bench (`scripts/bench-particle-field.ts`): per-phase costs unchanged —
  desktop terkunci 0.201ms avg @5200 pts, p95 0.233ms; phone lite terkunci
  0.066ms @1217 pts; idle **74 frames / 10s ≈ 7.3fps** (vs 60fps) with the
  wordmark still breathing. The cursor's rAF loop is gone from the runtime;
  nothing replaced it.
- **Limitation stated honestly:** no browser is installable in this sandbox, so
  live cursor feel / paint / FPS could not be measured in a real renderer.
  Evidence: source contracts, SSR HTML diff, and the absence of the removed
  loops (grep-verified). A quick manual pass (native cursor normal, mark calm at
  idle, lifts above the dock, hides at the footer) is recommended before merging.
