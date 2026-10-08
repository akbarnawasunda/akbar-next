import type {
  SignatureFieldMode,
  SignatureLanguage,
  SignatureRouteInfo,
} from "./types";

/**
 * Metadata rute bersama.
 *
 * Satu-satunya tempat label tujuan route curtain dan mode particle field
 * ditentukan. Tidak ada halaman yang boleh menuliskan labelnya sendiri.
 */

type RouteMeta = {
  mode: SignatureFieldMode;
  id: string;
  en: string;
  /**
   * Intensitas gerak halaman (docs/motion-performance-liquid-signal-pass.md
   * §5.7): sinyal punya ingatan per rute — LIVE lebih energik dari MUSIC,
   * VISUAL lebih lambat dan atmosferis, halaman senyap hampir diam. Skala
   * 1 = kekuatan penuh (beranda).
   */
  intensity: number;
};

const ROUTE_META = {
  "/": { mode: "wordmark", id: "BERANDA", en: "HOME", intensity: 1 },
  "/music": { mode: "signal", id: "MUSIK", en: "MUSIC", intensity: 0.9 },
  "/visuals": { mode: "dust", id: "VISUAL", en: "VISUALS", intensity: 0.65 },
  /* /visuals/portraits dihapus (Phase 3 §2 baris 5): kontennya jadi seksi
     in-page /visuals#portraits (dibangun di sub-fase 5d); rute lama 301
     di vercel.json, tirai tidak lagi mengenalnya. */
  "/live": { mode: "signal", id: "JADWAL", en: "LIVE", intensity: 1.2 },
  "/universe": { mode: "era", id: "PERJALANAN", en: "JOURNEY", intensity: 0.85 },
  "/about": { mode: "quiet", id: "TENTANG", en: "ABOUT", intensity: 0.5 },
  "/inquire": { mode: "quiet", id: "KONTAK", en: "INQUIRE", intensity: 0.5 },
  "/licensing": { mode: "quiet", id: "LISENSI", en: "LICENSING", intensity: 0.5 },
  "/epk": { mode: "quiet", id: "EPK", en: "EPK", intensity: 0.5 },
  "/privacy": { mode: "quiet", id: "PRIVASI", en: "PRIVACY", intensity: 0.5 },
  "/game/jedag-run": { mode: "frequency", id: "JEDAG RUN", en: "JEDAG RUN", intensity: 1 },
} as const satisfies Record<string, RouteMeta>;

/** Path rute publik berbahasa Indonesia, sebagai tipe. */
export type PublicRoutePath = keyof typeof ROUTE_META;

const RELEASE_META: RouteMeta = {
  mode: "signal",
  id: "RILISAN",
  en: "RELEASE",
  intensity: 0.9,
};

export const PUBLIC_ROUTE_PATHS = Object.keys(ROUTE_META) as PublicRoutePath[];

export function languageOf(pathname: string): SignatureLanguage {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "id";
}

export function neutralPath(pathname: string) {
  const path = (pathname.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  if (path === "/en") return "/";
  return path.replace(/^\/en(?=\/)/, "") || "/";
}

export function routeInfo(pathname: string): SignatureRouteInfo {
  const lang = languageOf(pathname);
  const path = neutralPath(pathname);
  const meta: RouteMeta | undefined =
    ROUTE_META[path as PublicRoutePath] ||
    (/^\/music\/[^/]+$/.test(path) ? RELEASE_META : undefined);
  if (!meta) {
    return { path: pathname, lang, label: "", mode: "quiet", intensity: 0.5 };
  }
  return {
    path: pathname,
    lang,
    label: lang === "en" ? meta.en : meta.id,
    mode: meta.mode,
    intensity: meta.intensity,
  };
}

export function isPublicRoute(pathname: string) {
  const path = neutralPath(pathname);
  return (
    Boolean(ROUTE_META[path as PublicRoutePath]) || /^\/music\/[^/]+$/.test(path)
  );
}

/** Pasangan ID/EN untuk satu path, dipakai palette dan language switcher. */
export function languagePairFor(pathname: string) {
  const path = neutralPath(pathname);
  if (!isPublicRoute(pathname)) return null;
  return { id: path, en: path === "/" ? "/en" : `/en${path}` };
}
