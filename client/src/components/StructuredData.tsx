import { useEffect } from "react";
import { useLocation } from "wouter";
import { officialBrand, releases, verifiedArtistProfile } from "@/content/artistPlatform";
import { publicPlatformLinks, usePublicArtistContent } from "@/content/publicContent";

const siteOrigin = "https://akbarnawasunda.my.id";
const releaseSlug = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${siteOrigin}${path === "/" ? "/" : path}`;
}

function websiteEntity() {
  return {
    "@type": "WebSite",
    "@id": `${siteOrigin}/#website`,
    url: `${siteOrigin}/`,
    name: "Akbar Nawasunda",
    alternateName: "Akbar Nawasunda | Official Website",
    publisher: { "@id": `${siteOrigin}/#artist` },
  };
}

function artistEntity(platforms: Array<{ href: string }>) {
  return {
    "@type": "MusicGroup",
    "@id": `${siteOrigin}/#artist`,
    name: "Akbar Nawasunda",
    alternateName: verifiedArtistProfile.aliases,
    url: `${siteOrigin}/`,
    image: [absoluteUrl(officialBrand.socialPreview)],
    logo: absoluteUrl(officialBrand.logo),
    genre: verifiedArtistProfile.genres,
    sameAs: platforms.map(link => link.href),
    location: {
      "@type": "Place",
      name: verifiedArtistProfile.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bandung Barat",
        addressCountry: "ID",
      },
    },
  };
}

export function StructuredData() {
  const [location] = useLocation();
  const cms = usePublicArtistContent();
  const editablePlatformLinks = publicPlatformLinks(cms.data);

  useEffect(() => {
    const isEnglish = location === "/en" || location.startsWith("/en/");
    const pathWithoutLanguage = location.replace(/^\/en(?=\/|$)/, "") || "/";
    const graph: Record<string, unknown>[] = [websiteEntity(), artistEntity(editablePlatformLinks)];
    const releaseMatch = pathWithoutLanguage.match(/^\/music\/([a-z0-9-]+)$/i);

    if (releaseMatch) {
      const slug = releaseMatch[1];
      const cmsRelease = cms.data?.releases.find(item => releaseSlug(item.title) === slug);
      const legacyRelease = releases.find(item => releaseSlug(item.title) === slug);
      const title = cmsRelease?.title || legacyRelease?.title;
      const href = cmsRelease?.url || legacyRelease?.href;
      const year = cmsRelease?.year || legacyRelease?.year;
      if (title && href) {
        graph.push({
          "@type": "MusicRecording",
          "@id": `${siteOrigin}${location}#recording`,
          name: title,
          url: absoluteUrl(location),
          sameAs: [href, ...(cmsRelease?.platformLinks?.map(link => link.href) || [])],
          byArtist: { "@id": `${siteOrigin}/#artist` },
          ...(year ? { datePublished: year } : {}),
        });
      }
    }

    if (pathWithoutLanguage === "/live" && cms.data?.events.length) {
      cms.data.events.forEach(event => {
        const eventLocation = [event.venue, event.city, event.country].filter(Boolean).join(", ") || "Indonesia";
        graph.push({
          "@type": "MusicEvent",
          "@id": `${siteOrigin}${location}#event-${event._id}`,
          name: event.title,
          startDate: event.date,
          performer: { "@id": `${siteOrigin}/#artist` },
          location: { "@type": "Place", name: eventLocation },
          ...(event.ticketUrl ? { offers: { "@type": "Offer", url: event.ticketUrl } } : {}),
          ...(event.status === "cancelled" ? { eventStatus: "https://schema.org/EventCancelled" } : {}),
        });
      });
    }

    const scriptId = "akbar-structured-data";
    const existing = document.getElementById(scriptId);
    const script = existing instanceof HTMLScriptElement ? existing : document.head.appendChild(document.createElement("script"));
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph,
      inLanguage: isEnglish ? "en" : "id",
    });
  }, [cms.data, location]);

  return null;
}
