import { DRAG_THRESHOLD_PX } from "./cursorPose";
import { phraseFor } from "./stagePhrases";
import type { CursorHoverState, SignatureStore } from "./types";

/**
 * Pointer + scroll signal.
 *
 * Satu listener global untuk seluruh situs. Particle field, cursor, dan
 * parallax artwork membaca angka yang sama, jadi tidak ada halaman yang
 * memasang listener pointer sendiri — termasuk cursor: status hover
 * (stop/music/point/aware), elemen magnetik, dan drag di-resolve di sini
 * sekali per event, lalu dibaca cursor loop tiap frame tanpa listener
 * tambahan (docs/motion-performance-liquid-signal-pass.md §5.2).
 *
 * Semua listener pasif: scroll native, keyboard, dan assistive technology
 * tidak pernah diblokir.
 */

export const INTERACTIVE_SELECTOR =
  "a[href], button, [role='button'], input, select, textarea, summary, [data-signal-interactive], [data-cursor]";

/** Area yang tidak bisa disentuh (pose kursor: stop). */
export const STOP_SELECTOR =
  "[data-cursor='stop'], [disabled], [aria-disabled='true'], fieldset[disabled]";
/** Area dengar (pose kursor: music). */
export const MUSIC_SELECTOR = "[data-cursor='music'], audio, video";
/** Area tunjuk (pose kursor: pointing) + target seret magnetik. */
export const POINT_SELECTOR = '[data-cursor="point"]';
export const MAGNETIC_SELECTOR = "[data-signal-magnetic]";
/** Area seret (pose kursor: drag) — mis. rail katalog. */
export const DRAG_SELECTOR = '[data-cursor="drag"]';

