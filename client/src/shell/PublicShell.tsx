import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { CommandPalette } from "@/components/CommandPalette";
import { CursorSignal } from "@/components/signature/CursorSignal";
import { GlobalAudioPlayer } from "@/components/signature/GlobalAudioPlayer";
import { LightboxProvider } from "@/components/signature/LightboxProvider";
import { RouteSignalCurtain } from "@/components/signature/RouteSignalCurtain";
import { SignatureBackground } from "@/components/signature/SignatureBackground";
import { SignatureProvider } from "@/signature/SignatureProvider";
import { isPublicRoute, languageOf } from "@/signature/routeSignal";
import { useSignatureState } from "@/signature/useSignature";
import "./PublicShell.css";

/**
 * PublicShell — satu cangkang untuk seluruh rute publik ID dan EN.
 *
 * Shell memegang semua sistem interaksi global: Signature Runtime, particle
 * background, route curtain, player audio persisten, command palette, cursor
 * signal, dan lightbox. Halaman hanya mengurus kontennya sendiri (termasuk
 * NightHeader/EnglishHeader dan footer masing-masing, supaya chrome tidak
 * terduplikasi) dan membaca state yang sama lewat `useSignature*`.
 *
 * Semua lapisan overlay baru hanya dirender setelah mount di browser, jadi
 * HTML hasil SSR tetap berisi halaman penuh tanpa kebocoran UI client.
 */
function ShellSurfaces({ lang }: { lang: "id" | "en" }) {
  const playerState = useSignatureState(snapshot => snapshot.audio.state);
  const mode = useSignatureState(snapshot => snapshot.route.mode);
  const frequency = useSignatureState(snapshot => snapshot.frequency.active);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.signatureMode = frequency ? "frequency" : mode;
    root.dataset.playerState = playerState;
    return () => {
      delete root.dataset.signatureMode;
      delete root.dataset.playerState;
    };
  }, [frequency, mode, playerState]);

  return (
    <>
      <SignatureBackground />
      <RouteSignalCurtain />
      <GlobalAudioPlayer />
      <CommandPalette />
      <CursorSignal />
      <span className="an-shell-hint" aria-hidden="true">
        {lang === "en" ? "⌘K / CTRL K" : "⌘K / CTRL K"}
      </span>
    </>
  );
}

function ShellBody({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);
  const lang = languageOf(location);
  const publicRoute = isPublicRoute(location);

  useEffect(() => setMounted(true), []);

  return (
    <LightboxProvider lang={lang}>
      <div className="an-public-shell" data-shell-lang={lang}>
        {children}
        {mounted && publicRoute ? <ShellSurfaces lang={lang} /> : null}
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
