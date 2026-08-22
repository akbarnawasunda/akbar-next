import { createClient } from "@sanity/client";
import { useEffect, useState } from "react";
import { dataset, projectId } from "./config";

export type CmsRelease = { _id: string; title: string; year?: string; format?: string; platform?: string; url: string; embedUrl?: string; isCurrent?: boolean; order?: number };
export type CmsVisual = { _id: string; title: string; label?: string; youtubeId?: string; url?: string; imageUrl?: string; order?: number };
export type CmsArtistContent = { hero?: { heroTitle?: string; heroKicker?: string; heroBody?: string; heroImage?: string; primaryActionUrl?: string; primaryActionLabel?: string }; releases: CmsRelease[]; visuals: CmsVisual[]; live?: { status?: string; message?: string; actionUrl?: string } };

const client = createClient({ projectId, dataset, apiVersion: "2026-08-22", useCdn: true });
const query = `{
  "hero": *[_type == "artistSite"][0]{heroTitle, heroKicker, heroBody, heroImage, primaryActionUrl, primaryActionLabel},
  "releases": *[_type == "release"] | order(order asc){_id, title, year, format, platform, url, embedUrl, isCurrent, order},
  "visuals": *[_type == "visual"] | order(order asc){_id, title, label, youtubeId, url, imageUrl, order},
  "live": *[_type == "liveSignal"][0]{status, message, actionUrl}
}`;

export function useSanityArtistContent() {
  const [data, setData] = useState<CmsArtistContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    client.fetch<CmsArtistContent>(query).then(result => { if (active) setData(result); }).catch(() => { if (active) setData(null); }).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);
  return { data, isLoading };
}
