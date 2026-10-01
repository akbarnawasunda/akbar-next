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
};

const ROUTE_META = {
  "/": { mode: "wordmark", id: "BERANDA", en: "HOME" },
  "/music": { mode: "signal", id: "MUSIK", en: "MUSIC" },
  "/visuals": { mode: "dust", id: "VISUAL", en: "VISUALS" },
  "/visuals/portraits": { mode: "dust", id: "POTRET", en: "PORTRAITS" },
  "/live": { mode: "signal", id: "LIVE", en: "LIVE" },
  "/universe": { mode: "era", id: "ARSIP", en: "ARCHIVE" },
  "/about": { mode: "quiet", id: "TENTANG", en: "ABOUT" },
  "/inquire": { mode: "quiet", id: "KONTAK", en: "INQUIRE" },
  "/licensing": { mode: "quiet", id: "LISENSI", en: "LICENSING" },
  "/epk": { mode: "quiet", id: "EPK", en: "EPK" },
  "/privacy": { mode: "quiet", id: "PRIVASI", en: "PRIVACY" },
  "/game/jedag-run": { mode: "frequency", id: "JEDAG RUN", en: "JEDAG RUN" },
} as const satisfies Record<string, RouteMeta>;

/** Path rute publik berbahasa Indonesia, sebagai tipe. */
export type PublicRoutePath = keyof typeof ROUTE_META;

const RELEASE_META: RouteMeta = {
  mode: "signal",
  id: "RILISAN",
  en: "RELEASE",
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
    return { path: pathname, lang, label: "", mode: "quiet" };
  }
  return {
    path: pathname,
    lang,
    label: lang === "en" ? meta.en : meta.id,
    mode: meta.mode,
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
