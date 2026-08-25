import type { ArtistContent, InsertArtistContent } from "../drizzle/schema";

export const customDocumentTypes = [
  "hero",
  "profile",
  "pressKit",
  "siteSettings",
  "legal",
  "release",
  "visual",
  "portrait",
  "live",
  "event",
] as const;

export type CustomDocumentType = (typeof customDocumentTypes)[number];
export type DocumentPayload = Record<string, unknown>;

export type CustomArtistDocument = {
  id: number;
  documentType: CustomDocumentType;
  slug: string;
  payload: DocumentPayload;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type StoredEnvelope = { schemaVersion: 1; data: DocumentPayload };

const prefixes: Record<CustomDocumentType, string> = {
  hero: "custom-hero",
  profile: "custom-profile",
  pressKit: "custom-press-kit",
  siteSettings: "custom-site-settings",
  legal: "custom-legal",
  release: "custom-release",
  visual: "custom-visual",
  portrait: "custom-portrait",
  live: "custom-live-signal",
  event: "custom-event",
};

const singletonTypes = new Set<CustomDocumentType>([
  "hero",
  "profile",
  "pressKit",
  "siteSettings",
  "legal",
  "live",
]);

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function documentTitle(type: CustomDocumentType, payload: DocumentPayload): string {
  const defaults: Record<CustomDocumentType, string> = {
    hero: "Homepage hero",
    profile: "Artist profile",
    pressKit: "Press and booking",
    siteSettings: "Site settings",
    legal: "Privacy policy",
    release: "Untitled release",
    visual: "Untitled visual",
    portrait: "Untitled portrait study",
    live: "Live signal",
    event: "Untitled event",
  };
  return stringValue(payload.title, stringValue(payload.siteTitle, defaults[type]));
}

function documentLabel(type: CustomDocumentType, payload: DocumentPayload): string {
  if (typeof payload.label === "string") return payload.label;
  if (type === "release") return stringValue(payload.format, "Release");
  if (type === "visual") return "Official visual";
  if (type === "portrait") return "Portrait study";
  if (type === "event") return stringValue(payload.status, "announced");
  return type;
}

function documentHref(payload: DocumentPayload): string {
  return stringValue(payload.href, stringValue(payload.url, stringValue(payload.ticketUrl, "")));
}

function documentImage(payload: DocumentPayload): string {
  return stringValue(
    payload.imageUrl,
    stringValue(payload.artworkUrl, stringValue(payload.heroImage, stringValue(payload.posterUrl, stringValue(payload.portraitImage, "")))),
  );
}

function parseEnvelope(raw: string): DocumentPayload {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredEnvelope>;
    if (parsed.schemaVersion === 1 && parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)) {
      return parsed.data as DocumentPayload;
    }
  } catch {
    // Legacy artistContent rows are intentionally ignored by the custom codec.
  }
  return {};
}

export function storageSlug(documentType: CustomDocumentType, logicalSlug: string): string {
  const normalized = logicalSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const prefix = prefixes[documentType];
  return singletonTypes.has(documentType) ? prefix : `${prefix}-${normalized || "untitled"}`;
}

export function logicalSlug(documentType: CustomDocumentType, storedSlug: string): string {
  const prefix = prefixes[documentType];
  if (singletonTypes.has(documentType)) return documentType;
  return storedSlug.slice(`${prefix}-`.length) || "untitled";
}

export function documentTypeFromStorageSlug(storedSlug: string): CustomDocumentType | null {
  if (!storedSlug.startsWith("custom-")) return null;
  const match = (Object.entries(prefixes) as Array<[CustomDocumentType, string]>)
    .sort(([, a], [, b]) => b.length - a.length)
    .find(([, prefix]) => storedSlug === prefix || storedSlug.startsWith(`${prefix}-`));
  return match?.[0] ?? null;
}

export function toCustomArtistDocument(row: ArtistContent): CustomArtistDocument | null {
  const documentType = documentTypeFromStorageSlug(row.slug);
  if (!documentType) return null;
  return {
    id: row.id,
    documentType,
    slug: logicalSlug(documentType, row.slug),
    payload: parseEnvelope(row.subtitle),
    sortOrder: row.sortOrder,
    isPublished: row.isPublished,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toCustomArtistDocuments(rows: ArtistContent[]): CustomArtistDocument[] {
  return rows.map(toCustomArtistDocument).filter((document): document is CustomArtistDocument => Boolean(document));
}

export function toArtistContentInput(input: {
  documentType: CustomDocumentType;
  slug: string;
  payload: DocumentPayload;
  sortOrder: number;
  isPublished: boolean;
}): InsertArtistContent {
  const storedSlug = storageSlug(input.documentType, input.slug);
  const envelope: StoredEnvelope = { schemaVersion: 1, data: input.payload };
  const kind = input.documentType === "release" ? "release" : input.documentType === "visual" ? "video" : input.documentType === "live" || input.documentType === "event" ? "live" : "hero";
  return {
    kind,
    slug: storedSlug,
    title: documentTitle(input.documentType, input.payload),
    subtitle: JSON.stringify(envelope),
    label: documentLabel(input.documentType, input.payload),
    href: documentHref(input.payload),
    imageUrl: documentImage(input.payload),
    sortOrder: input.sortOrder,
    isPublished: input.isPublished,
  };
}
