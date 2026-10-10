import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSignatureState } from "@/signature/useSignature";
import "./SignalMark.css";

/**
 * Signal Mark — satu jejak sinyal kecil yang tetap hidup di sudut aman
 * viewport: "sisa sinyal yang masih bergerak di ruangan setelah musik berhenti".
 *
 * Bukan kursor, bukan indikator, bukan spinner: penanda suasana. Kursor tetap
 * sepenuhnya native (lihat docs/signal-mark-pass.md).
 *
 * Semua geraknya di CSS (transform/opacity). Tidak ada loop rAF, tidak ada
 * listener pointer, tidak ada pointer tracking, tidak ada canvas. JavaScript-nya
 * hanya:
 * - dua subscription state diskrit (status audio, fase transisi rute);
 * - satu IntersectionObserver untuk menekan mark saat bar bawah footer dekat
 *   (mark tidak pernah menutupi teks jam studio di kanan bawah footer).
 */
export function SignalMark() {
  const audioState = useSignatureState(snapshot => snapshot.audio.state);
  const phase = useSignatureState(snapshot => snapshot.transition.phase);
  const location = usePathname() || "/";
  const [nearFooter, setNearFooter] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Footer berganti setiap pindah rute — amati ulang targetnya.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const target = document.querySelector(".nf-footer .footer-bottom");
    if (!target) return;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) setNearFooter(entry.isIntersecting);
      },
      // RootMargin bawah negatif: hanya bangun saat bar bawah footer sudah
      // dekat dengan tepi bawah viewport — tempat mark ini sendiri berada.
      { rootMargin: "0px 0px -48px 0px", threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [location]);

  const playing = audioState === "playing" || audioState === "loading";
  const transit = phase === "sweep" || phase === "settle";

  return (
    <div
      ref={rootRef}
      className={`an-signal-mark${playing ? " is-playing" : ""}${transit ? " is-transit" : ""}${nearFooter ? " is-near-footer" : ""}`}
      data-audio-state={audioState}
      aria-hidden="true"
    >
      <span className="an-signal-mark-trace" />
      <span className="an-signal-mark-seg an-signal-mark-seg--a" />
      <span className="an-signal-mark-seg an-signal-mark-seg--b" />
      <span className="an-signal-mark-seg an-signal-mark-seg--c" />
      <span className="an-signal-mark-point" />
    </div>
  );
}
