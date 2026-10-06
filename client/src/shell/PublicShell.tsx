import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { CommandPalette } from "@/components/CommandPalette";
import { LightboxProvider } from "@/components/signature/LightboxProvider";
import { CursorSignal } from "@/components/signature/CursorSignal";
import { GlobalAudioPlayer } from "@/components/signature/GlobalAudioPlayer";
import { RouteSignalCurtain } from "@/components/signature/RouteSignalCurtain";
import { SignatureBackground } from "@/components/signature/SignatureBackground";
import { NightAtmosphere } from "@/components/signature/NightAtmosphere";
import { MotionOrchestrator } from "@/components/MotionOrchestrator";
import { SignatureProvider } from "@/signature/SignatureProvider";
import { languageOf } from "@/signature/routeSignal";
import { useSignatureState } from "@/signature/useSignature";
import "./PublicShell.css";
import "./EditorialRefresh.css";
// Dimuat terakhir: lapisan redesign chrome (masthead + footer) menang urutan
// cascade terhadap EditorialRefresh tanpa menambah `!important` baru.
import "./ChromeRedesign.css";
// Primitif scene bersama (label, judul, tombol, baris indeks, gerak masuk).
import "./SceneKit.css";
// Terakhir: lapisan instrumen (atmosfer, grid, grain, progres gulir, label
// indeks). Dekoratif — tidak mengubah token, jarak, atau struktur halaman.
import "./InstrumentLayer.css";

/**
 * Lapisan signature global.
 *
 * Urutan render = urutan z-index: partikel (di belakang konten) → tirai rute →
 * cursor → player/menu di atasnya lewat z-index masing-masing. Semua lapisan
 * hanya hidup di client (gate `mounted`), jadi tidak ada canvas di HTML SSR.
 *
 * Particle field, cursor, dan tirai rute adalah identitas situs ini — bukan
 * dekorasi opsional. Jangan dilepas dari shell tanpa menggantinya dengan
 * sistem motion lain yang setara.
 */
function ShellSurfaces() {
  const [mounted, setMounted] = useState(false);
  const mode = useSignatureState(snapshot => snapshot.route.mode);
  const frequency = useSignatureState(snapshot => snapshot.frequency.active);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.signatureMode = frequency ? "frequency" : mode;
    return () => {
      delete root.dataset.signatureMode;
    };
  }, [frequency, mode]);

  if (!mounted) return null;

  return (
    <>
      <NightAtmosphere />
      <SignatureBackground />
      <RouteSignalCurtain />
      <CursorSignal />
      <GlobalAudioPlayer />
      <CommandPalette />
    </>
  );
}

function ShellBody({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const lang = languageOf(location);
  // Rute tak dikenal tetap bagian situs: halaman 404 resmi memakai partikel,
  // cursor, player, dan command palette yang sama. Yang benar-benar di luar
  // lapisan editorial hanya studio/admin/aset dan game.
  const isStudioRoute = /^\/(?:studio|admin|assets)(?:\/|$)/.test(location);
  const isGameRoute = /^(?:\/en)?\/game(?:\/|$)/.test(location);
  const isEditorialRoute = !isStudioRoute && !isGameRoute;
  const path = location.split(/[?#]/, 1)[0] || "/";
  const skipTarget = path === "/" || path === "/en" ? "#top" : "#main-content";

  return (
    <LightboxProvider lang={lang}>
      <div
        className={`an-public-shell${isEditorialRoute ? " an-editorial" : ""}`}
        data-shell-lang={lang}
      >
        {isEditorialRoute && (
          <a className="an-skip-link" href={skipTarget}>
            {lang === "en" ? "Skip to main content" : "Lewati ke konten utama"}
          </a>
        )}
        {children}
        {/* [BUGFIX] MotionOrchestrator sudah lama ada sebagai berkas (CSS-nya
            pun sudah dipasang di NightFrequencySignature.css lewat kelas
            `.is-motion-in-view`), tapi komponennya sendiri tidak pernah
            di-mount di mana pun — jadi SELURUH halaman `.nf-page` (semua
            rute publik kecuali beranda `/`, studio, dan game) render
            statis tanpa animasi masuk sama sekali. Dipasang di sini
            (bukan di dalam ShellSurfaces yang nunggu `mounted`) supaya
            section langsung diobservasi begitu halaman di-render. */}
        {isEditorialRoute && <MotionOrchestrator />}
        {isEditorialRoute && <ShellSurfaces />}
      </div>
    </LightboxProvider>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <SignatureProvider>
      <ShellBody>{children}</ShellBody>
    </SignatureProvider>
  );
}
