import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";
import { trpc } from "@/lib/trpc";
import { customDocumentsToPublicContent } from "@/content/publicContent";
import { officialBrand, releases } from "@/content/artistPlatform";
import { publicMediaUrl } from "@/lib/publicMedia";
import { buildSiteStructuredData } from "@/content/structuredData";
import { slugify } from "@shared/slug";

export type HeadMeta = {
  title: string;
  description: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  canonicalPath?: string;
  locale?: string;
  noindex?: boolean;
  notFound?: boolean;
  structuredData?: unknown;
};

type RO = inferRouterOutputs<AppRouter>;
type PublicDocuments = RO["content"]["documents"];

export type SsrPrefetch = {
  documents: () => Promise<PublicDocuments>;
};

const SITE_NAME = "Akbar Nawasunda | Official Website";
const SITE_ORIGIN = "https://akbarnawasunda.my.id";
const ID_DESCRIPTION =
  "Website resmi Akbar Nawasunda — produser, remixer, dan DJ asal Bandung Barat, Indonesia.";
const EN_DESCRIPTION =
  "Official website of Akbar Nawasunda — Indonesian music artist, producer, remixer, and DJ from West Bandung.";

const idTitles: Record<string, string> = {
  "/": SITE_NAME,
  "/music": "Music by Akbar Nawasunda",
  "/visuals": "Videos by Akbar Nawasunda",
  "/live": "Live Dates | Akbar Nawasunda",
  "/universe": "About the Work | Akbar Nawasunda",
  "/about": "About the Artist | Akbar Nawasunda",
  "/epk": "Press & Booking EPK | Akbar Nawasunda",
  "/inquire": "Inquire | Akbar Nawasunda",
  "/licensing": "Music Licensing | Akbar Nawasunda",
  "/game/jedag-run": "JEDAG RUN — Night Frequency | Akbar Nawasunda",
  "/privacy": "Privacy Policy | Akbar Nawasunda",
};

const enTitles: Record<string, string> = {
  "/": SITE_NAME,
  "/music": "Music by Akbar Nawasunda",
  "/visuals": "Videos by Akbar Nawasunda",
  "/live": "Live Dates | Akbar Nawasunda",
  "/universe": "About the Work | Akbar Nawasunda",
  "/about": "About the Artist | Akbar Nawasunda",
  "/epk": "Press & Booking EPK | Akbar Nawasunda",
  "/inquire": "Inquire | Akbar Nawasunda",
  "/licensing": "Music Licensing | Akbar Nawasunda",
  "/game/jedag-run": "JEDAG RUN — Night Frequency | Akbar Nawasunda",
  "/privacy": "Privacy Policy | Akbar Nawasunda",
};

const absoluteUrl = (value: string) => {
  const normalized = publicMediaUrl(value) || value;
  return normalized.startsWith("http")
    ? normalized
    : `${SITE_ORIGIN}${normalized === "/" ? "/" : normalized}`;
};

function decodedPath(url: string) {
  let path = url.split("?")[0] || "/";
  try {
    path = decodeURI(path);
  } catch {
    // Keep the raw path if the URL contains malformed escape sequences.
  }
  return path.replace(/\/+$/, "") || "/";
}

async function seed(queryClient: QueryClient, input: PublicDocuments) {
  queryClient.setQueryData(
    getQueryKey(trpc.content.documents, undefined, "query"),
    input
  );
}

export async function prefetchForPath(
  url: string,
  queryClient: QueryClient,
  prefetch: SsrPrefetch
): Promise<HeadMeta> {
  const path = decodedPath(url);
  const isEnglish = path === "/en" || path.startsWith("/en/");
  const pathWithoutLanguage = path.replace(/^\/en(?=\/|$)/, "") || "/";
  const publicRoute =
    path === "/" ||
    path === "/en" ||
    [
      "/music",
      "/visuals",
      "/live",
      "/universe",
      "/about",
      "/inquire",
      "/licensing",
      "/game/jedag-run",
      "/epk",
      "/privacy",
    ].includes(pathWithoutLanguage);

  if (
    path === "/studio" ||
    path.startsWith("/studio/") ||
    path === "/assets" ||
    path === "/admin"
  ) {
    return { title: SITE_NAME, description: ID_DESCRIPTION, noindex: true };
  }

  if (path === "/404") {
    return { title: SITE_NAME, description: ID_DESCRIPTION, notFound: true };
  }

  if (
    !publicRoute &&
    !/^\/en?\/music\//i.test(path) &&
    !/^\/music\//i.test(path)
  ) {
    return { title: SITE_NAME, description: ID_DESCRIPTION, notFound: true };
  }

  const documents = await prefetch.documents();
  await seed(queryClient, documents);
  const content = customDocumentsToPublicContent(
    documents as Parameters<typeof customDocumentsToPublicContent>[0]
  );
  const siteTitle = !isEnglish
    ? content?.siteSettings?.siteTitle || undefined
    : undefined;
  const defaultTitle =
    (isEnglish
      ? enTitles[pathWithoutLanguage]
      : idTitles[pathWithoutLanguage]) || SITE_NAME;
  const gameTitle = content?.game?.title
    ? `${content.game.title} | Akbar Nawasunda`
    : defaultTitle;
  const title =
    siteTitle && pathWithoutLanguage === "/"
      ? siteTitle
      : pathWithoutLanguage === "/game/jedag-run"
        ? gameTitle
        : defaultTitle;
  const description =
    pathWithoutLanguage === "/game/jedag-run"
      ? content?.game?.intro ||
        (isEnglish
          ? "Play JEDAG RUN — NIGHT FREQUENCY, an original browser game by Akbar Nawasunda."
          : "Mainkan JEDAG RUN — NIGHT FREQUENCY, game browser orisinal dari Akbar Nawasunda.")
      : isEnglish
        ? EN_DESCRIPTION
        : content?.siteSettings?.metaDescription || ID_DESCRIPTION;
  const structuredData = buildSiteStructuredData({
    path,
    isEnglish,
    content,
    title,
    description,
  });
  const base: HeadMeta = {
    title,
    description,
    ogType: "website",
    ogImage:
      publicMediaUrl(content?.siteSettings?.socialPreviewUrl) ||
      officialBrand.socialPreview,
    ogImageWidth: 1000,
    ogImageHeight: 1000,
    ogImageAlt: "Akbar Nawasunda official website artwork",
    canonicalPath: path,
    locale: isEnglish ? "en_US" : "id_ID",
    structuredData,
  };

  const releaseMatch = pathWithoutLanguage.match(/^\/music\/([^/]+)$/i);
  if (releaseMatch) {
    const slug = releaseMatch[1];
    const cmsRelease = content?.releases.find(
      item => slugify(item.title) === slug
    );
    const fallbackRelease = releases.find(item => slugify(item.title) === slug);
    const releaseTitle = cmsRelease?.title || fallbackRelease?.title;
    if (!releaseTitle) return { ...base, notFound: true };
    return {
      ...base,
      title: `${releaseTitle} | Akbar Nawasunda`,
      description:
        cmsRelease?.story ||
        `${releaseTitle} — official release by Akbar Nawasunda.`,
      ogType: "article",
      ogImage:
        publicMediaUrl(cmsRelease?.artworkUrl) ||
        publicMediaUrl(fallbackRelease?.image) ||
        base.ogImage,
      ogImageAlt: `Artwork for ${releaseTitle}`,
    };
  }

  return base;
}
