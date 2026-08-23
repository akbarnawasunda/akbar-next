import { trpc } from "@/lib/trpc";

export type CmsRelease = { _id: string; title: string; year?: string; format?: string; platform?: string; url: string; embedUrl?: string; artworkUrl?: string; story?: string; credits?: string; spotifyUrl?: string; appleMusicUrl?: string; isCurrent?: boolean; order?: number };
export type CmsVisual = { _id: string; title: string; label?: string; youtubeId?: string; url?: string; imageUrl?: string; order?: number };
export type CmsEvent = { _id: string; title: string; date: string; city?: string; venue?: string; country?: string; posterUrl?: string; ticketUrl?: string; rsvpUrl?: string; status?: "announced" | "sold out" | "cancelled" | "past"; isFeatured?: boolean };
export type CmsLegalSection = { key?: "short-version" | "collection" | "cookies" | "services" | "rights"; heading?: string; body?: string };
export type CmsArtistContent = { hero?: { heroTitle?: string; heroKicker?: string; heroBody?: string; heroImage?: string; primaryActionUrl?: string; primaryActionLabel?: string }; profile?: { shortBio?: string; longBio?: string; location?: string; genres?: string[]; portraitImage?: string; artistStatement?: string }; pressKit?: { intro?: string; bookingEmail?: string; pressEmail?: string; oneSheetUrl?: string; photoPackUrl?: string; logoPackUrl?: string; technicalRiderUrl?: string }; siteSettings?: { siteTitle?: string; metaDescription?: string; ogTitle?: string; ogDescription?: string; socialPreviewUrl?: string; canonicalUrl?: string; contactEmail?: string; bookingEmail?: string; pressEmail?: string }; legal?: { title?: string; version?: string; effectiveDate?: string; intro?: string; readyForPublic?: boolean; sections?: CmsLegalSection[] }; releases: CmsRelease[]; visuals: CmsVisual[]; live?: { status?: string; message?: string; actionUrl?: string }; events: CmsEvent[] };

type CustomDocument = {
  id: number;
  documentType: string;
  slug: string;
  payload: Record<string, unknown>;
  sortOrder: number;
  isPublished: boolean;
};

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map(item => item.trim());
  return values.length ? values : undefined;
}

function payloadOf(document: CustomDocument | undefined) {
  return document?.payload ?? {};
}

function legalSections(value: unknown): CmsLegalSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections = value
    .filter((section): section is Record<string, unknown> => Boolean(section && typeof section === "object" && !Array.isArray(section)))
    .map(section => ({
      key: stringValue(section.key) as CmsLegalSection["key"],
      heading: stringValue(section.heading),
      body: stringValue(section.body),
    }));
  return sections.length ? sections : undefined;
}

