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
  /** Slug dokumen rilisan (`/music/:slug`) — sama dengan resolusi katalog. */
  releaseSlug?: string;
};

type CatalogEntry = { title: string; image?: string; format?: string; year?: string };

/**
 * Pasangan babak → SATU rilisan contoh.
 *
 * CMS tidak punya relasi eksplisit babak ↔ rilisan [FACT: `CmsJourney`
 * hanya memuat milestone], jadi tiap babak hanya memajang satu rilisan
 * contoh — dipilih dari data rilisan itu sendiri, bukan dikarang:
 * babak yang namanya menyebut "Remix" mendapat karya reinterpretasi
 * (format Remix/Bootleg), babak lain mendapat karya orisinal; masing-masing
 * diambil dari tahun terbaru. Pembagian itu sama dengan biografi
 * terverifikasi (DJ Akbar Remix = reinterpretasi lagu populer, Akbar
 * Nawasunda = karya orisinal) [INTERP dari `artistPlatform.ts`].
 *
 * Label di UI adalah "BUKA RILISAN" — bukan klaim bahwa rilisan itu milik
 * babak tersebut. Peta relasi yang sesungguhnya hanya bisa datang dari CMS.
 */
const isReworkFormat = (format: string | undefined) =>
  /remix|bootleg/i.test(format ?? "");

function relatedForEra(
  eraTitle: string,
  index: number,
  catalog: CatalogEntry[]
): CatalogEntry | undefined {
  const wantsRework = /remix/i.test(eraTitle);
  const candidates = catalog
    .filter(item => isReworkFormat(item.format) === wantsRework)
    .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
  return candidates[0] ?? catalog[index] ?? catalog[0];
}

export function publicEras(
  content: CmsArtistContent | null | undefined,
  lang: "id" | "en" = "id"
): Era[] {
  const journey = publicJourney(content);
  const cmsReleases = content?.releases ?? [];
  const catalog: CatalogEntry[] = cmsReleases.length
    ? cmsReleases.map(item => ({
        title: item.title,
        image: item.artworkUrl || officialBrand.socialPreview,
        format: item.format,
        year: item.year,
      }))
    : catalogReleases.map(item => ({
        title: item.title,
        image: item.image,
        format: item.format,
        year: item.year,
      }));

  return journey.milestones.map((milestone, index) => {
    const title =
      (lang === "en" ? milestone.titleEn : milestone.title) || milestone.title;
    const description =
      (lang === "en" ? milestone.bodyEn : milestone.body) || milestone.body;
    const related = relatedForEra(title, index, catalog);
    return {
      id: `${slugify(milestone.year || String(index))}-${slugify(title)}` || `era-${index}`,
      year: milestone.year,
      title,
      description,
      artwork: related?.image || officialBrand.socialPreview,
      relatedRelease: related?.title,
      releaseSlug: related?.title ? slugify(related.title) : undefined,
    };
  });
}
