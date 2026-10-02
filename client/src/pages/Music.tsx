import FanSignalSection from "@/components/FanSignalSection";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { ArrowLeft, ArrowUpRight, ArrowRight } from "lucide-react";
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
import {
  AudioPlayerShell,
  CtaPanel,
  SignalIndicator,
} from "@/components/editorial/EditorialKit";
import "./EcosystemPages.css";

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

  return (
    <div className="nf-page music-reference-page">
      <NightHeader active="/music" />
      <main id="main-content" tabIndex={-1}>
        <section
          className="nf-page-hero"
          style={
            {
              "--page-image": `url(${officialBrand.portrait || featured.artwork || officialBrand.socialPreview})`,
            } as React.CSSProperties
          }
        >
          <div>
            <h1>
              MUSIK
              <br />
              <em>AKBAR.</em>
            </h1>
            <p>
              Rilisan dan remix yang tersedia melalui kanal resmi Akbar
              Nawasunda.
            </p>
          </div>
          <div className="nf-hero-note">
            <span>{cms.isLoading ? "MEMUAT RILISAN" : "RILISAN TERBARU"}</span>
            <strong>{featured.title}</strong>
            <a
              className="nf-text-button"
              href={featured.href}
              target="_blank"
              rel="noreferrer"
            >
              DENGAR <ArrowUpRight size={14} />
            </a>
          </div>
        </section>

        <Reveal>
          <section className="nf-section an-story-section">
            <div className="an-story-art">
              <ResilientArtworkImage
                src={featured.artwork}
                backupSrc={officialBrand.socialPreview}
                alt={`Artwork ${featured.title}`}
              />
            </div>
            <div className="an-story-copy">
              <span className="an-story-label">
                {featured.story ? "CATATAN RILISAN" : "RILISAN TERBARU"}
              </span>
              <h2>{featured.title}</h2>
              <p>
                {featured.story ||
                  "Dengarkan versi ini melalui kanal SoundCloud resmi Akbar Nawasunda."}
              </p>
              <div className="an-story-credits">
                {featured.credits ||
                  "Lihat kredit rilisan di platform resmi jika tersedia."}
              </div>
              <Link
                className="nf-text-button"
                href={`/music/${releaseSlug(featured.title)}`}
              >
                DETAIL RILISAN <ArrowUpRight size={14} />
              </Link>
            </div>
          </section>
        </Reveal>

        <section className="nf-platform-hub">
          <div className="nf-platform-hub-copy">
            <h2>
              PILIH
              <br />
              TEMPATNYA.
            </h2>
            <div className="nf-platform-grid">
              {editablePlatformLinks.map(platform => (
                <a
                  key={platform.label}
                  href={platform.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PlatformIcon label={platform.label} />
                  <span>{platform.label}</span>
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </div>
        </section>

        <Reveal>
          <section className="nf-section">
            <div className="nf-section-title">
              <div>
                <h2>
                  DENGAR
                  <br />
                  LANGSUNG.
                </h2>
              </div>
              <div>
                <SignalIndicator label="PLAYER SIAP" />
                <p>
                  Pilih satu rilisan untuk mulai mendengar. Tautan resmi tetap
                  tersedia kalau player tidak dibutuhkan.
                </p>
              </div>
            </div>
            <div className="nf-embed-grid">
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

        <Reveal>
          <section className="nf-section dark-panel">
            <div className="nf-section-title">
              <div>
                <h2>
                  SEMUA
                  <br />
                  RILISAN.
                </h2>
              </div>
              <p>
                {cmsReleases.length
                  ? "Rilisan yang sedang dikelola dan arsip resmi."
                  : "Kumpulan rilisan Akbar Nawasunda."}
              </p>
            </div>
            <div className="nf-catalog-frame">
              <div className="nf-catalog-toolbar">
                <span>GESER UNTUK MENJELAJAH</span>
                <div
                  className="nf-catalog-controls"
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
              </div>
              <div
                className="nf-catalog"
                ref={catalogRef}
                tabIndex={0}
                aria-label="Katalog rilisan Akbar Nawasunda"
              >
                {catalog.map((release, index) => (
                  <Link
                    key={`${release.title}-${index}`}
                    className="nf-catalog-card"
                    href={`/music/${releaseSlug(release.title)}`}
                    data-signal-interactive
                  >
                    <ResilientArtworkImage
                      className="nf-catalog-art"
                      src={artworkThumb(release.image)}
                      backupSrc={release.image}
                      alt={`Artwork ${release.title}`}
                    />
                    <span className="index">{formatPublicIndex(index)}</span>
                    <PlatformIcon label={release.platform} />
                    <p>
                      {release.format} · {release.year}
                    </p>
                    <h3>{release.title}</h3>
                    <b>
                      {release.platform}
                      <ArrowUpRight size={13} />
                    </b>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <section className="nf-section">
          <div className="nf-section-title">
            <div>
              <h2>
                DENGAR
                <br />
                DI SPOTIFY.
              </h2>
            </div>
            <a
              className="nf-button"
              href={
                editablePlatformLinks.find(link => link.label === "Spotify")
                  ?.href ||
                "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw"
              }
              target="_blank"
              rel="noreferrer"
            >
              <PlatformIcon label="Spotify" /> SPOTIFY
            </a>
          </div>
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
