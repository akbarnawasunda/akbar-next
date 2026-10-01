import { useSignatureState } from "@/signature/useSignature";
import "./RouteSignalCurtain.css";

/**
 * Route curtain.
 *
 * Timeline total ±840ms: wordmark naik → garis signal menyapu → scanline →
 * nama halaman tujuan → konten masuk. Label tujuan diambil dari metadata rute
 * bersama (`signature/routeSignal.ts`), tidak pernah di-hardcode per halaman.
 *
 * Fase `idle` tidak merender apa pun, jadi tirai ini tidak pernah muncul di
 * HTML hasil SSR dan dilewati sepenuhnya saat reduced motion.
 */
export function RouteSignalCurtain() {
  const phase = useSignatureState(snapshot => snapshot.transition.phase);
  const label = useSignatureState(snapshot => snapshot.transition.targetLabel);
  const reduced = useSignatureState(snapshot => snapshot.capability.reducedMotion);

  if (reduced || phase === "idle" || !label) return null;

  return (
    <div
      className={`an-route-signal is-${phase}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="an-route-signal-inner" aria-hidden="true">
        <span className="an-route-signal-mark">
          <span>AKBAR</span>
        </span>
        <span className="an-route-signal-mark">
          <span>NAWASUNDA</span>
        </span>
        <span className="an-route-signal-line" />
        <span className="an-route-signal-scan" />
        <span className="an-route-signal-target">{label}</span>
      </div>
    </div>
  );
}
