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

/**
 * Salinan katalog dua bahasa. `MusicView` dipakai `/music` dan `/en/music`,
 * jadi pembuka, catatan rilisan, daftar kanal, pemutar, rail katalog, dan
 * CTA selalu satu komposisi di kedua bahasa.
 */
const copy = {
  id: {
    heroKicker: (releases: number, channels: number) =>
      `${releases} rilisan · ${channels} kanal`,
    heroTitle: "Musik",
    heroLede:
      "Rilisan, remix, dan edit Akbar Nawasunda lewat kanal resmi. Setiap entri punya halaman sendiri: catatan, kredit, dan tautan platformnya.",
    listenLatest: "Dengar rilisan terbaru",
    openDetail: "Buka detail rilisan",
    artworkAlt: (title: string) => `Artwork ${title}`,
    loadingRelease: "Memuat rilisan",
    latestRelease: "Rilisan terbaru",
    noteMetaStory: "Catatan rilisan",
    noteStoryFallback:
      "Dengarkan versi ini melalui kanal SoundCloud resmi Akbar Nawasunda.",
    creditsFallback:
      "Lihat kredit rilisan di platform resmi jika tersedia.",
    detailCta: "Detail rilisan",
    channelsTitle: "Dengar di kanal resminya.",
    channelsMeta: (count: number) =>
      `${count} kanal resmi · rilisan, remix, set`,
    channelAria: (label: string) => `Buka Akbar Nawasunda di ${label}`,
    listenTitle: "Dengar langsung.",
    listenMeta: "Player resmi · SoundCloud",
    playerUnit: (index: number) =>
      `Pemutar ${String(index + 1).padStart(2, "0")}`,
    listenCopy:
      "Pilih satu rilisan untuk mulai mendengar. Tautan resmi tetap tersedia kalau player tidak dibutuhkan.",
    playerFallback: "Tautan resmi selalu tersedia.",
    railTitle: "Semua rilisan.",
    railMetaManaged: (count: number) => `${count} entri · dikelola di CMS`,
    railMetaArchive: (count: number) => `${count} entri · arsip resmi`,
    railControls: "Kontrol katalog rilisan",
    railPrev: "Rilisan sebelumnya",
    railNext: "Rilisan berikutnya",
    railLabel: "Katalog rilisan Akbar Nawasunda",
    bandTitle: "Rilisan ini juga tersedia di Spotify.",
    bandCta: "Buka Spotify",
    ctaTitle: (
      <>
        PAKAI KARYANYA
        <br />
        DI PROYEKMU.
      </>
    ),
    ctaCopy:
      "Butuh track untuk film, iklan, konten, atau ingin remix custom? Jalur lisensi dan brief produksi ada di satu tempat.",
    ctaPrimary: "LISENSI MUSIK",
    ctaSecondary: "MINTA REMIX",
    licensingHref: "/licensing",
    remixHref: "/inquire?type=remix&source=music",
    musicHref: "/music",
    signalTitle: (
      <>
        DENGARKAN
        <br />
        BERIKUTNYA.
      </>
    ),
    signalCopy:
      "Catatan rilisan, remix, dan jadwal dari kanal resmi langsung ke email kamu.",
  },
  en: {
    heroKicker: (releases: number, channels: number) =>
      `${releases} releases · ${channels} channels`,
    heroTitle: "Music",
    heroLede:
      "Releases, remixes, and edits by Akbar Nawasunda through the official channels. Every entry has its own page: notes, credits, and platform links.",
    listenLatest: "Hear the latest release",
    openDetail: "Open release detail",
    artworkAlt: (title: string) => `Artwork for ${title}`,
    loadingRelease: "Loading release",
    latestRelease: "Latest release",
    noteMetaStory: "Release notes",
    noteStoryFallback:
      "Listen to this version through the official Akbar Nawasunda SoundCloud channel.",
    creditsFallback:
      "Check the release credits on the official platform where available.",
    detailCta: "Release detail",
    channelsTitle: "Listen on the official channels.",
    channelsMeta: (count: number) =>
      `${count} official channels · releases, remixes, sets`,
    channelAria: (label: string) => `Open Akbar Nawasunda on ${label}`,
    listenTitle: "Listen now.",
    listenMeta: "Official player · SoundCloud",
    playerUnit: (index: number) =>
      `Player ${String(index + 1).padStart(2, "0")}`,
    listenCopy:
      "Pick a release to start listening. The official links stay available if you do not need the player.",
    playerFallback: "Official links are always available.",
    railTitle: "All releases.",
    railMetaManaged: (count: number) => `${count} entries · managed in the CMS`,
    railMetaArchive: (count: number) => `${count} entries · official archive`,
    railControls: "Release catalog controls",
    railPrev: "Previous release",
    railNext: "Next release",
    railLabel: "Akbar Nawasunda release catalog",
    bandTitle: "This release is also available on Spotify.",
    bandCta: "Open Spotify",
    ctaTitle: (
      <>
        USE THE WORK
        <br />
        IN YOUR PROJECT.
      </>
    ),
    ctaCopy:
      "Need a track for a film, ad, or content, or want a custom remix? The licensing route and the production brief live in one place.",
    ctaPrimary: "MUSIC LICENSING",
    ctaSecondary: "REQUEST A REMIX",
    licensingHref: "/en/licensing",
    remixHref: "/en/inquire?type=remix&source=music",
    musicHref: "/en/music",
    signalTitle: (
      <>
        HEAR WHAT
        <br />
        COMES NEXT.
      </>
    ),
    signalCopy:
      "Release notes, remixes, and dates from the official channel straight to your email.",
  },
} as const;