/** Satu jam untuk semua sinyal: sama dengan timestamp requestAnimationFrame. */
const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export function attachPointerSignal(store: SignatureStore) {
  if (typeof window === "undefined") return () => undefined;
  const signals = store.signals;

  /**
   * Resolve status hover dari satu target event. Dipakai bersama oleh
   * pointermove dan focusin (keyboard): satu tempat, satu hasil.
   */
  const resolveHover = (
    target: EventTarget | null
  ): {
    hover: CursorHoverState;
    element: Element | null;
    magnetic: HTMLElement | null;
  } => {
    const element = target instanceof Element ? target : null;
    if (!element) return { hover: null, element: null, magnetic: null };
    const stop = element.closest(STOP_SELECTOR);
    if (stop) return { hover: "stop", element: stop, magnetic: null };
    const music = element.closest(MUSIC_SELECTOR);
    if (music) return { hover: "music", element: music, magnetic: null };
    const magnetic = element.closest<HTMLElement>(MAGNETIC_SELECTOR);
    if (magnetic) return { hover: "point", element: magnetic, magnetic };
    const point = element.closest(POINT_SELECTOR);
    if (point) return { hover: "point", element: point, magnetic: null };
    const interactive = element.closest(INTERACTIVE_SELECTOR);
    return {
      hover: interactive ? "aware" : null,
      element: interactive,
      magnetic: null,
    };
  };

  const applyHover = (target: EventTarget | null) => {
    const resolved = resolveHover(target);
    const magnetic = Boolean(resolved.magnetic);
    const interactive = resolved.hover !== null;
    if (signals.hover !== resolved.hover) signals.hover = resolved.hover;
    if (signals.hoverElement !== resolved.element)
      signals.hoverElement = resolved.element;
    if (signals.magneticElement !== resolved.magnetic)
      signals.magneticElement = resolved.magnetic;
    if (signals.interactive !== interactive) signals.interactive = interactive;
    if (signals.magnetic !== magnetic) signals.magnetic = magnetic;
  };

  /** Drag sungguhan: tekan pada elemen drag lalu bergerak melebihi ambang. */
  let dragCandidate: HTMLElement | null = null;
  let dragDownX = 0;
  let dragDownY = 0;

  const onPointerMove = (event: PointerEvent) => {
    const previousX = signals.pointerX;
    const previousY = signals.pointerY;
    const moved = signals.pointerActive && previousX > -9000;
    if (moved) {
      // Dihaluskan supaya satu lompatan besar tidak menghempas partikel.
      signals.pointerVX =
        signals.pointerVX * 0.6 + (event.clientX - previousX) * 0.4;
      signals.pointerVY =
        signals.pointerVY * 0.6 + (event.clientY - previousY) * 0.4;
      // Jam yang sama dengan requestAnimationFrame. Dulu dipakai
      // `event.timeStamp` lalu dibandingkan dengan `Date.now()` di engine —
      // selisihnya 1,7e12 ms, jadi efek seret tidak pernah benar-benar aktif.
      signals.pointerMovedAt = now();
    }
    signals.pointerX = event.clientX;
    signals.pointerY = event.clientY;
    signals.pointerActive = true;
    applyHover(event.target);
    if (signals.pointerPressed && dragCandidate) {
      const dx = event.clientX - dragDownX;
      const dy = event.clientY - dragDownY;
      if (
        !signals.dragging &&
        dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX
      ) {
        signals.dragging = true;
      }
    }
    if (event.pointerType !== "mouse" && signals.pointerPressed) {
      // Drag di layar sentuh menyebarkan titik sepanjang lintasan.
      store.burst(event.clientX, event.clientY, 0.45);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    signals.pointerPressed = true;
    signals.pointerX = event.clientX;
    signals.pointerY = event.clientY;
    signals.pointerActive = true;
    const target = event.target;
    dragCandidate =
      target instanceof Element
        ? target.closest<HTMLElement>(DRAG_SELECTOR)
        : null;
    dragDownX = event.clientX;
    dragDownY = event.clientY;
    applyHover(event.target);
    store.burst(event.clientX, event.clientY, 1);
  };

  const onPointerUp = () => {
    signals.pointerPressed = false;
    signals.dragging = false;
    dragCandidate = null;
  };

  const onPointerLeave = () => {
    signals.pointerActive = false;
    signals.pointerPressed = false;
    signals.dragging = false;
    dragCandidate = null;
    signals.interactive = false;
    signals.magnetic = false;
    signals.hover = null;
    signals.hoverElement = null;
    signals.magneticElement = null;
    signals.pointerX = -9999;
    signals.pointerY = -9999;
    signals.pointerVX = 0;
    signals.pointerVY = 0;
  };

  const onFocusIn = (event: FocusEvent) => {
    // Keyboard user tetap menggerakkan signal: ring mengikuti elemen fokus.
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    applyHover(target);
    const rect = target.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    signals.pointerX = rect.left + rect.width / 2;
    signals.pointerY = rect.top + rect.height / 2;
  };

  let scrollFrame = 0;
  let lastScrollY = 0;
  let lastScrollAt = now();
  /** Sampel pertama hanya menyetel titik acuan, bukan kecepatan. */
  let scrollPrimed = false;
  const readStage = () => {
    // Satu panggung per halaman. Diukur hanya saat scroll/resize yang sudah
    // dibatasi rAF, jadi tidak memicu layout tiap frame.
    const element = document.querySelector("[data-signal-stage]");
    if (!element) {
      signals.stage = null;
      return;
    }
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      signals.stage = null;
      return;
    }
    const viewport = window.innerHeight || 1;
    const center = rect.top + rect.height / 2;
    const span = Math.max(1, viewport * 0.5 + rect.height * 0.5);
    const raw = 1 - Math.abs(center - viewport / 2) / span;
    // Tahan penuh selama panggung masih memenuhi layar, lalu turun mulus.
    const eased = Math.max(0, Math.min(1, raw * 1.45));

    // Jalur scroll (section pembungkus yang sticky) menentukan progres
    // 0..1 — dipakai untuk mengganti kata tanpa pernah membajak scroll.
    const track = document.querySelector("[data-signal-stage-track]");
    let progress = 0;
    if (track) {
      const trackRect = track.getBoundingClientRect();
      const travel = Math.max(1, trackRect.height - viewport);
      progress = Math.max(0, Math.min(1, -trackRect.top / travel));
    }

    signals.stage = {
      x: rect.left + rect.width / 2,
      y: center,
      w: rect.width,
      h: rect.height,
      visibility: eased * eased * (3 - 2 * eased),
      progress,
    };

    // Frasa yang sedang disusun adalah state diskret: hanya berubah dua kali
    // sepanjang jalur, jadi aman dikirim ke React (baris konteks ikut ganti).
    const phrase = phraseFor(progress);
    if (store.getSnapshot().stagePhrase !== phrase) {
      store.patch({ stagePhrase: phrase });
    }
  };
  const readScroll = () => {
    scrollFrame = 0;
    const y = window.scrollY || window.pageYOffset || 0;
    const at = now();
    const moved = y !== lastScrollY;

    // Kecepatan gulir px/ms, dihaluskan EMA 0,15. Nilainya meluruh sendiri
    // karena frame lanjutan tetap diukur beberapa saat setelah gulir
    // berhenti — tanpa itu partikel akan terus didorong oleh angka basi.
    const elapsed = Math.max(1, at - lastScrollAt);
    const raw = scrollPrimed ? (y - lastScrollY) / elapsed : 0;
    scrollPrimed = true;
    signals.scrollVelocity += (raw - signals.scrollVelocity) * 0.15;
    if (Math.abs(signals.scrollVelocity) < 0.0015) signals.scrollVelocity = 0;
    lastScrollY = y;
    lastScrollAt = at;

    signals.scrollY = y;
    const viewport = window.innerHeight || 1;
    signals.heroProgress = Math.max(0, Math.min(1, y / (viewport * 0.9)));
    // Rect panggung hanya berubah kalau halaman benar-benar bergeser; frame
    // peluruhan tidak perlu membayar layout read lagi.
    if (moved || !signals.stage) readStage();

    // Terus ukur sampai kecepatannya habis, supaya dorongan partikel
    // mereda mulus alih-alih berhenti mendadak di frame terakhir.
    if (signals.scrollVelocity !== 0) {
      scrollFrame = window.requestAnimationFrame(readScroll);
    }
  };
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(readScroll);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerUp, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave, { passive: true });
  document.addEventListener("focusin", onFocusIn);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  readScroll();

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    document.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("focusin", onFocusIn);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
  };
}
