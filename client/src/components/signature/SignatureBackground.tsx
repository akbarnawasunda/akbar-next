import { useEffect, useRef } from "react";
import type { ParticleField } from "@/signature/field/particleField";
import {
  useSignatureRuntime,
  useSignatureState,
} from "@/signature/useSignature";
import "./SignatureBackground.css";

/**
 * An exceptional canvas layer, not a permanently-running wallpaper.
 *
 * The public pages own their visual atmosphere locally. This field only wakes
 * up for the explicit frequency state and short route-transition label, so it
 * cannot add an always-on animation cost or compete with the composition.
 */
export function SignatureBackground() {
  const { store } = useSignatureRuntime();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleField | null>(null);

  const tier = useSignatureState(snapshot => snapshot.capability.tier);
  const ready = useSignatureState(snapshot => snapshot.fieldReady);
  const frequency = useSignatureState(snapshot => snapshot.frequency.active);
  const transit = useSignatureState(
    snapshot => snapshot.transition.phase !== "idle"
  );
  const active = frequency || transit;
  const mode = frequency ? "frequency" : "quiet";

  useEffect(() => {
    if (!active || !ready || tier === "off") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;

    void import("@/signature/field/particleField").then(module => {
      if (disposed) return;
      fieldRef.current = module.createParticleField(
        canvas,
        store.signals,
        () => {
          const snapshot = store.getSnapshot();
          return {
            mode: snapshot.frequency.active ? "frequency" : "quiet",
            capability: snapshot.capability,
            frequency: snapshot.frequency.active,
            era: { index: snapshot.era.index, total: snapshot.era.total },
            transition: snapshot.transition.phase,
            transitLabel: snapshot.transition.targetLabel,
          };
        }
      );
    });

    return () => {
      disposed = true;
      fieldRef.current?.destroy();
      fieldRef.current = null;
    };
  }, [active, ready, tier, store]);

  if (!active || tier === "off") return null;

  return (
    <div
      className="an-signature-field"
      data-signature-mode={mode}
      data-signature-tier={tier}
      data-signature-transit={transit}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
