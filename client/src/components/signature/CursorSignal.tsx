import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSignatureRuntime, useSignatureState } from "@/signature/useSignature";
import {
  STILL_THRESHOLD_MS,
  resolveCursorPose,
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
 *
 * Arsitektur performa (docs/motion-performance-liquid-signal-pass.md §5.2):
 * SEMUA status pointer (hover, pressed, dragging, target magnetik) di-resolve
 * oleh pointerSignal — satu listener global untuk seluruh situs. Komponen ini
 * hanya menjalankan SATU loop rAF yang membaca sinyal; tidak ada listener
 * pointer tambahan dan tidak ada setState per gerakan pointer. Penulisan
 * transform di-elide: selama pointer diam dan mascot sudah konvergen, loop
 * tidak menulis style sama sekali.
 */

/** Jarak tetap mascot dari posisi pointer sebenarnya — tidak pernah menutupi
 *  titik presisi atau teks/tombol di baliknya. */
const COMPANION_OFFSET_X = 16;
const COMPANION_OFFSET_Y = 20;

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
    let lastPose: CursorPose = "idle";
    let wasActive = signals.pointerActive;
    let magnetTarget: HTMLElement | null = null;
    let lastMagnetX = -1;
    let lastMagnetY = -1;
    // Elision: nilai transform terakhir yang benar-benar ditulis ke DOM.
    let lastDotX = -1;
    let lastDotY = -1;
    let lastMascotX = "";
    let lastMascotY = "";

    const applyMagnet = (element: HTMLElement | null) => {
      if (magnetTarget === element) return;
      if (magnetTarget) {
        magnetTarget.style.setProperty("--magnetic-x", "0px");
        magnetTarget.style.setProperty("--magnetic-y", "0px");
      }
      magnetTarget = element;
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

      // Pose dari sinyal yang sudah di-resolve pointerSignal — tanpa
      // listener tambahan dan tanpa closest() di sini.
      const nextPose = resolveCursorPose({
        pressed: signals.pointerPressed,
        dragging: signals.dragging,
        hover: signals.hover,
        still,
      });
      if (nextPose !== lastPose) {
        lastPose = nextPose;
        setPose(nextPose);
      }

      x += (signals.pointerX - x) * 0.22;
      y += (signals.pointerY - y) * 0.22;

      // Tulis seperlunya: titik hanya saat posisi pointer berubah.
      if (signals.pointerX !== lastDotX || signals.pointerY !== lastDotY) {
        lastDotX = signals.pointerX;
        lastDotY = signals.pointerY;
        dot.style.transform = `translate3d(${signals.pointerX}px, ${signals.pointerY}px, 0)`;
      }
      // Mascot: hanya ditulis selama belum konvergen (epsilon) — begitu
      // menempel di posisi, tidak ada lagi DOM write per frame.
      const converged =
        Math.abs(signals.pointerX - x) < 0.05 &&
        Math.abs(signals.pointerY - y) < 0.05;
      const mascotX = (x + COMPANION_OFFSET_X).toFixed(1);
      const mascotY = (y + COMPANION_OFFSET_Y).toFixed(1);
      if (!converged || mascotX !== lastMascotX || mascotY !== lastMascotY) {
        lastMascotX = mascotX;
        lastMascotY = mascotY;
        companion.style.transform = `translate3d(${mascotX}px, ${mascotY}px, 0)`;
      }

      // Efek magnetik pada elemen sasaran — hanya dihitung ulang saat pointer
      // bergerak (menghindari layout read per frame), sama seperti perilaku
      // lama yang dipicu pointermove.
      if (signals.pointerActive) {
        applyMagnet(signals.magneticElement);
        if (
          magnetTarget &&
          (signals.pointerX !== lastMagnetX || signals.pointerY !== lastMagnetY)
        ) {
          lastMagnetX = signals.pointerX;
          lastMagnetY = signals.pointerY;
          const rect = magnetTarget.getBoundingClientRect();
          const offsetX = ((signals.pointerX - rect.left) / rect.width - 0.5) * 10;
          const offsetY = ((signals.pointerY - rect.top) / rect.height - 0.5) * 7;
          magnetTarget.style.setProperty("--magnetic-x", `${offsetX.toFixed(2)}px`);
          magnetTarget.style.setProperty("--magnetic-y", `${offsetY.toFixed(2)}px`);
        }
      } else {
        applyMagnet(null);
      }

      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(() => {
      // Atribut dipasang di frame pertama loop yang benar-benar jalan: sampai
      // titik ini kursor native tetap aktif, jadi tidak pernah ada momen tanpa
      // kursor sama sekali bila loop belum sempat hidup.
      document.documentElement.dataset.signatureCursor = "on";
      loop();
    });

    return () => {
      cancelAnimationFrame(frame);
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
