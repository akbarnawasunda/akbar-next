import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { CommandPalette } from "@/components/CommandPalette";
import { LightboxProvider } from "@/components/signature/LightboxProvider";
import { CursorSignal } from "@/components/signature/CursorSignal";
import { GlobalAudioPlayer } from "@/components/signature/GlobalAudioPlayer";
import { RouteSignalCurtain } from "@/components/signature/RouteSignalCurtain";
import { SignatureBackground } from "@/components/signature/SignatureBackground";
import { SignatureProvider } from "@/signature/SignatureProvider";
import { isPublicRoute, languageOf } from "@/signature/routeSignal";
import { useSignatureState } from "@/signature/useSignature";
import "./PublicShell.css";
import "./EditorialRefresh.css";
// Dimuat terakhir: lapisan redesign chrome (masthead + footer) menang urutan
// cascade terhadap EditorialRefresh tanpa menambah `!important` baru.
import "./ChromeRedesign.css";
// Primitif scene bersama (label, judul, tombol, baris indeks, gerak masuk).
import "./SceneKit.css";

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
  const isEditorialRoute =
    isPublicRoute(location) && !/^(?:\/en)?\/game(?:\/|$)/.test(location);
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