export function customDocumentsToPublicContent(documents: CustomDocument[] | undefined): CmsArtistContent | null {
  if (!documents) return null;
  const byType = (type: string) => documents.filter(document => document.documentType === type).sort((a, b) => a.sortOrder - b.sortOrder);
  const first = (type: string) => byType(type)[0];
  const hero = first("hero");
  const profile = first("profile");
  const pressKit = first("pressKit");
  const siteSettings = first("siteSettings");
  const legal = first("legal");
  const live = first("live");

  return {
    hero: hero ? {
      heroTitle: stringValue(payloadOf(hero).heroTitle) || stringValue(payloadOf(hero).title),
      heroKicker: stringValue(payloadOf(hero).heroKicker) || stringValue(payloadOf(hero).kicker),
      heroBody: stringValue(payloadOf(hero).heroBody) || stringValue(payloadOf(hero).body) || stringValue(payloadOf(hero).subtitle),
      heroImage: stringValue(payloadOf(hero).heroImage) || stringValue(payloadOf(hero).imageUrl),
      primaryActionUrl: stringValue(payloadOf(hero).primaryActionUrl) || stringValue(payloadOf(hero).href),
      primaryActionLabel: stringValue(payloadOf(hero).primaryActionLabel),
    } : undefined,
    profile: profile ? {
      shortBio: stringValue(payloadOf(profile).shortBio),
      longBio: stringValue(payloadOf(profile).longBio) || stringValue(payloadOf(profile).body),
      location: stringValue(payloadOf(profile).location),
      genres: stringArray(payloadOf(profile).genres),
      portraitImage: stringValue(payloadOf(profile).portraitImage) || stringValue(payloadOf(profile).imageUrl),
      artistStatement: stringValue(payloadOf(profile).artistStatement),
    } : undefined,
    pressKit: pressKit ? {
      intro: stringValue(payloadOf(pressKit).intro) || stringValue(payloadOf(pressKit).body),
      bookingEmail: stringValue(payloadOf(pressKit).bookingEmail),
      pressEmail: stringValue(payloadOf(pressKit).pressEmail),
      oneSheetUrl: stringValue(payloadOf(pressKit).oneSheetUrl),
      photoPackUrl: stringValue(payloadOf(pressKit).photoPackUrl),
      logoPackUrl: stringValue(payloadOf(pressKit).logoPackUrl),
      technicalRiderUrl: stringValue(payloadOf(pressKit).technicalRiderUrl),
    } : undefined,
    siteSettings: siteSettings ? {
      siteTitle: stringValue(payloadOf(siteSettings).siteTitle) || stringValue(payloadOf(siteSettings).title),
      metaDescription: stringValue(payloadOf(siteSettings).metaDescription),
      ogTitle: stringValue(payloadOf(siteSettings).ogTitle),
      ogDescription: stringValue(payloadOf(siteSettings).ogDescription),
      socialPreviewUrl: stringValue(payloadOf(siteSettings).socialPreviewUrl) || stringValue(payloadOf(siteSettings).imageUrl),
      canonicalUrl: stringValue(payloadOf(siteSettings).canonicalUrl),
      contactEmail: stringValue(payloadOf(siteSettings).contactEmail),
      bookingEmail: stringValue(payloadOf(siteSettings).bookingEmail),
      pressEmail: stringValue(payloadOf(siteSettings).pressEmail),
    } : undefined,
    legal: legal ? {
      title: stringValue(payloadOf(legal).title),
      version: stringValue(payloadOf(legal).version),
      effectiveDate: stringValue(payloadOf(legal).effectiveDate),
      intro: stringValue(payloadOf(legal).intro) || stringValue(payloadOf(legal).body),
      readyForPublic: booleanValue(payloadOf(legal).readyForPublic),
      sections: legalSections(payloadOf(legal).sections),
    } : undefined,
    releases: byType("release").map(document => ({
      _id: `custom-${document.id}`,
      title: stringValue(payloadOf(document).title) || document.slug,
      year: stringValue(payloadOf(document).year),
      format: stringValue(payloadOf(document).format) || stringValue(payloadOf(document).label),
      platform: stringValue(payloadOf(document).platform),
      url: stringValue(payloadOf(document).url) || stringValue(payloadOf(document).href) || "",
      embedUrl: stringValue(payloadOf(document).embedUrl),
      artworkUrl: stringValue(payloadOf(document).artworkUrl) || stringValue(payloadOf(document).imageUrl),
      story: stringValue(payloadOf(document).story) || stringValue(payloadOf(document).body),
      credits: stringValue(payloadOf(document).credits),
      spotifyUrl: stringValue(payloadOf(document).spotifyUrl),
      appleMusicUrl: stringValue(payloadOf(document).appleMusicUrl),
      isCurrent: booleanValue(payloadOf(document).isCurrent),
      order: document.sortOrder,
    })),
    visuals: byType("visual").map(document => ({
      _id: `custom-${document.id}`,
      title: stringValue(payloadOf(document).title) || document.slug,
      label: stringValue(payloadOf(document).label),
      youtubeId: stringValue(payloadOf(document).youtubeId),
      url: stringValue(payloadOf(document).url) || stringValue(payloadOf(document).href),
      imageUrl: stringValue(payloadOf(document).imageUrl),
      order: document.sortOrder,
    })),
    live: live ? {
      status: stringValue(payloadOf(live).status) || stringValue(payloadOf(live).label),
      message: stringValue(payloadOf(live).message) || stringValue(payloadOf(live).body),
      actionUrl: stringValue(payloadOf(live).actionUrl) || stringValue(payloadOf(live).href),
    } : undefined,
    events: byType("event").map(document => ({
      _id: `custom-${document.id}`,
      title: stringValue(payloadOf(document).title) || document.slug,
      date: stringValue(payloadOf(document).date) || "",
      city: stringValue(payloadOf(document).city),
      venue: stringValue(payloadOf(document).venue),
      country: stringValue(payloadOf(document).country),
      posterUrl: stringValue(payloadOf(document).posterUrl) || stringValue(payloadOf(document).imageUrl),
      ticketUrl: stringValue(payloadOf(document).ticketUrl),
      rsvpUrl: stringValue(payloadOf(document).rsvpUrl),
      status: stringValue(payloadOf(document).status) as CmsEvent["status"],
      isFeatured: booleanValue(payloadOf(document).isFeatured),
    })),
  };
}

export function usePublicArtistContent() {
  const query = trpc.content.documents.useQuery();
  return { data: customDocumentsToPublicContent(query.data as CustomDocument[] | undefined), isLoading: query.isLoading };
}
