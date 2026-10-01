import { useEffect, useRef } from "react";
import type { ParticleField } from "@/signature/field/particleField";
import { useSignatureRuntime, useSignatureState } from "@/signature/useSignature";
import "./SignatureBackground.css";

/**
 * Lapisan partikel global.
 *
 * - Canvas selalu `aria-hidden` dan `pointer-events: none`; wordmark asli
 *   tetap hidup sebagai teks di DOM untuk SEO dan screen reader.
 * - Engine di-import dinamis setelah runtime menandai `fieldReady`
 *   (idle/▸1.4s), jadi tidak ikut menahan LCP.
 * - Mati total saat reduced motion, save-data, atau perangkat yang benar-benar
 *   lemah; perangkat sentuh normal tetap mendapat versi ringan.
 */
export function SignatureBackground() {
  const { store } = useSignatureRuntime();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<ParticleField | null>(null);

  const tier = useSignatureState(snapshot => snapshot.capability.tier);
  const ready = useSignatureState(snapshot => snapshot.fieldReady);
  const mode = useSignatureState(snapshot =>
    snapshot.frequency.active ? "frequency" : snapshot.route.mode
  );

  useEffect(() => {
    if (!ready || tier === "off") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;

    void import("@/signature/field/particleField").then(module => {
      if (disposed) return;
      fieldRef.current = module.createParticleField(canvas, store.signals, () => {
        const snapshot = store.getSnapshot();
        return {
          mode: snapshot.frequency.active ? "frequency" : snapshot.route.mode,
          capability: snapshot.capability,
          frequency: snapshot.frequency.active,
          era: { index: snapshot.era.index, total: snapshot.era.total },
          transition: snapshot.transition.phase,
        };
      });
    });

    return () => {
      disposed = true;
      fieldRef.current?.destroy();
      fieldRef.current = null;
    };
  }, [ready, tier, store]);

  if (tier === "off") return null;

  return (
    <div
      className="an-signature-field"
      data-signature-mode={mode}
      data-signature-tier={tier}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