export function MusicView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
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
    <main id="main-content" tabIndex={-1}>
        {/* ADEGAN 1 — pembuka katalog. Artwork rilisan unggulan jadi subjek
            halaman, bukan latar belakang dekoratif di belakang judul. */}
        <section className="an-cat-hero" aria-labelledby="catalog-title">
          <div className="an-cat-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {t.heroKicker(catalog.length, editablePlatformLinks.length)}
            </p>
            <h1 id="catalog-title">{t.heroTitle}</h1>
            <p className="an-cat-lede">{t.heroLede}</p>
            <div className="an-cat-hero-actions">
              <a
                className="an-btn an-btn--solid"
                href={featured.href}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={13} fill="currentColor" /> {t.listenLatest}
              </a>
              <Link
                className="an-btn an-btn--quiet"
                href={`${t.musicHref}/${releaseSlug(featured.title)}`}
              >
                {t.openDetail} <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <figure className="an-cat-hero-art">
            <ResilientArtworkImage
              src={featured.artwork}
              backupSrc={officialBrand.socialPreview}
              alt={t.artworkAlt(featured.title)}
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>
              <span>{cms.isLoading ? t.loadingRelease : t.latestRelease}</span>
              <strong>{featured.title}</strong>
            </figcaption>
          </figure>
        </section>

        {/* ADEGAN 2 — catatan rilisan: label di kiri, teks di kanan. */}
        <Reveal>
          <section className="an-section an-cat-note">
            <p className="an-meta">
              {featured.story ? t.noteMetaStory : t.latestRelease}
            </p>
            <div className="an-cat-note-copy">
              <h2>{featured.title}</h2>
              <p>
                {featured.story || t.noteStoryFallback}
              </p>
              <div className="an-rel-credits">
                {featured.credits || t.creditsFallback}
              </div>
              <div className="an-doc-actions">
                <Link
                  className="an-btn an-btn--quiet"
                  href={`${t.musicHref}/${releaseSlug(featured.title)}`}
                >
                  {t.detailCta} <ArrowUpRight size={14} />
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
              {t.channelsTitle}
            </h2>
            <p className="an-meta">
              {t.channelsMeta(editablePlatformLinks.length)}
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
                  aria-label={t.channelAria(platform.label)}
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
                  {t.listenTitle}
                </h2>
                <p className="an-meta">{t.listenMeta}</p>
              </div>
              <p className="an-cat-lede">{t.listenCopy}</p>
            </header>
            <div className="an-cat-listen-grid">
              {players.map((drop, index) => {
                const known = catalog.find(release =>
                  release.title
                    .toLowerCase()
                    .includes(drop.title.toLowerCase().split(" — ")[0])
                );
                return (
                  <AudioPlayerShell
                    key={drop.url}
                    title={t.playerUnit(index)}
                    provider="SoundCloud"
                  >
                    <OfficialMediaFrame
                      title={drop.title}
                      provider="SoundCloud"
                      sourceUrl={drop.url}
                      embedUrl={soundcloudEmbedUrl(drop.url)}
                      artwork={known?.image || officialBrand.socialPreview}
                      backupArtwork={officialBrand.socialPreview}
                      description={t.playerFallback}
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
                  {t.railTitle}
                </h2>
                <p className="an-meta">
                  {cmsReleases.length
                    ? t.railMetaManaged(catalog.length)
                    : t.railMetaArchive(catalog.length)}
                </p>
              </div>
              <div
                className="an-catalog-controls"
                aria-label={t.railControls}
              >
                <button
                  type="button"
                  aria-label={t.railPrev}
                  onClick={() => scrollCatalog(-1)}
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  aria-label={t.railNext}
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
              aria-label={t.railLabel}
            >
              {catalog.map((release, index) => (
                <Link
                  key={`${release.title}-${index}`}
                  className="an-release"
                  href={`${t.musicHref}/${releaseSlug(release.title)}`}
                  data-signal-interactive
                >
                  <span className="an-release-art">
                    <ResilientArtworkImage
                      src={artworkThumb(release.image)}
                      backupSrc={release.image}
                      alt={t.artworkAlt(release.title)}
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
            {t.bandTitle}
          </h2>
          <a
            className="an-btn an-btn--solid"
            href={spotifyHref}
            target="_blank"
            rel="noreferrer"
          >
            <PlatformIcon label="Spotify" /> {t.bandCta}
          </a>
        </section>

        <CtaPanel
          title={t.ctaTitle}
          copy={t.ctaCopy}
          actions={
            <>
              <Link className="ed-button" href={t.licensingHref}>
                {t.ctaPrimary} <ArrowUpRight size={14} />
              </Link>
              <Link className="ed-button--ghost" href={t.remixHref}>
                {t.ctaSecondary} <ArrowRight size={14} />
              </Link>
            </>
          }
        />

        {/* Formulir langganan hanya ada di beranda. Dulu section yang sama
            dipasang di lima halaman, jadi pengunjung melihat blok yang sama
            berulang kali. Sekarang satu pemilik: beranda. */}
    </main>
  );
}

export default function Music() {
  return (
    <div className="nf-page music-reference-page">
      <NightHeader active="/music" />
      <MusicView locale="id" />
      <NightFooter />
    </div>
  );
}
