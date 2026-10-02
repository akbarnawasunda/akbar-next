import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  Play,
  Sparkles,
  Ticket,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { PlatformIcon } from "@/components/PlatformIcon";
import { PlatformMarquee } from "@/components/PlatformMarquee";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { MusicEmbed } from "@/components/MusicEmbed";
import { ArtistEditorialSections } from "@/components/ArtistEditorialSections";
import FanSignalSection from "@/components/FanSignalSection";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import { Reveal } from "@/components/Reveal";
import {
  CtaPanel,
  CurrentSignalBoard,
  EditorialSection,
  SignalIndicator,
  type SignalRow,
} from "@/components/editorial/EditorialKit";
import { NightHeader, NightFooter } from "@/components/NightFrequencyChrome";
import { trpc } from "@/lib/trpc";
import {
  publicJourney,
  publicPhotoStories,
  publicPlatformLinks,
  publicUpcomingEvents,
  usePublicArtistContent,
} from "@/content/publicContent";
import {
  artworkThumb,
  currentRelease,
  officialBrand,
  releases,
  videos,
  youtubeThumbnail,
} from "@/content/artistPlatform";
import { SignatureStage } from "@/components/signature/SignatureStage";
import "@/components/OfficialBrand.css";
import "./Home.css";
// Komposisi baru beranda (checkpoint A). Dimuat setelah Home.css: nama kelas
// `.an-*` di dalamnya tidak dipakai kulit lama, jadi tidak ada perang
// spesifisitas dan tidak ada `!important` baru.
import "./HomeStage.css";

const formatEventDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
        .format(parsed)
        .toUpperCase();
};

const youtubeIdFrom = (url: string | null | undefined) => {
  if (!url) return undefined;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/i
  );
  return match?.[1];
};

