import type { SignatureStore } from "./types";

/**
 * Pointer + scroll signal.
 *
 * Satu listener global untuk seluruh situs. Particle field, cursor, dan
 * parallax artwork membaca angka yang sama, jadi tidak ada halaman yang
 * memasang listener pointer sendiri.
 *
 * Semua listener pasif: scroll native, keyboard, dan assistive technology
 * tidak pernah diblokir.
 */

const INTERACTIVE_SELECTOR =
  "a[href], button, [role='button'], input, select, textarea, summary, [data-signal-interactive]";

export function attachPointerSignal(store: SignatureStore) {
  if (typeof window === "undefined") return () => undefined;
  const signals = store.signals;

  const updateInteractive = (target: EventTarget | null) => {
    const element =
      target instanceof Element ? target.closest(INTERACTIVE_SELECTOR) : null;
    const interactive = Boolean(element);
    const magnetic = Boolean(
      element && element.hasAttribute("data-signal-magnetic")
    );
    if (signals.interactive !== interactive) signals.interactive = interactive;
    if (signals.magnetic !== magnetic) signals.magnetic = magnetic;
  };

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
      signals.pointerMovedAt = event.timeStamp || Date.now();
    }
    signals.pointerX = event.clientX;
    signals.pointerY = event.clientY;
    signals.pointerActive = true;
    updateInteractive(event.target);
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
    store.burst(event.clientX, event.clientY, 1);
  };

  const onPointerUp = () => {
    signals.pointerPressed = false;
  };

  const onPointerLeave = () => {
    signals.pointerActive = false;
    signals.pointerPressed = false;
    signals.interactive = false;
    signals.magnetic = false;
    signals.pointerX = -9999;
    signals.pointerY = -9999;
    signals.pointerVX = 0;
    signals.pointerVY = 0;
  };

  const onFocusIn = (event: FocusEvent) => {
    // Keyboard user tetap menggerakkan signal: ring mengikuti elemen fokus.
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    updateInteractive(target);
    const rect = target.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    signals.pointerX = rect.left + rect.width / 2;
    signals.pointerY = rect.top + rect.height / 2;
  };

  let scrollFrame = 0;
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
    signals.stage = {
      x: rect.left + rect.width / 2,
      y: center,
      w: rect.width,
      h: rect.height,
      visibility: eased * eased * (3 - 2 * eased),
    };
  };
  const readScroll = () => {
    scrollFrame = 0;
    const y = window.scrollY || window.pageYOffset || 0;
    signals.scrollY = y;
    const viewport = window.innerHeight || 1;
    signals.heroProgress = Math.max(0, Math.min(1, y / (viewport * 0.9)));
    readStage();
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
