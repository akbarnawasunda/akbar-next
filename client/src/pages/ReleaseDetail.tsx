import { ArrowLeft, ArrowUpRight, Disc3, Music2, Play } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { officialBrand, releases } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./ReleaseDetail.css";
import "./CatalogStage.css";
import { slugify } from "@shared/slug";

const rightsLabel = (
  format: string | undefined,
  labels: { bootleg: string; remix: string; catalog: string }
) =>
  /bootleg/i.test(format || "")
    ? labels.bootleg
    : /remix|rmx/i.test(format || "")
      ? labels.remix
      : labels.catalog;

const rightsAction = (
  format: string | undefined,
  labels: { bootleg: string; other: string }
) => (/bootleg/i.test(format || "") ? labels.bootleg : labels.other);

/**
 * Salinan halaman rilisan dua bahasa. `ReleaseDetailView` dipakai
 * `/music/:slug` dan `/en/music/:slug`, jadi hero artwork, catatan, daftar
 * tautan, dan jalur lisensi selalu satu komposisi.
 */
const copy = {
  id: {
    missingMeta: "Rilisan tidak ditemukan",
    missingTitle: "Rilisan ini tidak ada di katalog.",
    back: "Kembali ke musik",
    loadingTitle: "Memuat rilisan…",
    loadingMeta: "Memuat katalog resmi Akbar Nawasunda.",
    rights: {
      bootleg: "UNOFFICIAL EDIT · CLEARANCE REQUIRED",
      remix: "REMIX · CLEARANCE REQUIRED",
      catalog: "CATALOG ENTRY",
    },
    rightsAction: {
      bootleg: "CLEARANCE / ASK FIRST",
      other: "LICENSING / ASK FIRST",
    },
    listen: "Dengar rilisan",
    license: "Lisensi & izin pakai",
    artworkAlt: (title: string) => `Artwork ${title}`,
    artworkFallbackAlt: "Artwork rilisan",
    chipFallback: "Rilisan",
    storyMeta: "Catatan & kredit",
    storyFallback: "Buka rilisan ini melalui tautan resmi yang tersedia.",
    creditsFallback:
      "Lihat kredit rilisan di platform resmi jika tersedia.",
    linksTitle: "Dengar & pakai.",
    linksMeta: (count: number) =>
      `${count} tautan resmi · lisensi lewat studio`,
    linkKind: "Dengar",
    licenseKind: "Lisensi",
    otherMeta: "Rilisan lain",
    allMusic: "Lihat semua musik",
    musicHref: "/music",
    licenseHref: "/inquire?type=licensing&source=release",
  },
  en: {
    missingMeta: "Release not found",
    missingTitle: "This release is not in the catalog.",
    back: "Back to music",
    loadingTitle: "Loading release…",
    loadingMeta: "Loading the official Akbar Nawasunda catalog.",
    rights: {
      bootleg: "UNOFFICIAL EDIT · CLEARANCE REQUIRED",
      remix: "REMIX · CLEARANCE REQUIRED",
      catalog: "CATALOG ENTRY",
    },
    rightsAction: {
      bootleg: "CLEARANCE / ASK FIRST",
      other: "LICENSING / ASK FIRST",
    },
    listen: "Listen to the release",
    license: "Licensing & permission",
    artworkAlt: (title: string) => `Artwork for ${title}`,
    artworkFallbackAlt: "Release artwork",
    chipFallback: "Release",
    storyMeta: "Notes & credits",
    storyFallback: "Open this release through the official link that exists.",
    creditsFallback:
      "Check the release credits on the official platform where available.",
    linksTitle: "Listen & use.",
    linksMeta: (count: number) =>
      `${count} official links · licensing through the studio`,
    linkKind: "Listen",
    licenseKind: "Licensing",
    otherMeta: "More releases",
    allMusic: "See all music",
    musicHref: "/en/music",
    licenseHref: "/en/inquire?type=licensing&source=release",
  },
} as const;