const managedVideoImage = (
  imageUrl: string | null | undefined,
  href?: string | null
) => {
  if (!imageUrl) {
    const id = youtubeIdFrom(href);
    return id ? youtubeThumbnail(id) : officialBrand.socialPreview;
  }
  return /\/manus-storage\/[^/?#]*stage[^/?#]*/i.test(imageUrl)
    ? "/assets/akbar-night-frequency-stage-optimized.webp"
    : imageUrl;
};

export default function Home() {
  const [portraitSrc, setPortraitSrc] = useState(officialBrand.portrait);
  const [playerOpen, setPlayerOpen] = useState(false);
  const releaseCatalogRef = useRef<HTMLDivElement>(null);

  const publicContent = usePublicArtistContent();
  const contentQuery = trpc.content.list.useQuery(undefined, {
    enabled: publicContent.isError,
  });

  const editablePlatformLinks = publicPlatformLinks(publicContent.data);
  const cmsEvents = publicUpcomingEvents(publicContent.data);
  const featuredEvent =
    cmsEvents.find(event => event.isFeatured) || cmsEvents[0];
  const managedContent = contentQuery.data ?? [];
  const contentIsLoading = publicContent.isLoading || contentQuery.isLoading;

  const managedHero = managedContent.find(item => item.kind === "hero");
  const managedRelease = managedContent.find(item => item.kind === "release");
  const managedVideos = managedContent
    .filter(item => item.kind === "video")
    .slice(0, 3);
  const rawManagedLive = managedContent.find(item => item.kind === "live");
  const managedLive =
    rawManagedLive && !/no date announced|tba/i.test(rawManagedLive.title)
      ? rawManagedLive
      : undefined;

  const normalizeManagedTitle = (value: string) =>
    value.toLowerCase() === "garam & madu × backpacker"
      ? "Garam & Madu × Backpacker"
      : value;

  const cmsReleases = publicContent.data?.releases ?? [];
  const cmsCurrentRelease =
    cmsReleases.find(item => item.isCurrent) || cmsReleases[0];

  const cmsCatalog = cmsReleases.map(item => {
    const fallback = releases.find(
      release =>
        release.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );
    return {
      title: item.title,
      format: item.format || fallback?.format || "Release",
      year: item.year || fallback?.year || "—",
      platform: item.platform || fallback?.platform || "Official link",
      href:
        item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
    };
  });

  const displayReleases = [
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

  const activeReleaseStory =
    cmsCurrentRelease?.story ?? managedRelease?.subtitle;
  const activeRelease = cmsCurrentRelease
    ? {
        ...currentRelease,
        title: cmsCurrentRelease.title,
        type:
          cmsCurrentRelease.platform ||
          cmsCurrentRelease.format ||
          currentRelease.type,
        href: cmsCurrentRelease.url || currentRelease.href,
        image: cmsCurrentRelease.artworkUrl || currentRelease.image,
      }
    : managedRelease
      ? {
          ...currentRelease,
          title: normalizeManagedTitle(managedRelease.title),
          type: managedRelease.label || currentRelease.type,
          href: managedRelease.href || currentRelease.href,
          image:
            managedRelease.imageUrl &&
            managedRelease.imageUrl !== officialBrand.socialPreview
              ? managedRelease.imageUrl
              : currentRelease.image,
        }
      : currentRelease;

  const cmsHero = publicContent.data?.hero;
  const cmsProfile = publicContent.data?.profile;
  const heroKicker =
    cmsHero?.heroKicker || managedHero?.label || "AKBAR NAWASUNDA";
  const suppliedHeroTitle = cmsHero?.heroTitle || managedHero?.title;
  const heroTitle = /make the night move/i.test(suppliedHeroTitle || "")
    ? undefined
    : suppliedHeroTitle;
  const heroBody =
    cmsHero?.heroBody ||
    managedHero?.subtitle ||
    "Produser musik, remixer, dan DJ dari Bandung Barat. Breakbeat, electronic bass, dan remix untuk rilisan serta kolaborasi.";
  const heroActionUrl =
    cmsHero?.primaryActionUrl || managedHero?.href || activeRelease.href;
  const heroActionIsVisual = /youtube\.com|youtu\.be/i.test(heroActionUrl);
  const heroActionLabel =
    cmsHero?.primaryActionLabel ||
    (heroActionIsVisual ? "TONTON VISUAL" : "DENGARKAN KARYA");

  const activeVideos = managedVideos.length
    ? managedVideos.map(item => ({
        title: item.title,
        label: item.label || "VISUAL",
        href: item.href || "https://www.youtube.com/@akbarnawasunda",
        image: managedVideoImage(item.imageUrl, item.href),
      }))
    : videos;

  const journey = publicJourney(publicContent.data);
  const photoStories = publicPhotoStories(publicContent.data);

  const gameConfig = publicContent.data?.game;
  const gameEnabled = gameConfig?.isEnabled !== false;

  const configuredPortrait =
    cmsHero?.heroImage || cmsProfile?.portraitImage || officialBrand.portrait;
  useEffect(() => {
    setPortraitSrc(configuredPortrait);
  }, [configuredPortrait]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contentIsLoading]);

  const heroDeckSpec =
    [
      cmsCurrentRelease?.format || activeRelease.type,
      cmsCurrentRelease?.year,
      cmsCurrentRelease?.platform,
    ]
      .filter(Boolean)
      .join(" · ")
      .toUpperCase() || currentRelease.eyebrow;

  const currentSignalRows: SignalRow[] = [
    {
      label: "RILISAN TERBARU",
      value: activeRelease.title,
      note: heroDeckSpec,
      href: `/music/${activeRelease.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      actionLabel: "DETAIL",
    },
    featuredEvent
      ? {
          label: "LIVE BERIKUTNYA",
          value: featuredEvent.title,
          note: [
            formatEventDate(featuredEvent.date),
            featuredEvent.venue,
            featuredEvent.city,
          ]
            .filter(Boolean)
            .join(" · "),
          href: "/live",
          actionLabel: "JADWAL",
        }
      : {
          label: "STATUS BOOKING",
          value: "TERBUKA UNTUK BOOKING & REMIX",
          note: "Belum ada jadwal publik yang dikonfirmasi. Slot studio masih tersedia.",
          href: "/inquire?type=booking&source=home",
          actionLabel: "AJUKAN",
        },
    {
      label: "STUDIO",
      value: "BANDUNG BARAT · BREAKBEAT / INDO BASS",
      note: "Remix custom, produksi, dan kolaborasi lewat jalur inquiry resmi.",
      href: "/inquire?type=remix&source=home",
      actionLabel: "KIRIM BRIEF",
    },
  ];

  const displayHeroTitle = (heroTitle || "AKBAR NAWASUNDA.").trim();
  const heroTitleWords = displayHeroTitle.split(/\s+/);

  return (
    <>
      <div className="an-site" data-page="home">
        {/* Rute arsip tetap dipusatkan di NightHeader: href="/universe" (label "ARSIP"). */}
        <NightHeader />

        <main id="top" tabIndex={-1}>
          {/* ADEGAN 1 — pembuka sinematik: satu foto resmi sebagai panggung,
              tipografi masuk dari kiri bawah di atas scrim gelap, dan rilisan
              terbaru hadir sebagai artefak yang bisa diklik. Semua isinya data
              nyata dari CMS/katalog. */}
          <section className="an-hero-scene" aria-labelledby="hero-title">
            <figure className="an-hero-plate">
              <picture className="home-hero-picture">
                <source
                  media="(max-width: 640px)"
                  srcSet="/assets/akbar-official-portrait-optimized.webp"
                  type="image/webp"
                />
                <source
                  srcSet="/assets/akbar-nawasunda-official-portrait-1000.webp"
                  type="image/webp"
                />
                <img
                  src={portraitSrc}
                  alt="Portrait resmi Akbar Nawasunda"
                  fetchPriority="high"
                  decoding="async"
                  width={800}
                  height={1000}
                  onError={() => {
                    if (portraitSrc !== officialBrand.portraitFallback) {
                      setPortraitSrc(officialBrand.portraitFallback);
                    }
                  }}
                />
              </picture>
              <img
                className="an-hero-mascot"
                src="/assets/akbar-mascot-doodle.webp"
                alt=""
                aria-hidden="true"
                width={168}
                height={168}
                loading="lazy"
                fetchPriority="low"
                decoding="async"
              />
              <figcaption className="an-hero-plate-note">
                <span>Portrait resmi</span>
                <span aria-hidden="true">·</span>
                <span>Bandung Barat</span>
              </figcaption>
            </figure>

            <div className="an-hero-inner">
              <p className="an-kicker">
                <span className="an-kicker-dot" aria-hidden="true" />
                {heroKicker}
              </p>
              <h1
                className="hero-title-editorial"
                id="hero-title"
                data-no-scramble="true"
                aria-label={displayHeroTitle}
              >
                <span className="sr-only">{displayHeroTitle}</span>
                <span aria-hidden="true">
                  {heroTitleWords.map((word, index) => (
                    <span
                      className="hero-title-mask"
                      key={`${word}-${index}`}
                      style={{ "--hero-word-index": index } as CSSProperties}
                    >
                      <span className="hero-title-word">{word}</span>
                      {index < heroTitleWords.length - 1 ? " " : null}
                    </span>
                  ))}
                </span>
              </h1>
              <p className="an-hero-lede">{heroBody}</p>

              <div className="an-hero-cta">
                <a
                  className="an-btn an-btn--solid"
                  href={heroActionUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-signal-magnetic
                  data-signal-interactive
                >
                  <Play size={13} fill="currentColor" />
                  <span>{heroActionLabel}</span>
                </a>
                <Link className="an-btn an-btn--quiet" href="/visuals" data-signal-magnetic>
                  Lihat visual <ArrowRight size={15} />
                </Link>
              </div>

              <a
                className="an-hero-artifact"
                href={activeRelease.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="an-hero-artifact-art">
                  {/* thumbnail 72px: minta turunan kecil, bukan master */}
                  <ResilientArtworkImage
                    src={artworkThumb(activeRelease.image)}
                    backupSrc={officialBrand.socialPreview}
                    alt={`Artwork ${activeRelease.title}`}
                  />
                </span>
                <span className="an-hero-artifact-copy">
                  <small>Rilis terbaru</small>
                  <strong>{activeRelease.title}</strong>
                  <em>{heroDeckSpec}</em>
                </span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>

              <dl className="an-hero-facts">
                <div>
                  <dt>Basis</dt>
                  <dd>Bandung Barat</dd>
                </div>
                <div>
                  <dt>Sejak</dt>
                  <dd>2020</dd>
                </div>
                <div>
                  <dt>Genre</dt>
                  <dd>Breakbeat / Indo Bass</dd>
                </div>
              </dl>
            </div>

            <a
              className="an-hero-scroll"
              href="#signal"
              aria-label="Lihat kabar terbaru dari studio"
            >
              <span aria-hidden="true">Gulir</span>
              <ArrowDownRight size={15} aria-hidden="true" />
            </a>
          </section>

          <SignatureStage alsoKnownAs="Juga dikenal sebagai DJ Akbar Remix dan akbarnawasunda.my.id." />

          <EditorialSection
            id="signal"
            title={
              <>
                YANG SEDANG
                <br />
                BERJALAN.
              </>
            }
            lede="Status terbaru dari studio: rilisan yang sedang diputar, jadwal live terdekat, dan jalur kontak resmi."
            aside={<SignalIndicator label="LIVE DARI STUDIO" />}
          >
            <CurrentSignalBoard rows={currentSignalRows} />
          </EditorialSection>

          {/* ADEGAN 3 — kanal resmi sebagai daftar tipografis, bukan deretan
              kartu identik. Marquee di bawahnya tetap dipakai sebagai ritme. */}
          <section
            className="an-channels"
            id="platforms"
            aria-labelledby="channels-title"
          >
            <header className="an-channels-head">
              <h2 id="channels-title">Dengar di kanal resminya.</h2>
              <p className="an-meta">
                {editablePlatformLinks.length} kanal resmi · rilisan, remix,
                dan set
              </p>
            </header>

            <ul className="an-channels-list">
              {editablePlatformLinks.map((platform, index) => (
                <li key={platform.label}>
                  <a
                    className={`an-channel platform-${platform.label
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    href={platform.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Buka Akbar Nawasunda di ${platform.label}`}
                  >
                    <span className="an-channel-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="an-channel-mark" aria-hidden="true">
                      <PlatformIcon label={platform.label} />
                    </span>
                    <span className="an-channel-name">{platform.label}</span>
                    <ArrowUpRight
                      className="an-channel-arrow"
                      size={16}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>

            <div className="an-channels-foot">
              <PlatformMarquee links={editablePlatformLinks} />
              <Link className="an-btn an-btn--quiet" href="/music">
                Buka katalog musik <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          {/* ADEGAN 4 — rilisan terbaru sebagai satu dokumen utuh: artwork
              besar, metadata mono, dan pemutar resmi di tempat yang sama. */}
          <Reveal>
            <section
              className="an-feature"
              id="music"
              aria-labelledby="feature-title"
            >
              <figure className="an-feature-art an-rise">
                <ResilientArtworkImage
                  src={activeRelease.image}
                  backupSrc={officialBrand.socialPreview}
                  alt={`Artwork ${activeRelease.title}`}
                />
                <figcaption>
                  {cmsCurrentRelease
                    ? [cmsCurrentRelease.format || cmsCurrentRelease.platform, cmsCurrentRelease.year]
                        .filter(Boolean)
                        .join(" · ")
                    : managedRelease?.label || currentRelease.eyebrow}
                </figcaption>
              </figure>

              <div className="an-feature-copy an-rise">
                <p className="an-meta">Rilisan terbaru</p>
                <h2 id="feature-title">{activeRelease.title}</h2>
                <p className="an-feature-story">
                  {activeReleaseStory ||
                    "Putar langsung di sini, atau buka versi lengkapnya di platform resmi."}
                </p>
                <div className="an-feature-actions">
                  <button
                    type="button"
                    className="an-btn an-btn--solid"
                    aria-expanded={playerOpen}
                    onClick={() => setPlayerOpen(open => !open)}
                  >
                    {playerOpen ? (
                      "Tutup player"
                    ) : (
                      <>
                        <Play size={13} fill="currentColor" /> Putar di sini
                      </>
                    )}
                  </button>
                  <a
                    className="an-btn an-btn--quiet"
                    href={activeRelease.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka rilisan <ArrowUpRight size={14} />
                  </a>
                  <span className="an-feature-type">{activeRelease.type}</span>
                </div>
                {playerOpen ? (
                  <div className="an-feature-player">
                    <MusicEmbed
                      url={activeRelease.href}
                      title={activeRelease.title}
                    />
                  </div>
                ) : null}
                {contentIsLoading && (
                  <p className="an-meta">Memuat rilisan…</p>
                )}
              </div>
            </section>
          </Reveal>

          <ArtistEditorialSections journey={journey} showPhotoStory={false} />
          <ArtistEditorialSections
            photoStories={photoStories}
            showJourney={false}
          />

          {/* ADEGAN 5 — katalog sebagai rail horizontal: lebar & tinggi
              artwork bergantian supaya ritmenya tidak seperti grid toko. */}
          <Reveal>
            <section className="an-catalog" aria-labelledby="catalog-title">
              <header className="an-catalog-head">
                <div>
                  <p className="an-meta">
                    {displayReleases.length} rilisan · 2024—2025
                  </p>
                  <h2 id="catalog-title">Katalog lengkap.</h2>
                </div>
                <div className="an-catalog-tools">
                  <a
                    className="an-btn an-btn--quiet"
                    href={
                      editablePlatformLinks.find(
                        link => link.label === "Spotify"
                      )?.href ||
                      "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw"
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Spotify <PlatformIcon label="Spotify" />{" "}
                    <ArrowUpRight size={14} />
                  </a>
                  <div
                    className="an-catalog-controls"
                    aria-label="Kontrol katalog rilisan"
                  >
                    <button
                      type="button"
                      aria-label="Rilisan sebelumnya"
                      onClick={() =>
                        releaseCatalogRef.current?.scrollBy({
                          left: -360,
                          behavior: window.matchMedia(
                            "(prefers-reduced-motion: reduce)"
                          ).matches
                            ? "auto"
                            : "smooth",
                        })
                      }
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label="Rilisan berikutnya"
                      onClick={() =>
                        releaseCatalogRef.current?.scrollBy({
                          left: 360,
                          behavior: window.matchMedia(
                            "(prefers-reduced-motion: reduce)"
                          ).matches
                            ? "auto"
                            : "smooth",
                        })
                      }
                    >
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </header>

              <div
                className="an-catalog-rail"
                ref={releaseCatalogRef}
                tabIndex={0}
                aria-busy={contentIsLoading}
                aria-label="Katalog rilisan Akbar Nawasunda"
              >
                {contentIsLoading
                  ? [1, 2, 3, 4].map(index => (
                      <div
                        className="an-release is-skeleton"
                        key={index}
                        aria-hidden="true"
                      >
                        <span className="an-release-art skeleton-icon" />
                        <span className="an-release-meta">
                          <span className="skeleton-text" />
                          <span className="skeleton-title" />
                        </span>
                      </div>
                    ))
                  : displayReleases.map(release => (
                      <a
                        key={release.title}
                        className="an-release"
                        href={release.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {release.image && (
                          <span className="an-release-art">
                            <ResilientArtworkImage
                              src={artworkThumb(release.image)}
                              backupSrc={release.image}
                              alt={`Artwork ${release.title}`}
                            />
                          </span>
                        )}
                        <span className="an-release-meta">
                          <small>
                            {release.format} · {release.year}
                          </small>
                          <strong>{release.title}</strong>
                          <em>
                            {release.platform}{" "}
                            <ArrowUpRight size={12} aria-hidden="true" />
                          </em>
                        </span>
                      </a>
                    ))}
              </div>
            </section>
          </Reveal>

          {/* ADEGAN 6 — ruang tayang: satu film besar sebagai anchor, dua
              lainya lebih kecil di sampingnya. Bukan grid thumbnail seragam. */}
          <section
            className="an-screening"
            id="visuals"
            aria-labelledby="screening-title"
          >
            <header className="an-screening-head">
              <h2 id="screening-title">Visual &amp; remix.</h2>
              <p className="an-meta">
                {activeVideos.length} video resmi · kanal YouTube
              </p>
            </header>
            <div className="an-screening-grid">
              {activeVideos.map((video, index) => (
                <a
                  key={video.title}
                  className={`an-frame${index === 0 ? " an-frame--lead" : ""}`}
                  href={video.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="an-frame-art">
                    <ResilientArtworkImage
                      src={video.image}
                      backupSrc={officialBrand.socialPreview}
                      alt={`${video.title} — visual resmi`}
                    />
                  </span>
                  <span className="an-frame-scrim" aria-hidden="true" />
                  <span className="an-frame-copy">
                    <small>{video.label}</small>
                    <strong>{video.title}</strong>
                  </span>
                  <span className="an-frame-play" aria-hidden="true">
                    <Play size={15} fill="currentColor" />
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* ADEGAN 7 — panggung: satu foto pertunjukan sebagai latar penuh,
              tanggal besar di atasnya, dan daftar jadwal sebagai indeks. */}
          <Reveal>
            <section className="an-stage" id="live" aria-labelledby="stage-title">
              <img
                className="an-stage-bg"
                src="/assets/akbar-night-frequency-hero-mobile-optimized.webp"
                alt=""
                aria-hidden="true"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
              />
              <div className="an-stage-scrim" aria-hidden="true" />
              <div className="an-stage-copy">
                <p className="an-meta">Live</p>
                <h2 id="stage-title">Jadwal panggung.</h2>
                <p className="an-stage-lede">
                  {publicContent.data?.live?.message ||
                    managedLive?.subtitle ||
                    (featuredEvent
                      ? "Tanggal, venue, dan rute resmi pertunjukan."
                      : "Jadwal akan tampil setelah diumumkan secara resmi.")}
                </p>
                <a
                  className="an-btn an-btn--solid"
                  href={
                    featuredEvent?.ticketUrl ||
                    featuredEvent?.rsvpUrl ||
                    managedLive?.href ||
                    "#signal"
                  }
                  target={
                    featuredEvent?.ticketUrl ||
                    featuredEvent?.rsvpUrl ||
                    managedLive?.href
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    featuredEvent?.ticketUrl ||
                    featuredEvent?.rsvpUrl ||
                    managedLive?.href
                      ? "noreferrer"
                      : undefined
                  }
                >
                  <Ticket size={14} />
                  <span>
                    {featuredEvent?.ticketUrl
                      ? "Tiket show"
                      : featuredEvent?.rsvpUrl
                        ? "RSVP show"
                        : "Beri tahu saya"}
                  </span>
                </a>
              </div>

              <div className="an-stage-board">
                <span className="an-meta">
                  {featuredEvent
                    ? "Show berikutnya"
                    : managedLive?.label || "Info jadwal"}
                </span>
                <strong className="an-stage-board-title">
                  {featuredEvent?.title ||
                    managedLive?.title || (
                      <>
                        Belum ada
                        <br />
                        tanggal
                      </>
                    )}
                </strong>
                <small className="an-stage-board-when">
                  {featuredEvent
                    ? formatEventDate(featuredEvent.date)
                    : managedLive
                      ? "Update resmi"
                      : "Akan diumumkan"}
                </small>
              </div>

              {cmsEvents.length ? (
                <ol className="an-stage-index" aria-label="Jadwal pertunjukan">
                  {cmsEvents.slice(0, 3).map(event => {
                    const eventHref =
                      event.ticketUrl || event.rsvpUrl || "#signal";
                    const locationLabel =
                      [event.venue, event.city, event.country]
                        .filter(Boolean)
                        .join(", ") || "Detail venue menyusul";
                    return (
                      <li key={event._id}>
                        <span className="an-stage-date">
                          {formatEventDate(event.date)}
                        </span>
                        <strong>{event.title}</strong>
                        <small>
                          {event.mapsUrl ? (
                            <a
                              className="an-event-location-link"
                              href={event.mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {locationLabel} <ArrowUpRight size={12} />
                            </a>
                          ) : (
                            locationLabel
                          )}
                        </small>
                        <a
                          className="an-stage-source"
                          href={eventHref}
                          target={
                            eventHref.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            eventHref.startsWith("http")
                              ? "noreferrer"
                              : undefined
                          }
                          aria-label={`${event.title} — buka sumber resmi`}
                        >
                          {event.ticketUrl
                            ? "Tiket"
                            : event.rsvpUrl
                              ? "RSVP"
                              : "Lihat jadwal"}{" "}
                          <ArrowUpRight size={13} />
                        </a>
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </section>
          </Reveal>

          {gameEnabled ? (
            <section
              className="section game-teaser-section"
              id="game"
              aria-labelledby="game-teaser-title"
            >
              <div className="game-teaser-art" aria-hidden="true">
                <div className="game-teaser-scanline" />
                <span className="game-teaser-sun" />
                <span className="game-teaser-mountain game-teaser-mountain-a" />
                <span className="game-teaser-mountain game-teaser-mountain-b" />
                <span className="game-teaser-runner">AN</span>
                <span className="game-teaser-note game-teaser-note-a" />
                <span className="game-teaser-note game-teaser-note-b" />
                <span className="game-teaser-gate" />
                <span className="game-teaser-signal-line" />
              </div>
              <div className="game-teaser-copy">
                <p className="eyebrow">
                  <Sparkles size={13} /> {gameConfig?.kicker || "GAME MINI"}
                </p>
                <h2 id="game-teaser-title">
                  MAIN
                  <br />
                  JEDAG RUN.
                </h2>
                <p>
                  {gameConfig?.intro ||
                    "Lari ikut ketukan, kumpulkan not, dan kejar drop-nya. Skor tertinggi masuk papan peringkat."}
                </p>
                <Link className="button-primary" href="/game/jedag-run">
                  MAIN JEDAG RUN <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          ) : null}

          <CtaPanel
            id="booking"
            title={
              <>
                BAWA SUARA INI
                <br />
                KE PANGGUNGMU.
              </>
            }
            copy="Performance, remix custom, lisensi musik, atau kolaborasi rilisan — kirim konteks proyek dan tanggalnya, balasan datang dari studio langsung."
            actions={
              <>
                <Link className="ed-button" href="/inquire?source=home">
                  AJUKAN BOOKING <ArrowUpRight size={14} />
                </Link>
                <Link className="ed-button--ghost" href="/epk">
                  LIHAT EPK <ArrowRight size={14} />
                </Link>
              </>
            }
          />

          <FanSignalSection
            source={FAN_SIGNAL_SOURCES.home}
            anchorId="fan-signal"
            title={
              <>
                JANGAN
                <br />
                KETINGGALAN.
              </>
            }
            description="Rilisan baru, video, dan jadwal manggung — dikirim langsung ke email kamu, tanpa spam."
          />
        </main>

        <NightFooter />
      </div>
    </>
  );
}
