import { ArrowDown, ArrowUpRight, Disc3, Music2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { slugify } from "@shared/slug";
import {
  artworkThumb,
  officialBrand,
  releases,
  verifiedArtistProfile,
} from "@/content/artistPlatform";
import {
  publicJourney,
  publicPhotoStories,
  usePublicArtistContent,
} from "@/content/publicContent";
import { ArtistPhotoStorySection } from "@/components/ArtistEditorialSections";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { Reveal } from "@/components/Reveal";
import {
  EditorialSection,
  SignalIndicator,
} from "@/components/editorial/EditorialKit";
import { EraTimeline } from "@/components/signature/EraTimeline";
import { publicEras } from "@/content/eras";
import "./EcosystemPages.css";
import "./ArchiveUpgrade.css";
import "./ArchiveArtwork.css";
import "./ArchiveStage.css";

/**
 * Salinan arsip dua bahasa. `UniverseView` dipakai `/universe` dan
 * `/en/universe`, jadi linimasa babak, catatan studio, dinding artwork, dan
 * jalur resmi selalu satu komposisi di kedua bahasa.
 */
const copy = {
  id: {
    kicker: "Arsip resmi · 2020—sekarang",
    title: "Perjalanan Akbar Nawasunda.",
    lede:
      "Dari DJ Akbar Remix ke Akbar Nawasunda — satu katalog, beberapa babak, dan semua tautan resminya di satu tempat.",
    portraitAlt: "Artwork editorial Akbar Nawasunda dengan tema future city",
    portraitCaption: "Arsip visual · Bandung Barat",
    facts: { since: "Mulai", based: "Basis", releases: "Rilisan" },
    basedValue: "Bandung Barat",
    exploreCta: "Telusuri babak",
    originMeta: "Asal & konteks",
    originFallback: "Perjalanan musik.",
    timelineTitle: (
      <>
        SATU NAMA,
        <br />
        BANYAK BABAK.
      </>
    ),
    timelineLede:
      "Setiap babak terbaca penuh di halaman ini. Gulir untuk melihat garis babak menyala dan artwork terkait berganti.",
    timelineIndicator: "ARSIP INTERAKTIF",
    studioMeta: "Catatan visual",
    studioTitle: "Dari studio.",
    studioCopy:
      "Salah satu arah visual dari dunia Akbar Nawasunda: industrial, kontras, dan dekat dengan energi electronic bass.",
    studioNote: "Bukan rilisan audio",
    studioAlt: "Potret editorial Akbar Nawasunda dengan cahaya merah",
    studioCta: "Lihat visual",
    wallMeta: (count: number) => `${count} rilisan · kanal resmi`,
    wallTitle: "Artwork rilisan.",
    wallCta: "Buka katalog",
    wallHref: "/music",
    routesMeta: "Jalur resmi",
    routesTitle: "Music, remix, booking, lisensi.",
    routesCopy: "Semua kebutuhan itu masuk lewat satu jalur resmi yang sama.",
    signalTitle: (
      <>
        TETAP DI
        <br />
        FREKUENSI.
      </>
    ),
    signalCopy:
      "Ikuti perjalanan, rilisan, dan kolaborasi baru Akbar Nawasunda dari satu kanal resmi.",
    routes: [
      {
        number: "01",
        title: "Dengar rilisan",
        copy: "Masuk ke katalog, artwork, dan tautan dengar resmi yang tersedia.",
        href: "/music",
        icon: Disc3,
      },
      {
        number: "02",
        title: "Remix / kolaborasi",
        copy: "Kirim konteks project untuk remix request, custom arrangement, atau kolaborasi.",
        href: "/inquire?type=remix&source=archive",
        icon: Sparkles,
      },
      {
        number: "03",
        title: "Booking / lisensi",
        copy: "Gunakan jalur inquiry resmi untuk performance, kebutuhan penggunaan musik, atau kerja sama.",
        href: "/inquire?type=booking&source=archive",
        icon: Music2,
      },
    ],
  },
  en: {
    kicker: "Official archive · 2020—now",
    title: "The Akbar Nawasunda journey.",
    lede:
      "From DJ Akbar Remix to Akbar Nawasunda — one catalog, several chapters, and every official link in one place.",
    portraitAlt: "Editorial artwork of Akbar Nawasunda with a future city theme",
    portraitCaption: "Visual archive · Bandung Barat",
    facts: { since: "Started", based: "Based in", releases: "Releases" },
    basedValue: "Bandung Barat",
    exploreCta: "Explore the chapters",
    originMeta: "Origin & context",
    originFallback: "The musical journey.",
    timelineTitle: (
      <>
        ONE NAME,
        <br />
        MANY CHAPTERS.
      </>
    ),
    timelineLede:
      "Every chapter reads in full on this page. Scroll to see the chapter line light up and the related artwork change.",
    timelineIndicator: "INTERACTIVE ARCHIVE",
    studioMeta: "Visual note",
    studioTitle: "From the studio.",
    studioCopy:
      "One visual direction from the Akbar Nawasunda world: industrial, high contrast, and close to the energy of electronic bass.",
    studioNote: "Not an audio release",
    studioAlt: "Editorial portrait of Akbar Nawasunda in red light",
    studioCta: "See the visuals",
    wallMeta: (count: number) => `${count} releases · official channels`,
    wallTitle: "Release artwork.",
    wallCta: "Open catalog",
    wallHref: "/en/music",
    routesMeta: "Official routes",
    routesTitle: "Music, remix, booking, licensing.",
    routesCopy: "All of it arrives through the same official route.",
    signalTitle: (
      <>
        STAY ON
        <br />
        THE FREQUENCY.
      </>
    ),
    signalCopy:
      "Follow the journey, releases, and new collaborations from one official channel.",
    routes: [
      {
        number: "01",
        title: "Hear the releases",
        copy: "Go to the catalog, artwork, and the official listening links that exist.",
        href: "/en/music",
        icon: Disc3,
      },
      {
        number: "02",
        title: "Remix / collaboration",
        copy: "Send the project context for a remix request, custom arrangement, or collaboration.",
        href: "/en/inquire?type=remix&source=archive",
        icon: Sparkles,
      },
      {
        number: "03",
        title: "Booking / licensing",
        copy: "Use the official inquiry route for performance, music usage, or partnership.",
        href: "/en/inquire?type=booking&source=archive",
        icon: Music2,
      },
    ],
  },
} as const;

export function UniverseView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
  const cms = usePublicArtistContent();
  const journey = publicJourney(cms.data);
  const photoStories = publicPhotoStories(cms.data);
  const cmsReleases = cms.data?.releases ?? [];
  const cmsCatalog = cmsReleases.map(item => {
    const fallback = releases.find(
      release =>
        release.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );
    return {
      title: item.title,
      year: item.year || fallback?.year || "—",
      platform: item.platform || fallback?.platform || "Official link",
      href:
        item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
    };
  });
  const catalog = [
    ...cmsCatalog,
    ...releases
      .filter(
        release =>
          !cmsCatalog.some(
            item =>
              item.title.trim().toLowerCase() ===
              release.title.trim().toLowerCase()
          )
      )
      .map(release => ({
        title: release.title,
        year: release.year,
        platform: release.platform,
        href: release.href,
        image: release.image,
      })),
  ];
  const eras = publicEras(cms.data, locale);

  return (
    <main id="main-content" tabIndex={-1}>
        {/* Babak 1 — pembuka arsip: satu potret arsip sebagai jangkar,
            sisanya fakta yang bisa diverifikasi. */}
        <section className="an-arc-hero" aria-labelledby="archive-title">
          <figure className="an-arc-hero-plate">
            <img
              src={officialBrand.archivePortrait}
              alt={t.portraitAlt}
              width={800}
              height={1000}
              loading="eager"
              decoding="async"
            />
            <figcaption>{t.portraitCaption}</figcaption>
          </figure>
          <div className="an-arc-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {t.kicker}
            </p>
            <h1 id="archive-title">{t.title}</h1>
            <p className="an-arc-lede">{t.lede}</p>
            <dl className="an-facts">
              <div>
                <dt>{t.facts.since}</dt>
                <dd>2020</dd>
              </div>
              <div>
                <dt>{t.facts.based}</dt>
                <dd>{t.basedValue}</dd>
              </div>
              <div>
                <dt>{t.facts.releases}</dt>
                <dd>{catalog.length}</dd>
              </div>
            </dl>
            <div className="an-arc-hero-actions">
              <a className="an-btn an-btn--quiet" href="#timeline">
                {t.exploreCta} <ArrowDown size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* Babak 2 — asal & konteks: teks panjang jadi subjek, bukan
            pelengkap di bawah judul. */}
        <Reveal>
          <section
            id="origin"
            className="an-section an-arc-origin"
            aria-labelledby="archive-origin-title"
          >
            <div className="an-arc-origin-head an-rise">
              <p className="an-meta">{t.originMeta}</p>
              <h2 id="archive-origin-title" className="an-title">
                {(locale === "en"
                  ? journey.titleEn
                  : journey.title) || t.originFallback}
              </h2>
              <ul className="an-arc-genres">
                {verifiedArtistProfile.genres.map(genre => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            </div>
            <div className="an-arc-origin-body an-rise">
              <p className="an-arc-intro">
                {locale === "en"
                  ? journey.introEn || verifiedArtistProfile.longBioEn
                  : journey.intro || verifiedArtistProfile.longBio}
              </p>
              <p className="an-arc-detail">
                {verifiedArtistProfile.location} ·{" "}
                {verifiedArtistProfile.aliases.join(" / ")}
              </p>
            </div>
          </section>
        </Reveal>

        {/* Babak 3 — linimasa babak, isi utama arsip. */}
        <EditorialSection
          id="timeline"
          title={t.timelineTitle}
          lede={t.timelineLede}
          aside={<SignalIndicator label={t.timelineIndicator} />}
        >
          <EraTimeline eras={eras} lang={locale} />
        </EditorialSection>

        {/* Babak 4 — catatan dari studio: satu gambar, satu keterangan. */}
        <Reveal>
          <section
            className="an-section an-arc-studio"
            aria-labelledby="archive-studio-title"
          >
            <figure className="an-arc-studio-plate an-rise">
              <img
                src={officialBrand.editorialPortrait}
                alt={t.studioAlt}
                width={667}
                height={1000}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="an-arc-studio-copy an-rise">
              <p className="an-meta">{t.studioMeta}</p>
              <h2 id="archive-studio-title" className="an-title">
                {t.studioTitle}
              </h2>
              <p>{t.studioCopy}</p>
              <p className="an-arc-note">{t.studioNote}</p>
              <div className="an-arc-hero-actions">
                <Link
                  className="an-btn an-btn--quiet"
                  href={locale === "en" ? "/en/visuals" : "/visuals"}
                >
                  {t.studioCta} <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        <ArtistPhotoStorySection photoStories={photoStories} locale={locale} />

        {/* Babak 5 — dinding artwork: enam rilisan, lebar bergantian. */}
        <Reveal>
          <section
            className="an-section an-arc-wall"
            aria-labelledby="archive-artwork-title"
          >
            <header className="an-head an-head--row">
              <div>
                <p className="an-meta">{t.wallMeta(catalog.length)}</p>
                <h2 id="archive-artwork-title" className="an-title">
                  {t.wallTitle}
                </h2>
              </div>
              <Link className="an-btn an-btn--quiet" href={t.wallHref}>
                {t.wallCta} <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </header>
            <div className="an-arc-wall-grid">
              {catalog.slice(0, 6).map(release => (
                <Link
                  className="an-arc-wall-item an-rise"
                  href={`${locale === "en" ? "/en" : ""}/music/${slugify(
                    release.title
                  )}`}
                  key={release.title}
                >
                  <span className="an-arc-wall-art">
                    <ResilientArtworkImage
                      src={artworkThumb(release.image)}
                      backupSrc={release.image}
                      alt={`Artwork ${release.title}`}
                    />
                  </span>
                  <span className="an-arc-wall-meta">
                    <small>
                      {release.year} · {release.platform}
                    </small>
                    <strong>{release.title}</strong>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Babak 6 — jalur resmi sebagai indeks, bukan kartu. */}
        <section
          className="an-section an-arc-routes"
          aria-labelledby="archive-routes-title"
        >
          <div className="an-arc-route-head">
            <p className="an-meta">{t.routesMeta}</p>
            <h2 id="archive-routes-title" className="an-title">
              {t.routesTitle}
            </h2>
            <p>{t.routesCopy}</p>
          </div>
          <ul className="an-index an-arc-route-list">
            {t.routes.map(route => {
              const Icon = route.icon;
              return (
                <li key={route.title}>
                  <Link className="an-index-row" href={route.href}>
                    <span className="an-meta">{route.number}</span>
                    <span className="an-arc-route-copy">
                      <strong>{route.title}</strong>
                      <small>{route.copy}</small>
                    </span>
                    <Icon size={16} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Formulir langganan hanya ada di beranda. Dulu section yang sama
            dipasang di lima halaman, jadi pengunjung melihat blok yang sama
            berulang kali. Sekarang satu pemilik: beranda. */}
    </main>
  );
}

export default function Universe() {
  return (
    <div className="nf-page an-archive-page">
      <NightHeader active="/universe" />
      <UniverseView locale="id" />
      <NightFooter />
    </div>
  );
}
