import { createClient } from "@sanity/client";
import { useEffect, useState } from "react";
import { dataset, projectId } from "./config";

export type CmsRelease = { _id: string; title: string; year?: string; format?: string; platform?: string; url: string; embedUrl?: string; artworkUrl?: string; story?: string; credits?: string; spotifyUrl?: string; appleMusicUrl?: string; isCurrent?: boolean; order?: number };
export type CmsVisual = { _id: string; title: string; label?: string; youtubeId?: string; url?: string; imageUrl?: string; order?: number };
export type CmsEvent = { _id: string; title: string; date: string; city?: string; venue?: string; country?: string; posterUrl?: string; ticketUrl?: string; rsvpUrl?: string; status?: "announced" | "sold out" | "cancelled" | "past"; isFeatured?: boolean };
export type CmsLegalSection = { key?: "short-version" | "collection" | "cookies" | "services" | "rights"; heading?: string; body?: string };
export type CmsArtistContent = { hero?: { heroTitle?: string; heroKicker?: string; heroBody?: string; heroImage?: string; primaryActionUrl?: string; primaryActionLabel?: string }; profile?: { shortBio?: string; longBio?: string; location?: string; genres?: string[]; portraitImage?: string; artistStatement?: string }; pressKit?: { intro?: string; bookingEmail?: string; pressEmail?: string; oneSheetUrl?: string; photoPackUrl?: string; logoPackUrl?: string; technicalRiderUrl?: string }; siteSettings?: { siteTitle?: string; metaDescription?: string; ogTitle?: string; ogDescription?: string; socialPreviewUrl?: string; canonicalUrl?: string; contactEmail?: string; bookingEmail?: string; pressEmail?: string }; legal?: { title?: string; version?: string; effectiveDate?: string; intro?: string; readyForPublic?: boolean; sections?: CmsLegalSection[] }; releases: CmsRelease[]; visuals: CmsVisual[]; live?: { status?: string; message?: string; actionUrl?: string }; events: CmsEvent[] };

const client = createClient({ projectId, dataset, apiVersion: "2026-08-22", useCdn: true });
const query = `{
  "hero": *[_type == "artistSite"][0]{heroTitle, heroKicker, heroBody, heroImage, primaryActionUrl, primaryActionLabel},
  "profile": *[_type == "artistProfile"][0]{shortBio, longBio, location, genres, portraitImage, artistStatement},
  "pressKit": *[_type == "pressKit"][0]{intro, bookingEmail, pressEmail, oneSheetUrl, photoPackUrl, logoPackUrl, technicalRiderUrl},
  "siteSettings": *[_type == "siteSettings"][0]{siteTitle, metaDescription, ogTitle, ogDescription, socialPreviewUrl, canonicalUrl, contactEmail, bookingEmail, pressEmail},
  "legal": *[_type == "legalDocument" && readyForPublic == true][0]{title, version, effectiveDate, intro, readyForPublic, sections[]{key, heading, body}},
  "releases": *[_type == "release"] | order(order asc){_id, title, year, format, platform, url, embedUrl, artworkUrl, story, credits, spotifyUrl, appleMusicUrl, isCurrent, order},
  "visuals": *[_type == "visual"] | order(order asc){_id, title, label, youtubeId, url, imageUrl, order},
  "live": *[_type == "liveSignal"][0]{status, message, actionUrl},
  "events": *[_type == "event" && (!defined(status) || status != "past")] | order(date asc){_id, title, date, city, venue, country, posterUrl, ticketUrl, rsvpUrl, status, isFeatured}
}`;

let publicContentPromise: Promise<CmsArtistContent | null> | null = null;

export function fetchPublicContent() {
  if (!publicContentPromise) {
    publicContentPromise = client
      .fetch<CmsArtistContent>(query)
      .catch(() => null);
  }
  return publicContentPromise;
}

export function useSanityArtistContent() {
  const [data, setData] = useState<CmsArtistContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetchPublicContent().then(result => {
      if (active) setData(result);
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);
  return { data, isLoading };
}
