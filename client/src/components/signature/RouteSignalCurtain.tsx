import { SUNDA_NAME } from "@/content/sundaneseScript";
import { useSignatureState } from "@/signature/useSignature";
import "./RouteSignalCurtain.css";

/**
 * Route curtain.
 *
 * Timeline total ±840ms: nama dalam aksara Sunda "ditulis" dari kiri →
 * garis signal menyapu → bacaan Latin muncul → nama halaman tujuan →
 * konten masuk.
 *
 * Fase 6D: tirai lama menaikkan dua baris wordmark Latin — gerakan yang
 * dipakai ribuan situs. Yang tidak bisa ditiru siapa pun adalah namanya
 * sendiri dalam aksara Sunda, jadi itulah yang sekarang jadi isi tirai:
 * satu baris aksara yang tersingkap kiri→kanan seperti sedang dituliskan,
 * dengan bacaan Latin kecil di bawahnya supaya tetap terbaca semua orang. Label tujuan diambil dari metadata rute
 * bersama (`signature/routeSignal.ts`), tidak pernah di-hardcode per halaman.
 *
 * Fase `idle` tidak merender apa pun, jadi tirai ini tidak pernah muncul di
 * HTML hasil SSR dan dilewati sepenuhnya saat reduced motion.
 */
export function RouteSignalCurtain() {
  const phase = useSignatureState(snapshot => snapshot.transition.phase);
  const label = useSignatureState(snapshot => snapshot.transition.targetLabel);
  const reduced = useSignatureState(
    snapshot => snapshot.capability.reducedMotion
  );
  const tier = useSignatureState(snapshot => snapshot.capability.tier);
  const fieldReady = useSignatureState(snapshot => snapshot.fieldReady);
  // Bila particle field hidup, dialah yang menuliskan nama tujuan; tirai
  // cukup jadi sapuan tinta di belakangnya supaya tidak ada teks ganda.
  const particles = fieldReady && tier !== "off";

  if (reduced || phase === "idle" || !label) return null;

  return (
    <div
      className={`an-route-signal is-${phase}`}
      data-particles={particles}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="an-route-signal-inner" aria-hidden="true">
        <span className="an-route-signal-aksara" lang="su-Sund">
          {SUNDA_NAME.script}
        </span>
        <span className="an-route-signal-line" />
        <span className="an-route-signal-mark">
          <span>{SUNDA_NAME.latin}</span>
        </span>
        <span className="an-route-signal-scan" />
        <span className="an-route-signal-target">{label}</span>
      </div>
    </div>
  );
}
