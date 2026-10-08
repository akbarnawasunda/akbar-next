import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSignatureRuntime, useSignatureState } from "@/signature/useSignature";
import { INTERACTIVE_SELECTOR } from "@/signature/pointerSignal";
import {
  DRAG_THRESHOLD_PX,
  STILL_THRESHOLD_MS,
  resolveCursorPose,
  type CursorHover,
  type CursorPose,
} from "@/signature/cursorPose";
import "./CursorSignal.css";

/**
 * Cursor companion (desktop).
 *
 * Titik kecil presisi (instrumen — selalu di posisi pointer yang sebenarnya)
 * ditemani mascot kecil yang mengikuti dengan jeda halus dan berganti pose
 * menurut apa yang sedang dilakukan pengunjung: diam, mendekati sesuatu yang
 * bisa diklik, menunjuk CTA penting, menekan, menggeser, diam cukup lama,
 * mengitari konten musik, atau berhenti di elemen yang memang tidak bisa
 * dipakai. Bukan dekorasi cursor generik — ini bahasa interaksi yang dipakai
 * di seluruh situs publik, lihat client/src/signature/cursorPose.ts untuk
 * urutan prioritasnya.
 *
 * Tidak pernah tampil di perangkat sentuh atau saat reduced motion, tidak
 * pernah menyentuh focus ring asli, dan tidak pernah menangkap pointer
 * (seluruh lapisan ini aria-hidden + pointer-events: none).
 */

const STOP_SELECTOR =
  '[data-cursor="stop"], [aria-disabled="true"], [disabled], button:disabled, input:disabled, select:disabled, textarea:disabled';
const MUSIC_SELECTOR = '[data-cursor="music"]';
const POINT_SELECTOR = '[data-cursor="point"], [data-signal-magnetic]';
const DRAG_SELECTOR = '[data-cursor="drag"]';

/** Jarak tetap mascot dari posisi pointer sebenarnya — tidak pernah menutupi
 *  titik presisi atau teks/tombol di baliknya. */
const COMPANION_OFFSET_X = 16;
const COMPANION_OFFSET_Y = 20;

