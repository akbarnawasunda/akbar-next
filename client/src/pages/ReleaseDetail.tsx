import { ArrowLeft, ArrowUpRight, Disc3, Music2, Play } from "lucide-react";
import { Link, useParams } from "wouter";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { officialBrand, releases } from "@/content/artistPlatform";
import { usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./ReleaseDetail.css";
import "./CatalogStage.css";
import { slugify } from "@shared/slug";

const rightsLabel = (format?: string) =>
  /bootleg/i.test(format || "")
    ? "UNOFFICIAL EDIT · CLEARANCE REQUIRED"
    : /remix|rmx/i.test(format || "")
      ? "REMIX · CLEARANCE REQUIRED"
      : "CATALOG ENTRY";

const rightsAction = (format?: string) =>
  /bootleg/i.test(format || "")
    ? "CLEARANCE / ASK FIRST"
    : "LICENSING / ASK FIRST";

export default function ReleaseDetail() {
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
      <div className="nf-page">
        <NightHeader active="/music" />
        <main id="main-content" tabIndex={-1}>
          <section className="an-rel-missing">
            <p className="an-meta">Rilisan tidak ditemukan</p>
            <h1>Rilisan ini tidak ada di katalog.</h1>
            <Link className="an-btn an-btn--quiet" href="/music">
              <ArrowLeft size={14} /> Kembali ke musik
            </Link>
          </section>
        </main>
        <NightFooter />
      </div>
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
    <div className="nf-page">
      <NightHeader active="/music" />
      <main id="main-content" tabIndex={-1}>
        {/* Artwork rilisan adalah subjek halaman ini: satu plate besar
            berdampingan dengan judul, metadata, dan aksi mendengarkan. */}
        <section className="an-rel-hero" aria-labelledby="release-title">
          <div className="an-rel-hero-copy">
            <Link className="an-back-link" href="/music">
              <ArrowLeft size={13} /> Kembali ke musik
            </Link>
            <h1 id="release-title">
              {release?.title || "Memuat rilisan…"}
            </h1>
            <p className="an-rel-meta">
              {release ? (
                <>
                  <span>{release.format}</span>
                  <span>{release.year}</span>
                  <span>{release.platform}</span>
                  <span>{rightsLabel(release.format)}</span>
                </>
              ) : (
                <span>Memuat katalog resmi Akbar Nawasunda.</span>
              )}
            </p>
            <div className="an-rel-actions">
              <a
                className="an-btn an-btn--solid"
                href={release?.href || "/music"}
                target={release ? "_blank" : undefined}
                rel={release ? "noreferrer" : undefined}
              >
                <Play size={13} fill="currentColor" /> Dengar rilisan
              </a>
              <Link
                className="an-btn an-btn--quiet"
                href="/inquire?type=licensing&source=release"
              >
                Lisensi &amp; izin pakai <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <figure className="an-rel-plate">
            <ResilientArtworkImage
              src={release?.artwork || officialBrand.socialPreview}
              backupSrc={officialBrand.socialPreview}
              alt={release ? `Artwork ${release.title}` : "Artwork rilisan"}
              loading="eager"
              fetchPriority="high"
            />
            <figcaption className="an-rel-chip">
              <Disc3 size={15} aria-hidden="true" />{" "}
              {release?.format || "Rilisan"}
            </figcaption>
          </figure>
        </section>

        {/* Catatan & kredit: label kiri, teks kanan. */}
        <section className="an-section an-rel-story">
          <p className="an-meta">Catatan &amp; kredit</p>
          <div className="an-rel-story-copy">
            <p>
              {release?.story ||
                "Buka rilisan ini melalui tautan resmi yang tersedia."}
            </p>
            <div className="an-rel-credits">
              {release?.credits ||
                "Lihat kredit rilisan di platform resmi jika tersedia."}
            </div>
          </div>
        </section>

        {/* Tautan resmi per platform + jalur izin pakai. */}
        <section className="an-section" aria-labelledby="release-links-title">
          <header className="an-head">
            <h2 id="release-links-title" className="an-title">
              Dengar &amp; pakai.
            </h2>
            <p className="an-meta">
              {links.length} tautan resmi · lisensi lewat studio
            </p>
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
                  <span className="an-rel-link-kind">Dengar</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <Link
                className="an-index-row"
                href="/inquire?type=licensing&source=release"
              >
                <span className="an-rel-link-label">
                  {rightsAction(release?.format)}
                </span>
                <span className="an-rel-link-kind">Lisensi</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </section>

        <section className="an-section an-rel-foot">
          <p className="an-meta">
            <Music2 size={13} aria-hidden="true" /> Rilisan lain
          </p>
          <Link className="an-btn an-btn--quiet" href="/music">
            Lihat semua musik <ArrowUpRight size={14} />
          </Link>
        </section>
      </main>
      <NightFooter />
    </div>
  );
}
