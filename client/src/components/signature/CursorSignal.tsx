import { useEffect, useRef } from "react";
import { useSignatureState } from "@/signature/useSignature";
import "./CursorSignal.css";

const INTERACTIVE_SELECTOR =
  "a[href], button, [role='button'], input, select, textarea, summary, [data-signal-interactive]";

/**
 * A lightweight desktop pointer accent.
 *
 * It updates only when the visitor moves their pointer—there is no permanent
 * animation loop. Native cursor and focus behavior remain intact.
 */
export function CursorSignal() {
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
    let magnetTarget: HTMLElement | null = null;

    const releaseMagnet = () => {
      if (!magnetTarget) return;
      magnetTarget.style.setProperty("--magnetic-x", "0px");
      magnetTarget.style.setProperty("--magnetic-y", "0px");
      magnetTarget = null;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const interactiveTarget =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(INTERACTIVE_SELECTOR)
          : null;
      const magneticTarget =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-signal-magnetic]")
          : null;
      const interactive = Boolean(interactiveTarget);

      dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      ring.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) scale(${interactive ? "1.16" : "1"})`;
      ring.dataset.interactive = String(interactive);

      if (magnetTarget && magnetTarget !== magneticTarget) releaseMagnet();
      if (!magneticTarget) return;
      magnetTarget = magneticTarget;
      const rect = magneticTarget.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
      magneticTarget.style.setProperty(
        "--magnetic-x",
        `${offsetX.toFixed(2)}px`
      );
      magneticTarget.style.setProperty(
        "--magnetic-y",
        `${offsetY.toFixed(2)}px`
      );
    };

    const onLeave = () => {
      dot.style.transform = "translate3d(-9999px, -9999px, 0)";
      ring.style.transform = "translate3d(-9999px, -9999px, 0)";
      ring.dataset.interactive = "false";
      releaseMagnet();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      releaseMagnet();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="an-cursor-signal" aria-hidden="true">
      <div className="an-cursor-dot" ref={dotRef} />
      <div className="an-cursor-ring" ref={ringRef} />
    </div>
  );
}