export function ReleaseDetailView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
  const { slug = "" } = useParams<{ slug: string }>();
  const cms = usePublicArtistContent();
  const cmsRelease = (cms.data?.releases ?? []).find(
    (item) => slugify(item.title) === slug
  );
  const archiveRelease = releases.find((item) => slugify(item.title) === slug);

  const release = cmsRelease
    ? {
        title: cmsRelease.title,
        year: cmsRelease.year || "—",
        format: cmsRelease.format || "Release",
        platform: cmsRelease.platform || "Official link",
        href: cmsRelease.url,
        artwork:
          cmsRelease.artworkUrl ||
          archiveRelease?.image ||
          officialBrand.socialPreview,
        story: cmsRelease.story,
        credits: cmsRelease.credits,
        spotifyUrl: cmsRelease.spotifyUrl,
        appleMusicUrl: cmsRelease.appleMusicUrl,
        platformLinks: cmsRelease.platformLinks || [],
      }
    : archiveRelease
      ? {
          ...archiveRelease,
          artwork: archiveRelease.image || officialBrand.socialPreview,
          story: undefined,
          credits: undefined,
          spotifyUrl: undefined,
          appleMusicUrl: undefined,
          platformLinks: [],
        }
      : null;

  if (!release && !cms.isLoading) {
    return (
      <section className="an-rel-missing">
        <p className="an-meta">{t.missingMeta}</p>
        <h1>{t.missingTitle}</h1>
        <Link className="an-btn an-btn--quiet" href={t.musicHref}>
          <ArrowLeft size={14} /> {t.back}
        </Link>
      </section>
    );
  }

  const links = release
    ? [
        { label: release.platform || "Official link", href: release.href },
        ...release.platformLinks,
        ...(release.spotifyUrl
          ? [{ label: "Spotify", href: release.spotifyUrl }]
          : []),
        ...(release.appleMusicUrl
          ? [{ label: "Apple Music", href: release.appleMusicUrl }]
          : []),
      ].filter((link) => link.href)
    : [];

  return (
    <main id="main-content" tabIndex={-1}>
        {/* Artwork rilisan adalah subjek halaman ini: satu plate besar
            berdampingan dengan judul, metadata, dan aksi mendengarkan. */}
        <section className="an-rel-hero" aria-labelledby="release-title">
          <div className="an-rel-hero-copy">
            <Link className="an-back-link" href={t.musicHref}>
              <ArrowLeft size={13} /> {t.back}
            </Link>
            <h1 id="release-title">
              {release?.title || t.loadingTitle}
            </h1>
            <p className="an-rel-meta">
              {release ? (
                <>
                  <span>{release.format}</span>
                  <span>{release.year}</span>
                  <span>{release.platform}</span>
                  <span>{rightsLabel(release.format, t.rights)}</span>
                </>
              ) : (
                <span>{t.loadingMeta}</span>
              )}
            </p>
            <div className="an-rel-actions">
              <a
                className="an-btn an-btn--solid"
                href={release?.href || t.musicHref}
                target={release ? "_blank" : undefined}
                rel={release ? "noreferrer" : undefined}
              >
                <Play size={13} fill="currentColor" /> {t.listen}
              </a>
              <Link
                className="an-btn an-btn--quiet"
                href={t.licenseHref}
              >
                {t.license} <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <figure className="an-rel-plate">
            <ResilientArtworkImage
              src={release?.artwork || officialBrand.socialPreview}
              backupSrc={officialBrand.socialPreview}
              alt={
                release
                  ? t.artworkAlt(release.title)
                  : t.artworkFallbackAlt
              }
              loading="eager"
              fetchPriority="high"
            />
            <figcaption className="an-rel-chip">
              <Disc3 size={15} aria-hidden="true" />{" "}
              {release?.format || t.chipFallback}
            </figcaption>
          </figure>
        </section>

        {/* Catatan & kredit: label kiri, teks kanan. */}
        <section className="an-section an-rel-story">
          <p className="an-meta">{t.storyMeta}</p>
          <div className="an-rel-story-copy">
            <p>
              {release?.story || t.storyFallback}
            </p>
            <div className="an-rel-credits">
              {release?.credits || t.creditsFallback}
            </div>
          </div>
        </section>

        {/* Tautan resmi per platform + jalur izin pakai. */}
        <section className="an-section" aria-labelledby="release-links-title">
          <header className="an-head">
            <h2 id="release-links-title" className="an-title">
              {t.linksTitle}
            </h2>
            <p className="an-meta">{t.linksMeta(links.length)}</p>
          </header>
          <ul className="an-index an-rel-links">
            {links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <a
                  className="an-index-row"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="an-rel-link-label">{link.label}</span>
                  <span className="an-rel-link-kind">{t.linkKind}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <Link
                className="an-index-row"
                href={t.licenseHref}
              >
                <span className="an-rel-link-label">
                  {rightsAction(release?.format, t.rightsAction)}
                </span>
                <span className="an-rel-link-kind">{t.licenseKind}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </section>

        <section className="an-section an-rel-foot">
          <p className="an-meta">
            <Music2 size={13} aria-hidden="true" /> {t.otherMeta}
          </p>
          <Link className="an-btn an-btn--quiet" href={t.musicHref}>
            {t.allMusic} <ArrowUpRight size={14} />
          </Link>
        </section>
    </main>
  );
}

export default function ReleaseDetail() {
  return (
    <div className="nf-page">
      <NightHeader active="/music" />
      <ReleaseDetailView locale="id" />
      <NightFooter />
    </div>
  );
}
