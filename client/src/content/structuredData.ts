import {
  officialBrand,
  releases as catalogReleases,
  verifiedArtistProfile,
} from "@/content/artistPlatform";
import type { CmsArtistContent } from "@/content/publicContent";
import { publicPlatformLinks, publicUpcomingEvents } from "@/content/publicContent";
import { publicMediaUrl } from "@/lib/publicMedia";

/**
 * Structured data bersama.
 *
 * Dipakai dua jalur sekaligus: SSR (`client/src/ssr/prefetch.ts`) dan
 * pembaruan di client (`components/StructuredData.tsx`). Sebelumnya keduanya
 * membangun graph sendiri-sendiri, sehingga hidrasi menimpa JSON-LD server
 * dengan versi yang lebih miskin. Satu builder = satu kebenaran.
 */

export const SITE_NAME = "Akbar Nawasunda | Official Website";
export const SITE_ORIGIN = "https://akbarnawasunda.my.id";

export const WEBSITE_ALTERNATE_NAMES = [
  "Akbar Nawasunda",
  "DJ Akbar Remix",
  "akbarnawasunda.my.id",
];

const VERIFIED_IDENTITY_LINKS = [
  "https://open.spotify.com/artist/7KOQuIQLuxyklLox0RDMMw",
  "https://www.youtube.com/channel/UCS-UDttyS3sruwkEPlGjuDg",
  "https://soundcloud.com/akbarnawasunda",
  "https://www.instagram.com/akbarnawasunda",
  "https://music.apple.com/id/artist/akbar-nawasunda/1816312738?l=id",
  "https://musicbrainz.org/artist/bb843d35-fc0a-4d3b-b445-390b9b299812",
  "https://www.wikidata.org/wiki/Q141049199",
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const absoluteUrl = (value: string) => {
  const normalized = publicMediaUrl(value) || value;
  return normalized.startsWith("http")
    ? normalized
    : `${SITE_ORIGIN}${normalized === "/" ? "/" : normalized}`;
};

function artistEntity(content: CmsArtistContent | null | undefined) {
  const artistLinks = publicPlatformLinks(content).filter(({ label }) =>
    ["Spotify", "YouTube", "SoundCloud", "Instagram"].includes(label)
  );
  return {
    "@type": "MusicGroup",
    "@id": `${SITE_ORIGIN}/#artist`,
    name: "Akbar Nawasunda",
    alternateName: verifiedArtistProfile.aliases,
    description: content?.profile?.shortBio || verifiedArtistProfile.shortBio,
    url: `${SITE_ORIGIN}/`,
    image: [
      absoluteUrl(
        content?.siteSettings?.socialPreviewUrl || officialBrand.socialPreview
      ),
    ],
    logo: absoluteUrl(officialBrand.logo),
    genre: content?.profile?.genres?.length
      ? content.profile.genres
      : verifiedArtistProfile.genres,
    sameAs: Array.from(
      new Set([
        ...artistLinks.map(link => link.href),
        ...VERIFIED_IDENTITY_LINKS,
      ])
    ),
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

export function buildSiteStructuredData({
  path,
  isEnglish,
  content,
  title,
  description,
}: {
  path: string;
  isEnglish: boolean;
  content: CmsArtistContent | null | undefined;
  title?: string;
  description?: string;
}) {
  const language = isEnglish ? "en" : "id";
  const pathWithoutLanguage = path.replace(/^\/en(?=\/|$)/, "") || "/";
  const isHome = pathWithoutLanguage === "/";
  const pageUrl = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: SITE_NAME,
      alternateName: WEBSITE_ALTERNATE_NAMES,
      inLanguage: language,
      publisher: { "@id": `${SITE_ORIGIN}/#artist` },
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title || SITE_NAME,
      ...(description ? { description } : {}),
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
      about: { "@id": `${SITE_ORIGIN}/#artist` },
      inLanguage: language,
      ...(isHome ? { primaryImageOfPage: absoluteUrl(officialBrand.socialPreview) } : {}),
    },
    artistEntity(content),
  ];

  const releaseMatch = pathWithoutLanguage.match(/^\/music\/([a-z0-9-]+)$/i);
  if (releaseMatch) {
    const slug = releaseMatch[1];
    const cmsRelease = content?.releases.find(
      item => slugify(item.title) === slug
    );
    const fallbackRelease = catalogReleases.find(
      item => slugify(item.title) === slug
    );
    const name = cmsRelease?.title || fallbackRelease?.title;
    const href = cmsRelease?.url || fallbackRelease?.href;
    const year = cmsRelease?.year || fallbackRelease?.year;
    if (name && href) {
      graph.push({
        "@type": "MusicRecording",
        "@id": `${SITE_ORIGIN}${path}#recording`,
        name,
        url: pageUrl,
        sameAs: [
          href,
          ...(cmsRelease?.platformLinks?.map(link => link.href) || []),
        ],
        byArtist: { "@id": `${SITE_ORIGIN}/#artist` },
        ...(year ? { datePublished: year } : {}),
      });
    }
  }

  if (pathWithoutLanguage === "/live") {
    publicUpcomingEvents(content).forEach(event => {
      const eventLocation =
        [event.venue, event.city, event.country].filter(Boolean).join(", ") ||
        "Indonesia";
      graph.push({
        "@type": "MusicEvent",
        "@id": `${SITE_ORIGIN}${path}#event-${event._id}`,
        name: event.title,
        startDate: event.date,
        performer: { "@id": `${SITE_ORIGIN}/#artist` },
        location: { "@type": "Place", name: eventLocation },
        ...(event.ticketUrl
          ? { offers: { "@type": "Offer", url: event.ticketUrl } }
          : {}),
        ...(event.status === "cancelled"
          ? { eventStatus: "https://schema.org/EventCancelled" }
          : {}),
      });
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
    inLanguage: language,
  };
}
