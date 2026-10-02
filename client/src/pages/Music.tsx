import FanSignalSection from "@/components/FanSignalSection";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { ArrowLeft, ArrowUpRight, ArrowRight, Play } from "lucide-react";
import { useRef } from "react";
import { OfficialMediaFrame } from "@/components/OfficialMediaFrame";
import { soundcloudEmbedUrl } from "@/components/MusicEmbed";
import { Reveal } from "@/components/Reveal";
import { PlatformIcon } from "@/components/PlatformIcon";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import {
  artworkThumb,
  currentRelease,
  formatPublicIndex,
  officialBrand,
  releases,
} from "@/content/artistPlatform";
import {
  publicPlatformLinks,
  usePublicArtistContent,
} from "@/content/publicContent";
import { Link } from "wouter";
import { AudioPlayerShell, CtaPanel } from "@/components/editorial/EditorialKit";
import "./EcosystemPages.css";
import "./CatalogStage.css";

const soundcloudDrops = [
  {
    title: "Masih Mencintainya — Papinka",
    url: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda",
  },
  {
    title: "Ngertenono Ati Medium Hall",
    url: "https://soundcloud.com/akbarnawasunda/ngertenono_ati_medium_hall_mbfrecords",
  },
];

const releaseSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function Music() {
  const catalogRef = useRef<HTMLDivElement>(null);
  const cms = usePublicArtistContent();
  const editablePlatformLinks = publicPlatformLinks(cms.data);
  const cmsReleases = cms.data?.releases ?? [];

  const cmsCatalog = cmsReleases.map(item => {
    const archive = releases.find(
      release =>
        release.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );
    return {
      title: item.title,
      format: item.format || archive?.format || "Single",
      year: item.year || archive?.year || "—",
      platform: item.platform || archive?.platform || "Official link",
      href:
        item.url || archive?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || archive?.image || officialBrand.socialPreview,
    };
  });

  const catalog = [
    ...cmsCatalog,
    ...releases.filter(
      legacy =>
        !cmsCatalog.some(
          current =>
            current.title.trim().toLowerCase() ===
            legacy.title.trim().toLowerCase()
        )
    ),
  ];

  const cmsCurrent = cmsReleases.find(item => item.isCurrent) || cmsReleases[0];
  const featured = cmsCurrent
    ? {
        ...currentRelease,
        title: cmsCurrent.title,
        type: cmsCurrent.platform || cmsCurrent.format || "CATALOG ENTRY",
        href: cmsCurrent.url || currentRelease.href,
        artwork: cmsCurrent.artworkUrl || currentRelease.image,
        story: cmsCurrent.story,
        credits: cmsCurrent.credits,
      }
    : {
        ...currentRelease,
        artwork: currentRelease.image,
        story: undefined,
        credits: undefined,
      };

  const embeddedDrops = cmsReleases
    .filter(item => item.embedUrl)
    .slice(0, 2)
    .map(item => ({ title: item.title, url: item.embedUrl! }));

  const players = embeddedDrops.length ? embeddedDrops : soundcloudDrops;
  const scrollCatalog = (direction: number) => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    catalogRef.current?.scrollBy({
      left: direction * Math.min(catalogRef.current.clientWidth * 0.82, 520),
      behavior,
    });
  };

  const spotifyHref =
    editablePlatformLinks.find(link => link.label === "Spotify")?.href ||
    "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw";

  return (
    <div className="nf-page music-reference-page">
      <NightHeader active="/music" />
      <main id="main-content" tabIndex={-1}>
        {/* ADEGAN 1 — pembuka katalog. Artwork rilisan unggulan jadi subjek
            halaman, bukan latar belakang dekoratif di belakang judul. */}
        <section className="an-cat-hero" aria-labelledby="catalog-title">
          <div className="an-cat-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {catalog.length} rilisan · {editablePlatformLinks.length} kanal
            </p>
            <h1 id="catalog-title">Musik</h1>
            <p className="an-cat-lede">
              Rilisan, remix, dan edit Akbar Nawasunda lewat kanal resmi.
              Setiap entri punya halaman sendiri: catatan, kredit, dan tautan
              platformnya.
            </p>
            <div className="an-cat-hero-actions">
              <a
                className="an-btn an-btn--solid"
                href={featured.href}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={13} fill="currentColor" /> Dengar rilisan terbaru
              </a>
              <Link
                className="an-btn an-btn--quiet"
                href={`/music/${releaseSlug(featured.title)}`}
              >
                Buka detail rilisan <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <figure className="an-cat-hero-art">
            <ResilientArtworkImage
              src={featured.artwork}
              backupSrc={officialBrand.socialPreview}
              alt={`Artwork ${featured.title}`}
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>
              <span>{cms.isLoading ? "Memuat rilisan" : "Rilisan terbaru"}</span>
              <strong>{featured.title}</strong>
            </figcaption>
          </figure>
        </section>

        {/* ADEGAN 2 — catatan rilisan: label di kiri, teks di kanan. */}
        <Reveal>
          <section className="an-section an-cat-note">
            <p className="an-meta">
              {featured.story ? "Catatan rilisan" : "Rilisan terbaru"}
            </p>
            <div className="an-cat-note-copy">
              <h2>{featured.title}</h2>
              <p>
                {featured.story ||
                  "Dengarkan versi ini melalui kanal SoundCloud resmi Akbar Nawasunda."}
              </p>
              <div className="an-rel-credits">
                {featured.credits ||
                  "Lihat kredit rilisan di platform resmi jika tersedia."}
              </div>
              <div className="an-doc-actions">
                <Link
                  className="an-btn an-btn--quiet"
                  href={`/music/${releaseSlug(featured.title)}`}
                >
                  Detail rilisan <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ADEGAN 3 — kanal resmi sebagai baris, bukan grid kartu. */}
        <section
          className="an-section an-cat-channels"
          aria-labelledby="channels-title"
        >
          <header className="an-head">
            <h2 id="channels-title" className="an-title">
              Dengar di kanal resminya.
            </h2>
            <p className="an-meta">
              {editablePlatformLinks.length} kanal resmi · rilisan, remix, set
            </p>
          </header>
          <ul className="an-index">
            {editablePlatformLinks.map((platform, index) => (
              <li key={platform.label}>
                <a
                  className="an-index-row"
                  href={platform.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Buka Akbar Nawasunda di ${platform.label}`}
                >
                  <span className="an-meta" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="an-cat-channel-name">{platform.label}</span>
                  <span className="an-cat-channel-mark" aria-hidden="true">
                    <PlatformIcon label={platform.label} />
                  </span>
                  <ArrowUpRight
                    className="an-cat-channel-arrow"
                    size={16}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ADEGAN 4 — pemutar resmi di tempatnya, bukan disembunyikan. */}
        <Reveal>
          <section className="an-section" aria-labelledby="listen-title">
            <header className="an-head an-head--row">
              <div>
                <h2 id="listen-title" className="an-title">
                  Dengar langsung.
                </h2>
                <p className="an-meta">Player resmi · SoundCloud</p>
              </div>
              <p className="an-cat-lede">
                Pilih satu rilisan untuk mulai mendengar. Tautan resmi tetap
                tersedia kalau player tidak dibutuhkan.
              </p>
            </header>
            <div className="an-cat-listen-grid">
              {players.map(drop => {
                const known = catalog.find(release =>
                  release.title
                    .toLowerCase()
                    .includes(drop.title.toLowerCase().split(" — ")[0])
                );
                return (
                  <AudioPlayerShell
                    key={drop.url}
                    title={drop.title}
                    provider="SoundCloud"
                  >
                    <OfficialMediaFrame
                      title={drop.title}
                      provider="SoundCloud"
                      sourceUrl={drop.url}
                      embedUrl={soundcloudEmbedUrl(drop.url)}
                      artwork={known?.image || officialBrand.socialPreview}
                      backupArtwork={officialBrand.socialPreview}
                      description="Tautan resmi selalu tersedia."
                    />
                  </AudioPlayerShell>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* ADEGAN 5 — rail katalog dengan lebar kartu bergantian. */}
        <Reveal>
          <section className="an-section" aria-labelledby="catalog-rail-title">
            <header className="an-head an-head--row">
              <div>
                <h2 id="catalog-rail-title" className="an-title">
                  Semua rilisan.
                </h2>
                <p className="an-meta">
                  {catalog.length} entri ·{" "}
                  {cmsReleases.length ? "dikelola di CMS" : "arsip resmi"}
                </p>
              </div>
              <div
                className="an-catalog-controls"
                aria-label="Kontrol katalog rilisan"
              >
                <button
                  type="button"
                  aria-label="Rilisan sebelumnya"
                  onClick={() => scrollCatalog(-1)}
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Rilisan berikutnya"
                  onClick={() => scrollCatalog(1)}
                >
                  <ArrowRight size={15} />
                </button>
              </div>
            </header>
            <div
              className="an-rail"
              ref={catalogRef}
              tabIndex={0}
              aria-label="Katalog rilisan Akbar Nawasunda"
            >
              {catalog.map((release, index) => (
                <Link
                  key={`${release.title}-${index}`}
                  className="an-release"
                  href={`/music/${releaseSlug(release.title)}`}
                  data-signal-interactive
                >
                  <span className="an-release-art">
                    <ResilientArtworkImage
                      src={artworkThumb(release.image)}
                      backupSrc={release.image}
                      alt={`Artwork ${release.title}`}
                    />
                  </span>
                  <span className="an-release-meta">
                    <small>
                      {formatPublicIndex(index)} · {release.format} ·{" "}
                      {release.year}
                    </small>
                    <strong>{release.title}</strong>
                    <em>
                      {release.platform}{" "}
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </em>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ADEGAN 6 — strip platform: satu ajakan, bukan satu section penuh. */}
        <section className="an-section an-cat-band" aria-labelledby="band-title">
          <h2 id="band-title" className="an-cat-band-title">
            Rilisan ini juga tersedia di Spotify.
          </h2>
          <a
            className="an-btn an-btn--solid"
            href={spotifyHref}
            target="_blank"
            rel="noreferrer"
          >
            <PlatformIcon label="Spotify" /> Buka Spotify
          </a>
        </section>

        <CtaPanel
          title={
            <>
              PAKAI KARYANYA
              <br />
              DI PROYEKMU.
            </>
          }
          copy="Butuh track untuk film, iklan, konten, atau ingin remix custom? Jalur lisensi dan brief produksi ada di satu tempat."
          actions={
            <>
              <Link className="ed-button" href="/licensing">
                LISENSI MUSIK <ArrowUpRight size={14} />
              </Link>
              <Link className="ed-button--ghost" href="/inquire?type=remix&source=music">
                MINTA REMIX <ArrowRight size={14} />
              </Link>
            </>
          }
        />

        <FanSignalSection
          source={FAN_SIGNAL_SOURCES.music}
          title={
            <>
              DENGARKAN
              <br />
              BERIKUTNYA.
            </>
          }
          description="Catatan rilisan, remix, dan jadwal dari kanal resmi langsung ke email kamu."
        />
      </main>
      <NightFooter />
    </div>
  );
}
