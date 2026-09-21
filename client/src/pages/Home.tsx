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
import { PlatformMarquee, SectionIndex } from "@/components/PlatformMarquee";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { ArtistEditorialSections } from "@/components/ArtistEditorialSections";
import FanSignalInline from "@/components/FanSignalInline";
import { Reveal } from "@/components/Reveal";
import { HeroDots } from "@/components/HeroDots";
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
  currentRelease,
  officialBrand,
  releases,
  videos,
} from "@/content/artistPlatform";
import "@/components/OfficialBrand.css";
import "./Home.css";

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

const managedVideoImage = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return officialBrand.socialPreview;
  return /\/manus-storage\/[^/?#]*stage[^/?#]*/i.test(imageUrl)
    ? "/assets/akbar-night-frequency-stage-optimized.webp"
    : imageUrl;
};

export default function Home() {
  const [portraitSrc, setPortraitSrc] = useState(officialBrand.portrait);
  const releaseCatalogRef = useRef<HTMLDivElement>(null);

  const publicContent = usePublicArtistContent();
  const contentQuery = trpc.content.list.useQuery(undefined, {
    enabled: publicContent.isError,
  });

  const editablePlatformLinks = publicPlatformLinks(publicContent.data);
  const cmsEvents = publicUpcomingEvents(publicContent.data);
  const featuredEvent = cmsEvents.find((event) => event.isFeatured) || cmsEvents[0];
  const managedContent = contentQuery.data ?? [];
  const contentIsLoading = publicContent.isLoading || contentQuery.isLoading;

  const managedHero = managedContent.find((item) => item.kind === "hero");
  const managedRelease = managedContent.find((item) => item.kind === "release");
  const managedVideos = managedContent
    .filter((item) => item.kind === "video")
    .slice(0, 3);
  const rawManagedLive = managedContent.find((item) => item.kind === "live");
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
    cmsReleases.find((item) => item.isCurrent) || cmsReleases[0];

  const cmsCatalog = cmsReleases.map((item) => {
    const fallback = releases.find(
      (release) =>
        release.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );
    return {
      title: item.title,
      format: item.format || fallback?.format || "Release",
      year: item.year || fallback?.year || "—",
      platform: item.platform || fallback?.platform || "Official link",
      href: item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
    };
  });

  const displayReleases = [
    ...cmsCatalog,
    ...releases.filter(
      (legacy) =>
        !cmsCatalog.some(
          (current) =>
            current.title.trim().toLowerCase() ===
            legacy.title.trim().toLowerCase()
        )
    ),
  ];

  const activeReleaseStory = cmsCurrentRelease?.story ?? managedRelease?.subtitle;
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
  const heroKicker = cmsHero?.heroKicker || managedHero?.label || "AKBAR NAWASUNDA";
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
    ? managedVideos.map((item) => ({
        title: item.title,
        label: item.label || "VISUAL",
        href: item.href || "https://www.youtube.com/@akbarnawasunda",
        image: managedVideoImage(item.imageUrl),
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

  const displayHeroTitle = (heroTitle || "AKBAR NAWASUNDA.").trim();
  const heroTitleWords = displayHeroTitle.split(/\s+/);

  return (
    <>
      <div className="an-site">
        {/* Archive route remains intentionally centralized in NightHeader: href="/universe">ARCHIVE */}
        <NightHeader />

        <main id="top">
          <section className="an-hero">
            <HeroDots />
            <div className="home-hero-portrait">
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
            </div>
            <picture className="hero-mascot-doodle">
              <source srcSet="/assets/akbar-mascot-doodle.avif" type="image/avif" />
              <source srcSet="/assets/akbar-mascot-doodle.webp" type="image/webp" />
              <img
                src="/assets/akbar-mascot-doodle.webp"
                alt="Maskot doodle Akbar Nawasunda"
                width={1254}
                height={1254}
                loading="lazy"
                fetchPriority="low"
                decoding="async"
              />
            </picture>

            <div className="hero-copy">
              <p className="eyebrow">
                <span /> {heroKicker}
              </p>
              <h1
                className="hero-title-editorial"
                data-no-scramble="true"
                aria-label={displayHeroTitle}
              >
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
              <p className="hero-description">{heroBody}</p>
              <div className="hero-actions">
                <a
                  className="button-primary"
                  href={heroActionUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Play size={14} fill="currentColor" />
                  <span>{heroActionLabel}</span>
                </a>
                <Link className="button-quiet" href="/visuals">
                  LIHAT VISUAL <ArrowUpRight size={15} />
                </Link>
                <a className="hero-signal-link" href="#signal">
                  KABAR TERBARU <ArrowDownRight size={13} />
                </a>
              </div>
            </div>

            <a
              className="hero-scroll-cue"
              href="#platforms"
              aria-label="Scroll untuk menjelajah"
            >
              <span>SCROLL</span>
              <ArrowDownRight size={14} />
            </a>
          </section>

          <section
            className="home-signal-deck"
            id="platforms"
            aria-labelledby="signal-deck-title"
          >
            <SectionIndex number="" label="MUSIK" />
            <div className="home-signal-copy">
              <p className="eyebrow">
                <span /> MUSIK AKBAR
              </p>
              <h2 id="signal-deck-title">
                DENGAR
                <br />
                KARYANYA.
              </h2>
              <Link className="home-deck-cta" href="/music">
                LIHAT MUSIK <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="home-platform-rack">
              {editablePlatformLinks.map((platform) => (
                <a
                  className={`home-platform-card platform-${platform.label
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  key={platform.label}
                  href={platform.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Buka Akbar Nawasunda di ${platform.label}`}
                >
                  <span className="home-platform-icon-shell">
                    <PlatformIcon label={platform.label} />
                  </span>
                  <span className="home-platform-copy">
                    <strong>{platform.label}</strong>
                  </span>
                  <ArrowUpRight className="home-platform-arrow" size={14} />
                </a>
              ))}
            </div>
            <PlatformMarquee links={editablePlatformLinks} />
          </section>

          <Reveal>
          <section className="section section-current" id="music">
            <SectionIndex number="" label="RILIS TERBARU" />
            <div className="section-heading">
              <div>
                <h2>
                  RILIS
                  <br />
                  TERBARU.
                </h2>
              </div>
            </div>
            {contentIsLoading && (
              <p className="content-state">MEMUAT RILISAN…</p>
            )}
            <div className="feature-release">
              <div className="release-cover">
                <ResilientArtworkImage
                  src={activeRelease.image}
                  backupSrc={officialBrand.socialPreview}
                  alt={`Artwork ${activeRelease.title}`}
                />
              </div>
              <div className="release-detail">
                <p className="mono-label">
                  {cmsCurrentRelease
                    ? `${cmsCurrentRelease.format || cmsCurrentRelease.platform || "RELEASE"}${
                        cmsCurrentRelease.year ? ` · ${cmsCurrentRelease.year}` : ""
                      }`
                    : managedRelease?.label || currentRelease.eyebrow}
                </p>
                <h3>{activeRelease.title}</h3>
                <p>
                  {activeReleaseStory ||
                    "Buka rilisan ini di platform resminya."}
                </p>
                <div className="release-detail-actions">
                  <a
                    className="text-link"
                    href={activeRelease.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    BUKA RILISAN <ArrowUpRight size={14} />
                  </a>
                  <span>{activeRelease.type}</span>
                </div>
              </div>
            </div>
          </section>
          </Reveal>

          <ArtistEditorialSections journey={journey} showPhotoStory={false} />
          <ArtistEditorialSections photoStories={photoStories} showJourney={false} />

          <Reveal>
          <section className="section release-section">
            <SectionIndex number="" label="KATALOG" />
            <div className="section-inline">
              <div>
                <p className="eyebrow">KATALOG RILISAN</p>
                <h2>
                  SEMUA
                  <br />
                  RILISAN.
                </h2>
              </div>
              <a
                className="text-link"
                href={
                  editablePlatformLinks.find((link) => link.label === "Spotify")
                    ?.href ||
                  "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw"
                }
                target="_blank"
                rel="noreferrer"
              >
                SPOTIFY <PlatformIcon label="Spotify" /> <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="home-release-carousel">
              <div className="home-release-carousel-toolbar">
                <span>GESER UNTUK MENJELAJAH</span>
                <div className="home-release-carousel-controls" aria-label="Kontrol katalog rilisan">
                  <button type="button" aria-label="Rilisan sebelumnya" onClick={() => releaseCatalogRef.current?.scrollBy({ left: -360, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>
                    <ArrowLeft size={15} />
                  </button>
                  <button type="button" aria-label="Rilisan berikutnya" onClick={() => releaseCatalogRef.current?.scrollBy({ left: 360, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
              <div className="release-grid" ref={releaseCatalogRef} tabIndex={0} aria-busy={contentIsLoading} aria-label="Katalog rilisan Akbar Nawasunda">
                {contentIsLoading
                  ? [1, 2, 3, 4].map((index) => (
                      <div className="release-card skeleton" key={index} aria-hidden="true">
                        <div className="skeleton-icon" />
                        <span className="skeleton-text" />
                        <span className="skeleton-title" />
                      </div>
                    ))
                  : displayReleases.map((release) => (
                      <a
                        key={release.title}
                        className="release-card"
                        href={release.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {release.image && (
                          <div className="release-card-art">
                            <ResilientArtworkImage
                              src={release.image}
                              backupSrc={officialBrand.socialPreview}
                              alt={`Artwork ${release.title}`}
                            />
                          </div>
                        )}
                        <PlatformIcon label={release.platform} />
                        <p>
                          {release.format} · {release.year}
                        </p>
                        <h3>{release.title}</h3>
                        <span className="release-platform-line">
                          {release.platform} <ArrowUpRight size={13} />
                        </span>
                      </a>
                    ))}
              </div>
            </div>
          </section>
          </Reveal>

          <section className="section visual-section" id="visuals">
            <SectionIndex number="" label="VIDEO" />
            <div className="section-heading">
              <div>
                <p className="eyebrow">VISUAL</p>
                <h2>
                  VIDEO
                  <br />
                  & REMIX.
                </h2>
              </div>
            </div>
            <div className="video-grid">
              {activeVideos.map((video, index) => (
                <a
                  key={video.title}
                  className={`video-card video-${index + 1}`}
                  href={video.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ResilientArtworkImage
                    src={video.image}
                    backupSrc={officialBrand.socialPreview}
                    alt={`${video.title} — visual resmi`}
                  />
                  <div className="video-overlay" />
                  <div className="video-content">
                    <span>{video.label}</span>
                    <h3>{video.title}</h3>
                    <div className="round-play">
                      <Play size={15} fill="currentColor" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <Reveal>
          <section className="section live-section" id="live">
            <SectionIndex number="" label="PANGGUNG" />
            <div
              className="live-backdrop"
              style={{
                backgroundImage:
                  "url(/assets/akbar-night-frequency-hero-optimized.webp)",
              }}
            />
            <div className="live-copy">
              <p className="eyebrow">LIVE</p>
              <h2>
                JADWAL
                <br />
                PERTUNJUKAN.
              </h2>
              <p>
                {publicContent.data?.live?.message ||
                  managedLive?.subtitle ||
                  (featuredEvent
                    ? "Tanggal, venue, dan rute resmi pertunjukan."
                    : "Jadwal akan tampil setelah diumumkan secara resmi.")}
              </p>
              <a
                className="button-primary"
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
                    ? "TIKET SHOW"
                    : featuredEvent?.rsvpUrl
                      ? "RSVP SHOW"
                      : "BERI TAHU SAYA"}
                </span>
              </a>
            </div>
            <div className="live-status">
              <span>
                {featuredEvent
                  ? "SHOW BERIKUTNYA"
                  : managedLive?.label || "INFO JADWAL"}
              </span>
              <strong>
                {featuredEvent?.title ||
                  managedLive?.title || (
                    <>
                      BELUM ADA
                      <br />
                      TANGGAL
                    </>
                  )}
              </strong>
              <small>
                {featuredEvent
                  ? formatEventDate(featuredEvent.date)
                  : managedLive
                    ? "UPDATE RESMI"
                    : "AKAN DIUMUMKAN"}
              </small>
            </div>
            {cmsEvents.length ? (
              <div className="home-live-events" aria-label="Jadwal pertunjukan">
                {cmsEvents.slice(0, 3).map((event) => {
                  const eventHref = event.ticketUrl || event.rsvpUrl || "#signal";
                  const locationLabel =
                    [event.venue, event.city, event.country]
                      .filter(Boolean)
                      .join(", ") || "Detail venue menyusul";
                  return (
                    <article className="home-live-event" key={event._id}>
                      <span>{formatEventDate(event.date)}</span>
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
                        className="home-live-event-source"
                        href={eventHref}
                        target={eventHref.startsWith("http") ? "_blank" : undefined}
                        rel={
                          eventHref.startsWith("http") ? "noreferrer" : undefined
                        }
                        aria-label={`${event.title} — buka sumber resmi`}
                      >
                        {event.ticketUrl
                          ? "TIKET"
                          : event.rsvpUrl
                            ? "RSVP"
                            : "LIHAT JADWAL"}{" "}
                        <ArrowUpRight size={13} />
                      </a>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>
          </Reveal>

          {gameEnabled ? (
            <section
              className="section game-teaser-section"
              id="game"
              aria-labelledby="game-teaser-title"
            >
              <SectionIndex number="" label="GAME" />
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
                  <Sparkles size={13} />{" "}
                  {gameConfig?.kicker || "PLAYABLE SIGNAL"}
                </p>
                <h2 id="game-teaser-title">
                  ENTER THE
                  <br />
                  FREQUENCY.
                </h2>
                <p>
                  {gameConfig?.intro ||
                    "Run the signal, collect the notes, and chase the drop."}
                </p>
                <Link className="button-primary" href="/game/jedag-run">
                  MAIN JEDAG RUN <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>
          ) : null}

          <section className="signal-section" id="signal">
            <SectionIndex number="" label="NEWS" />
            <div>
              <p className="eyebrow">
                <Sparkles size={13} /> KABAR TERBARU
              </p>
              <h2>
                UPDATE
                <br />
                RILISAN.
              </h2>
              <p>Kabar rilisan, visual, dan jadwal dari kanal resmi.</p>
            </div>
            <FanSignalInline source="home" />
          </section>
        </main>

        <NightFooter />
      </div>
    </>
  );
}
