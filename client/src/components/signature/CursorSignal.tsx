import { useEffect, useRef } from "react";
import {
  useSignatureRuntime,
  useSignatureState,
} from "@/signature/useSignature";
import "./CursorSignal.css";

type CursorState = "default" | "interactive" | "artwork" | "music" | "drag";

const ARTWORK_TARGET =
  "[data-cursor='artwork'], .an-artwork-card, .an-doc-art, .an-cat-hero-art, .an-vis-hero-plate";
const MUSIC_TARGET =
  "[data-cursor='music'], .an-global-player, .an-feature-player, .an-artwork-card-preview, .an-audio-player-shell";
const DRAG_TARGET = "[data-cursor='drag'], [data-drag], .an-rail, .an-cat-rail";

/**
 * Mark kursor Akbar Nawasunda (desktop).
 *
 * Siluetnya dibangun dari dua potongan sudut: batang A yang terbuka dan
 * counterform N. Ia tetap terbaca tanpa glow, ring, blur, atau logo teks.
 * Kecepatannya hanya memiringkan dan memanjangkan bahan beberapa piksel;
 * particle field membaca signal pointer yang sama dan menjadi respons
 * material di belakangnya.
 */
export function CursorSignal() {
  const { store } = useSignatureRuntime();
  const cursorRef = useRef<HTMLDivElement>(null);
  const echoRef = useRef<HTMLSpanElement>(null);
  const coarse = useSignatureState(
    snapshot => snapshot.capability.coarsePointer
  );
  const reduced = useSignatureState(
    snapshot => snapshot.capability.reducedMotion
  );
  const enabled = !coarse && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    const echo = echoRef.current;
    if (!cursor || !echo) return;

    const signals = store.signals;
    let echoX = signals.pointerX;
    let echoY = signals.pointerY;
    let lean = 0;
    let stretch = 1;
    let frame = 0;
    let state: CursorState = "default";
    let magnetTarget: HTMLElement | null = null;

    const applyMagnet = (element: HTMLElement | null) => {
      if (magnetTarget && magnetTarget !== element) {
        magnetTarget.style.setProperty("--magnetic-x", "0px");
        magnetTarget.style.setProperty("--magnetic-y", "0px");
      }
      magnetTarget = element;
    };

    const stateFor = (target: EventTarget | null): CursorState => {
      if (!(target instanceof Element)) return "default";
      if (target.closest(MUSIC_TARGET)) return "music";
      if (target.closest(ARTWORK_TARGET)) return "artwork";
      if (target.closest(DRAG_TARGET)) return "drag";
      if (
        target.closest(
          "a[href], button, [role='button'], input, select, textarea, summary, [data-signal-interactive]"
        )
      ) {
        return "interactive";
      }
      return "default";
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      state = stateFor(event.target);
      cursor.dataset.state = state;

      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-signal-magnetic]")
          : null;
      applyMagnet(target);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
      target.style.setProperty("--magnetic-x", `${offsetX.toFixed(2)}px`);
      target.style.setProperty("--magnetic-y", `${offsetY.toFixed(2)}px`);
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cursor.dataset.pressed = "true";
    };
    const onUp = () => {
      cursor.dataset.pressed = "false";
    };

    const loop = () => {
      const speed = Math.min(
        18,
        Math.hypot(signals.pointerVX, signals.pointerVY)
      );
      const targetLean = Math.max(-14, Math.min(14, signals.pointerVX * 0.42));
      const targetStretch = 1 + speed * 0.012;
      lean += (targetLean - lean) * 0.16;
      stretch += (targetStretch - stretch) * 0.14;
      echoX += (signals.pointerX - echoX) * 0.22;
      echoY += (signals.pointerY - echoY) * 0.22;

      cursor.style.setProperty("--cursor-x", `${signals.pointerX}px`);
      cursor.style.setProperty("--cursor-y", `${signals.pointerY}px`);
      cursor.style.setProperty("--cursor-lean", `${lean.toFixed(2)}deg`);
      cursor.style.setProperty("--cursor-stretch", stretch.toFixed(3));
      echo.style.transform = `translate3d(${(echoX - signals.pointerX).toFixed(2)}px, ${(echoY - signals.pointerY).toFixed(2)}px, 0)`;
      cursor.dataset.active = String(signals.pointerActive);
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    frame = requestAnimationFrame(loop);
    document.documentElement.dataset.signatureCursor = "an-cut";

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      applyMagnet(null);
      delete document.documentElement.dataset.signatureCursor;
    };
  }, [enabled, store]);

  if (!enabled) return null;

  return (
    <div
      className="an-cursor-signal"
      ref={cursorRef}
      data-state="default"
      data-pressed="false"
      data-active="false"
      aria-hidden="true"
    >
      <span className="an-cursor-mark">
        <i className="an-cursor-cut an-cursor-cut--primary" />
        <i className="an-cursor-cut an-cursor-cut--counter" />
        <i className="an-cursor-cut an-cursor-cut--echo" ref={echoRef} />
      </span>
    </div>
  );
}
