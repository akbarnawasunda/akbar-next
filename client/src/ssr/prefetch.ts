import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";
import { trpc } from "@/lib/trpc";
import { customDocumentsToPublicContent, publicPlatformLinks, publicUpcomingEvents } from "@/content/publicContent";
import { officialBrand, releases, verifiedArtistProfile } from "@/content/artistPlatform";
import { publicMediaUrl } from "@/lib/publicMedia";

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
const ID_DESCRIPTION = "Website resmi Akbar Nawasunda — produser, remixer, dan DJ asal Bandung Barat, Indonesia.";
const EN_DESCRIPTION = "Official website of Akbar Nawasunda — Indonesian music artist, producer, remixer, and DJ from West Bandung.";

const idTitles: Record<string, string> = {
  "/": SITE_NAME,
  "/music": "Music by Akbar Nawasunda",
  "/visuals": "Videos by Akbar Nawasunda",
  "/visuals/portraits": "Portrait Studies | Akbar Nawasunda",
  "/live": "Live Dates | Akbar Nawasunda",
  "/universe": "About the Work | Akbar Nawasunda",
  "/about": "About the Artist | Akbar Nawasunda",
  "/epk": "Press & Booking EPK | Akbar Nawasunda",
  "/inquire": "Inquire | Akbar Nawasunda",
  "/licensing": "Music Licensing | Akbar Nawasunda",
  "/privacy": "Privacy Policy | Akbar Nawasunda",
};

const enTitles: Record<string, string> = {
  "/": SITE_NAME,
  "/music": "Music by Akbar Nawasunda",
  "/visuals": "Videos by Akbar Nawasunda",
  "/visuals/portraits": "Portrait Studies | Akbar Nawasunda",
  "/live": "Live Dates | Akbar Nawasunda",
  "/universe": "About the Work | Akbar Nawasunda",
  "/about": "About the Artist | Akbar Nawasunda",
  "/epk": "Press & Booking EPK | Akbar Nawasunda",
  "/inquire": "Inquire | Akbar Nawasunda",
  "/licensing": "Music Licensing | Akbar Nawasunda",
  "/privacy": "Privacy Policy | Akbar Nawasunda",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const absoluteUrl = (value: string) => {
  const normalized = publicMediaUrl(value) || value;
  return normalized.startsWith("http") ? normalized : `${SITE_ORIGIN}${normalized === "/" ? "/" : normalized}`;
};

function decodedPath(url: string) {
  let path = url.split("?")[0] || "/";
  try {
    path = decodeURI(path);
  } catch {
    // Keep the raw path; wouter also fails safely for malformed encodings.
  }
  return path.replace(/\/+$/, "") || "/";
}

function publicArtistGraph(content: ReturnType<typeof customDocumentsToPublicContent>) {
  const artistLinks = publicPlatformLinks(content).filter(({ label }) =>
    ["Spotify", "YouTube", "SoundCloud", "Instagram"].includes(label),
  );
  return {
    "@type": "MusicGroup",
    "@id": `${SITE_ORIGIN}/#artist`,
    name: "Akbar Nawasunda",
    alternateName: verifiedArtistProfile.aliases,
    description: content?.profile?.shortBio || verifiedArtistProfile.shortBio,
    url: `${SITE_ORIGIN}/`,
    image: [absoluteUrl(content?.siteSettings?.socialPreviewUrl || officialBrand.socialPreview)],
    logo: absoluteUrl(officialBrand.logo),
    genre: content?.profile?.genres?.length ? content.profile.genres : verifiedArtistProfile.genres,
    sameAs: artistLinks.map(link => link.href),
    location: {
      "@type": "Place",
      name: content?.profile?.location || verifiedArtistProfile.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bandung Barat",
        addressCountry: "ID",
      },
    },
  };
}

