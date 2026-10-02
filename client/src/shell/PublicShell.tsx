import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { CommandPalette } from "@/components/CommandPalette";
import { LightboxProvider } from "@/components/signature/LightboxProvider";
import { GlobalAudioPlayer } from "@/components/signature/GlobalAudioPlayer";
import { SignatureProvider } from "@/signature/SignatureProvider";
import { isPublicRoute, languageOf } from "@/signature/routeSignal";
import { useSignatureState } from "@/signature/useSignature";
import "./PublicShell.css";
import "./EditorialRefresh.css";

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
