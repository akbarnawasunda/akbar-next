import { fetchPublicContent } from "./publicContent";

export type CmsSiteSettings = {
  siteTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  socialPreviewUrl?: string;
  canonicalUrl?: string;
  contactEmail?: string;
  bookingEmail?: string;
  pressEmail?: string;
};

export async function fetchSiteSettings() {
  const content = await fetchPublicContent();
  return content?.siteSettings ?? null;
}
