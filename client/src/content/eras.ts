import {
  officialBrand,
  releases as catalogReleases,
} from "@/content/artistPlatform";
import type { CmsArtistContent } from "@/content/publicContent";
import { publicJourney } from "@/content/publicContent";
import { slugify } from "@shared/slug";

/**
 * Era arsip — satu bentuk data bersama untuk timeline Universe ID dan EN.
 * Sumbernya CMS (journey milestones + katalog rilisan), dengan fallback
 * katalog statis supaya halaman tetap penuh saat CMS kosong.
 */
export type Era = {
  id: string;
  year: string;
  title: string;
  description: string;
  artwork?: string;
  relatedRelease?: string;
};

export function publicEras(
  content: CmsArtistContent | null | undefined,
  lang: "id" | "en" = "id"
): Era[] {
  const journey = publicJourney(content);
  const cmsReleases = content?.releases ?? [];
  const catalog = cmsReleases.length
    ? cmsReleases.map(item => ({
        title: item.title,
        image: item.artworkUrl || officialBrand.socialPreview,
      }))
    : catalogReleases.map(item => ({ title: item.title, image: item.image }));

  return journey.milestones.map((milestone, index) => {
    const related = catalog[index];
    const title =
      (lang === "en" ? milestone.titleEn : milestone.title) || milestone.title;
    const description =
      (lang === "en" ? milestone.bodyEn : milestone.body) || milestone.body;
    return {
      id: `${slugify(milestone.year || String(index))}-${slugify(title)}` || `era-${index}`,
      year: milestone.year,
      title,
      description,
      artwork: related?.image || officialBrand.socialPreview,
      relatedRelease: related?.title,
    };
  });
}
