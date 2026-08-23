import { createClient } from "@sanity/client";
import { dataset, projectId } from "./config";

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

const client = createClient({ projectId, dataset, apiVersion: "2026-08-22", useCdn: true });

export async function fetchSiteSettings() {
  return client.fetch<CmsSiteSettings | null>(
    '*[_type == "siteSettings"][0]{siteTitle, metaDescription, ogTitle, ogDescription, socialPreviewUrl, canonicalUrl, contactEmail, bookingEmail, pressEmail}',
  );
}