function buildStructuredData(path: string, isEnglish: boolean, content: ReturnType<typeof customDocumentsToPublicContent>) {
  const pathWithoutLanguage = path.replace(/^\/en(?=\/|$)/, "") || "/";
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: "Akbar Nawasunda",
      alternateName: SITE_NAME,
      publisher: { "@id": `${SITE_ORIGIN}/#artist` },
    },
    publicArtistGraph(content),
  ];

  const releaseMatch = pathWithoutLanguage.match(/^\/music\/([a-z0-9-]+)$/i);
  if (releaseMatch) {
    const slug = releaseMatch[1];
    const cmsRelease = content?.releases.find(item => slugify(item.title) === slug);
    const fallbackRelease = releases.find(item => slugify(item.title) === slug);
    const title = cmsRelease?.title || fallbackRelease?.title;
    const href = cmsRelease?.url || fallbackRelease?.href;
    const year = cmsRelease?.year || fallbackRelease?.year;
    if (title && href) {
      graph.push({
        "@type": "MusicRecording",
        "@id": `${SITE_ORIGIN}${path}#recording`,
        name: title,
        url: absoluteUrl(path),
        sameAs: [href, ...(cmsRelease?.platformLinks?.map(link => link.href) || [])],
        byArtist: { "@id": `${SITE_ORIGIN}/#artist` },
        ...(year ? { datePublished: year } : {}),
      });
    }
  }

  if (pathWithoutLanguage === "/live") {
    publicUpcomingEvents(content).forEach(event => {
      const eventLocation = [event.venue, event.city, event.country].filter(Boolean).join(", ") || "Indonesia";
      graph.push({
        "@type": "MusicEvent",
        "@id": `${SITE_ORIGIN}${path}#event-${event._id}`,
        name: event.title,
        startDate: event.date,
        performer: { "@id": `${SITE_ORIGIN}/#artist` },
        location: { "@type": "Place", name: eventLocation },
        ...(event.ticketUrl ? { offers: { "@type": "Offer", url: event.ticketUrl } } : {}),
        ...(event.status === "cancelled" ? { eventStatus: "https://schema.org/EventCancelled" } : {}),
      });
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
    inLanguage: isEnglish ? "en" : "id",
  };
}

async function seed(queryClient: QueryClient, input: PublicDocuments) {
  queryClient.setQueryData(getQueryKey(trpc.content.documents, undefined, "query"), input);
}

export async function prefetchForPath(
  url: string,
  queryClient: QueryClient,
  prefetch: SsrPrefetch,
): Promise<HeadMeta> {
  const path = decodedPath(url);
  const isEnglish = path === "/en" || path.startsWith("/en/");
  const pathWithoutLanguage = path.replace(/^\/en(?=\/|$)/, "") || "/";
  const publicRoute = path === "/" || path === "/en" || [
    "/music", "/visuals", "/visuals/portraits", "/live", "/universe", "/about", "/inquire", "/licensing", "/epk", "/privacy",
  ].includes(pathWithoutLanguage);

  if (path === "/studio" || path.startsWith("/studio/") || path === "/assets" || path === "/admin") {
    return { title: SITE_NAME, description: ID_DESCRIPTION, noindex: true };
  }

  if (path === "/404") {
    return { title: SITE_NAME, description: ID_DESCRIPTION, notFound: true };
  }

  if (!publicRoute && !/^\/en?\/music\//i.test(path) && !/^\/music\//i.test(path)) {
    return { title: SITE_NAME, description: ID_DESCRIPTION, notFound: true };
  }

  const documents = await prefetch.documents();
  await seed(queryClient, documents);
  const content = customDocumentsToPublicContent(documents as Parameters<typeof customDocumentsToPublicContent>[0]);
  const siteTitle = !isEnglish ? content?.siteSettings?.siteTitle || undefined : undefined;
  const defaultTitle = (isEnglish ? enTitles[pathWithoutLanguage] : idTitles[pathWithoutLanguage]) || SITE_NAME;
  const title = siteTitle && pathWithoutLanguage === "/" ? siteTitle : defaultTitle;
  const description = isEnglish
    ? EN_DESCRIPTION
    : content?.siteSettings?.metaDescription || ID_DESCRIPTION;
  const structuredData = buildStructuredData(path, isEnglish, content);
  const base: HeadMeta = {
    title,
    description,
    ogType: "website",
    ogImage: publicMediaUrl(content?.siteSettings?.socialPreviewUrl) || officialBrand.socialPreview,
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
    const cmsRelease = content?.releases.find(item => slugify(item.title) === slug);
    const fallbackRelease = releases.find(item => slugify(item.title) === slug);
    const releaseTitle = cmsRelease?.title || fallbackRelease?.title;
    if (!releaseTitle) return { ...base, notFound: true };
    return {
      ...base,
      title: `${releaseTitle} | Akbar Nawasunda`,
      description: cmsRelease?.story || `${releaseTitle} — official release by Akbar Nawasunda.`,
      ogType: "article",
      ogImage: publicMediaUrl(cmsRelease?.artworkUrl) || publicMediaUrl(fallbackRelease?.image) || base.ogImage,
      ogImageAlt: `Artwork for ${releaseTitle}`,
    };
  }

  return base;
}