function resolveHover(target: EventTarget | null): CursorHover {
  if (!(target instanceof Element)) return null;
  if (target.closest(STOP_SELECTOR)) return "stop";
  if (target.closest(MUSIC_SELECTOR)) return "music";
  if (target.closest(POINT_SELECTOR)) return "point";
  if (target.closest(INTERACTIVE_SELECTOR)) return "aware";
  return null;
}

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export function CursorSignal() {
  const { store } = useSignatureRuntime();
  const layerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const companionRef = useRef<HTMLDivElement>(null);
  const coarse = useSignatureState(snapshot => snapshot.capability.coarsePointer);
  const reduced = useSignatureState(snapshot => snapshot.capability.reducedMotion);
  const enabled = !coarse && !reduced;
  const [pose, setPose] = useState<CursorPose>("idle");

  useEffect(() => {
    if (!enabled) return;
    const layer = layerRef.current;
    const dot = dotRef.current;
    const companion = companionRef.current;
    if (!layer || !dot || !companion) return;
    const signals = store.signals;

    let x = signals.pointerX;
    let y = signals.pointerY;
    let frame = 0;
    let magnetTarget: HTMLElement | null = null;

    let hover: CursorHover = null;
    let pressed = false;
    let dragging = false;
    let dragCandidate = false;
    let downX = 0;
    let downY = 0;
    let lastPose: CursorPose = "idle";
    let wasActive = signals.pointerActive;

    const applyMagnet = (element: HTMLElement | null) => {
      if (magnetTarget && magnetTarget !== element) {
        magnetTarget.style.setProperty("--magnetic-x", "0px");
        magnetTarget.style.setProperty("--magnetic-y", "0px");
      }
      magnetTarget = element;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      hover = resolveHover(event.target);

      const magneticTarget =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-signal-magnetic]")
          : null;
      applyMagnet(magneticTarget);
      if (magneticTarget) {
        const rect = magneticTarget.getBoundingClientRect();
        const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
        magneticTarget.style.setProperty("--magnetic-x", `${offsetX.toFixed(2)}px`);
        magneticTarget.style.setProperty("--magnetic-y", `${offsetY.toFixed(2)}px`);
      }

      if (pressed && dragCandidate && !dragging) {
        const dx = event.clientX - downX;
        const dy = event.clientY - downY;
        if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) dragging = true;
      }
    };

    // Keyboard navigation menggerakkan pointer signal (lihat focusin di
    // pointerSignal.ts), tapi tidak pernah memicu pointermove — tanpa ini
    // mascot tidak pernah sadar elemen fokus itu apa.
    const onFocusIn = (event: FocusEvent) => {
      hover = resolveHover(event.target);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pressed = true;
      dragging = false;
      downX = event.clientX;
      downY = event.clientY;
      dragCandidate =
        event.target instanceof Element
          ? Boolean(event.target.closest(DRAG_SELECTOR))
          : false;
    };

    const onPointerUp = () => {
      pressed = false;
      dragging = false;
      dragCandidate = false;
    };

    const loop = () => {
      // Lapisan hanya hidup selama pointer benar-benar di dalam dokumen.
      // Saat pointer meninggalkan jendela (atau masuk ke iframe SoundCloud di
      // rak player), pointerleave pada pointerSignal.ts menandai pointer tidak
      // aktif — lapisan disembunyikan, bukan dikejar sampai koordinat -9999
      // yang membuat mascot menyapu layar. Saat pointer kembali, mascot
      // langsung menempel di posisi pointer (tidak ada fly-in).
      const active = signals.pointerActive;
      if (active !== wasActive) {
        wasActive = active;
        layer.classList.toggle("is-idle", !active);
        if (active) {
          x = signals.pointerX;
          y = signals.pointerY;
        }
      }

      const still =
        signals.pointerActive && now() - signals.pointerMovedAt > STILL_THRESHOLD_MS;

      const nextPose = resolveCursorPose({ pressed, dragging, hover, still });
      if (nextPose !== lastPose) {
        lastPose = nextPose;
        setPose(nextPose);
      }

      x += (signals.pointerX - x) * 0.22;
      y += (signals.pointerY - y) * 0.22;

      dot.style.transform = `translate3d(${signals.pointerX}px, ${signals.pointerY}px, 0)`;
      companion.style.transform = `translate3d(${(x + COMPANION_OFFSET_X).toFixed(1)}px, ${(y + COMPANION_OFFSET_Y).toFixed(1)}px, 0)`;

      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    frame = requestAnimationFrame(() => {
      // Atribut dipasang di frame pertama loop yang benar-benar jalan: sampai
      // titik ini kursor native tetap aktif, jadi tidak pernah ada momen tanpa
      // kursor sama sekali bila loop belum sempat hidup.
      document.documentElement.dataset.signatureCursor = "on";
      loop();
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("focusin", onFocusIn);
      applyMagnet(null);
      delete document.documentElement.dataset.signatureCursor;
    };
  }, [enabled, store]);

  // Aset pose dipanaskan sekali di awal supaya ganti pose pertama kali tidak
  // menunggu network — gambarnya kecil (ikon 128px), bukan beban berarti.
  useEffect(() => {
    if (!enabled || typeof Image === "undefined") return;
    const sources = [
      "/assets/cursor/01_idle_normal_128px.png",
      "/assets/cursor/02_curious_looking_128px.png",
      "/assets/cursor/03_pointing_128px.png",
      "/assets/cursor/04_click_pressing_128px.png",
      "/assets/cursor/05_dragging_pulling_128px.png",
      "/assets/cursor/06_thinking_128px.png",
      "/assets/cursor/07_music_vibing_128px.png",
      "/assets/cursor/08_stop_notavailable_128px.png",
    ];
    sources.forEach(src => {
      const image = new Image();
      image.src = src;
    });
  }, [enabled]);

  if (!enabled) return null;

  // Portal ke <body>: lapisan kursor harus hidup di stacking context AKAR.
  // `.an-public-shell` memakai `isolation: isolate` dan drawer mobile diportal
  // ke <body> — tanpa portal ini, tidak ada z-index di dalam shell yang bisa
  // pernah mengalahkan overlay tersebut (docs/desktop-visual-qa-cursor-pass.md §6).
  return createPortal(
    <div
      className="an-cursor-signal is-idle"
      aria-hidden="true"
      ref={layerRef}
    >
      <div className="an-cursor-dot" ref={dotRef} />
      <div className="an-cursor-mascot" ref={companionRef}>
        <div key={pose} className="an-cursor-mascot-pose" data-pose={pose} />
      </div>
    </div>,
    document.body
  );
}
