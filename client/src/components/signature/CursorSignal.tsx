import { useEffect, useRef } from "react";
import {
  useSignatureRuntime,
  useSignatureState,
} from "@/signature/useSignature";
import "./CursorSignal.css";

/**
 * Cursor signal (desktop).
 *
 * Reticle presisi yang merespons elemen interaktif, plus magnetic pull halus
 * untuk tombol bertanda `data-signal-magnetic`. Tidak pernah tampil di
 * perangkat sentuh, tidak menyentuh focus ring, dan tidak menangkap pointer.
 */
export function CursorSignal() {
  const { store } = useSignatureRuntime();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coarse = useSignatureState(
    snapshot => snapshot.capability.coarsePointer
  );
  const reduced = useSignatureState(
    snapshot => snapshot.capability.reducedMotion
  );
  const enabled = !coarse && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    const signals = store.signals;
    let x = signals.pointerX;
    let y = signals.pointerY;
    let scale = 1;
    let frame = 0;
    let magnetTarget: HTMLElement | null = null;

    const applyMagnet = (element: HTMLElement | null) => {
      if (magnetTarget && magnetTarget !== element) {
        magnetTarget.style.setProperty("--magnetic-x", "0px");
        magnetTarget.style.setProperty("--magnetic-y", "0px");
      }
      magnetTarget = element;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      // Do not hide the system cursor before the visitor has moved once. This
      // avoids an invisible pointer during initial page paint.
      document.documentElement.dataset.signatureCursor = "on";
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

    const loop = () => {
      // Keep the expansion compact: an interaction cue, not a spotlight that
      // covers typography or artwork underneath it.
      const targetScale = signals.interactive ? 1.46 : 1;
      x += (signals.pointerX - x) * 0.34;
      y += (signals.pointerY - y) * 0.34;
      scale += (targetScale - scale) * 0.19;
      dot.style.transform = `translate3d(${signals.pointerX}px, ${signals.pointerY}px, 0)`;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale.toFixed(3)})`;
      ring.dataset.interactive = String(signals.interactive);
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      applyMagnet(null);
      delete document.documentElement.dataset.signatureCursor;
    };
  }, [enabled, store]);

  if (!enabled) return null;

  return (
    <div className="an-cursor-signal" aria-hidden="true">
      <div className="an-cursor-dot" ref={dotRef} />
      <div className="an-cursor-ring" ref={ringRef} />
    </div>
  );
}
