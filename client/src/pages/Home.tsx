import {
  ArrowDownRight,
  ArrowUpRight,
  Disc3,
  Gamepad2,
  Headphones,
  Play,
  Radio,
  Sparkles,
  Ticket,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "wouter";
import { toast } from "sonner";
import { PlatformIcon } from "@/components/PlatformIcon";
import { BrandMotionMark } from "@/components/BrandMotionMark";
import FanSignalInline from "@/components/FanSignalInline";
import { PlatformMarquee, SectionIndex } from "@/components/PlatformMarquee";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { ArtistEditorialSections } from "@/components/ArtistEditorialSections";
import { publicJourney, publicPhotoStories } from "@/content/publicContent";
import { SkeletonCard } from "@/components/SkeletonCard";
import { TiltCard } from "@/components/TiltCard";
import {
  currentRelease,
  formatPublicIndex,
  officialBrand,
  releases,
  videos,
} from "@/content/artistPlatform";
import { trpc } from "@/lib/trpc";
import { useMagnetic } from "@/hooks/useMagnetic";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useScrollChoreography } from "@/hooks/useScrollChoreography";
import { publicPlatformLinks, publicUpcomingEvents, usePublicArtistContent } from "@/content/publicContent";
import "@/components/OfficialBrand.css";
import "./Home.css";
import "./HomeStates.css";
import "./HomeRefinement.css";
import "./HomeArtistUpgrade.css";
import "./PlatformMediaUpgrade.css";
import "./HomePortraitRefinement.css";
import "./HomePlatformCards.css";
import "./HomeLayoutRefinement.css";
import "./HomeMotionRefinement.css";
import "./HomePortfolioPatterns.css";
import "./HomeGameTeaser.css";
import "./HomeArtDirection.css";
import "./HomeVisibleUi.css";
import "./HomeChapterInteraction.css";

function HomeMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const getFocusable = () => Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    const focusFrame = window.requestAnimationFrame(() => getFocusable()[0]?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus && document.contains(previousFocus)) {
        window.requestAnimationFrame(() => previousFocus.focus());
      }
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={dialogRef}
      id="an-mobile-navigation"
      className="an-mobile-navigation is-open"
      role="dialog"
      aria-modal="true"
      aria-label="Navigasi utama"
    >
      <Link href="/music" onClick={onClose}>MUSIC</Link>
      <Link href="/visuals" onClick={onClose}>VISUALS</Link>
      <Link href="/live" onClick={onClose}>LIVE</Link>
      <Link href="/universe" onClick={onClose}>ARCHIVE</Link>
      <Link href="/about" onClick={onClose}>ABOUT</Link>
      <a className="mobile-signal" href="#signal" onClick={onClose}>KABAR TERBARU</a>
    </div>,
    document.body,
  );
}

export default function Home() {
  usePerformanceMonitor();
  const currentSectionRef = useScrollReveal<HTMLElement>();
  const releaseSectionRef = useScrollReveal<HTMLElement>();
  const visualSectionRef = useScrollReveal<HTMLElement>();
  const platformSectionRef = useScrollReveal<HTMLElement>();
  const liveSectionRef = useScrollReveal<HTMLElement>();
  const signalSectionRef = useScrollReveal<HTMLElement>();
  const gameSectionRef = useScrollReveal<HTMLElement>();
  const choreographyRef = useScrollChoreography<HTMLDivElement>();
  const primaryActionRef = useMagnetic<HTMLAnchorElement>();
  const liveActionRef = useMagnetic<HTMLAnchorElement>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [portraitSrc, setPortraitSrc] = useState(officialBrand.portrait);
  const publicContent = usePublicArtistContent();
  const contentQuery = trpc.content.list.useQuery(undefined, {
    enabled: publicContent.isError,
  });
  const editablePlatformLinks = publicPlatformLinks(publicContent.data);
  const cmsEvents = publicUpcomingEvents(publicContent.data);
  const featuredEvent = cmsEvents.find(event => event.isFeatured) || cmsEvents[0];
  const managedContent = contentQuery.data ?? [];
  const contentIsLoading = publicContent.isLoading || contentQuery.isLoading;
  const contentHasError = publicContent.isError && contentQuery.isError;
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
  const formatHomeEventDate = (date: string) => {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(parsed).toUpperCase();
  };
  const managedVideoImage = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return officialBrand.socialPreview;
    return /\/manus-storage\/[^/?#]*stage[^/?#]*/i.test(imageUrl)
      ? "/assets/akbar-night-frequency-stage-optimized.webp"
      : imageUrl;
  };
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
      href: item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
    };
  });
  const displayReleases = [
    ...cmsCatalog,
    ...releases.filter(
      legacy =>
        !cmsCatalog.some(
          current =>
            current.title.trim().toLowerCase() === legacy.title.trim().toLowerCase()
        )
    ),
  ];
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
  const journey = publicJourney(publicContent.data);
  const photoStories = publicPhotoStories(publicContent.data);
  const gameConfig = publicContent.data?.game;
  const gameEnabled = gameConfig?.isEnabled !== false;
  const configuredPortrait = cmsHero?.heroImage || cmsProfile?.portraitImage || officialBrand.portrait;
  useEffect(() => {
    setPortraitSrc(configuredPortrait);
  }, [configuredPortrait]);
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    if (mobileNavOpen) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    }
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [mobileNavOpen]);
  useEffect(() => {
    if (!mobileNavOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contentIsLoading]);
  const hasCmsHero = Boolean(
    cmsHero?.heroTitle || cmsHero?.heroBody || cmsHero?.primaryActionUrl
  );
  const heroKicker =
    cmsHero?.heroKicker || managedHero?.label || "AKBAR NAWASUNDA";
  const suppliedHeroTitle = cmsHero?.heroTitle || managedHero?.title;
  const heroTitle = /make the night move/i.test(suppliedHeroTitle || "")
    ? undefined
    : suppliedHeroTitle;
  const heroBody =
    cmsHero?.heroBody ||
    managedHero?.subtitle ||
    "Produser, remixer, dan DJ asal Bandung Barat.";
  const heroActionUrl =
    cmsHero?.primaryActionUrl || managedHero?.href || activeRelease.href;
  const heroActionIsVisual = /youtube\.com|youtu\.be/i.test(heroActionUrl);
  const heroActionLabel =
    cmsHero?.primaryActionLabel ||
    (heroActionIsVisual ? "TONTON VISUAL" : "DENGAR SEKARANG");
  const activeVideos = managedVideos.length
    ? managedVideos.map(item => ({
        title: item.title,
        label: item.label || "VISUAL",
        href: item.href || "https://www.youtube.com/@akbarnawasunda",
        image: managedVideoImage(item.imageUrl),
      }))
    : videos;
  const displayHeroTitle = (heroTitle || "AKBAR NAWASUNDA.").trim();
  const heroTitleWords = displayHeroTitle.split(/\s+/);
  return (
    <>
      <div ref={choreographyRef} className="an-site">
      <header className="an-nav">
        <a
          className="an-wordmark"
          href="#top"
          aria-label="Akbar Nawasunda home"
        >
          <ResilientBrandImage className="an-brand-logo" alt="" />
          <span>AKBAR NAWASUNDA</span>
        </a>
        <nav aria-label="Navigasi utama">
          <Link href="/music">MUSIC</Link>
          <Link href="/visuals">VISUALS</Link>
          <Link href="/live">LIVE</Link>
          <Link href="/universe">ARCHIVE</Link>
          <Link href="/about">ABOUT</Link>
        </nav>
        <a className="nav-signal" href="#signal">
          <Radio size={14} /> KABAR TERBARU
        </a>
        <button
          className="an-menu-toggle"
          type="button"
          aria-label={mobileNavOpen ? "Tutup navigasi" : "Buka navigasi"}
          aria-expanded={mobileNavOpen}
          aria-controls="an-mobile-navigation"
          onClick={() => setMobileNavOpen(open => !open)}
        >
          {mobileNavOpen ? "CLOSE" : "MENU"}
        </button>
      </header>

      <main id="top">
        <div className="an-scroll-scene an-scroll-scene-hero" data-scroll-scene="hero" data-scroll-pin="true">
          <section className="an-hero">
          <div className="home-hero-portrait">
            <img
              src={portraitSrc}
              alt="Portrait resmi Akbar Nawasunda"
              fetchPriority="high"
              onError={() => {
                if (portraitSrc !== officialBrand.portraitFallback) {
                  setPortraitSrc(officialBrand.portraitFallback);
                }
              }}
              decoding="async"
              width={800}
              height={1000}
            />
          </div>
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
                ref={primaryActionRef}
                className="button-primary"
                href={heroActionUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={15} fill="currentColor" />
                <span className="signal-label" aria-hidden="true">
                  <span>{heroActionLabel}</span>
                  <span>{heroActionLabel}</span>
                </span>
                <span className="sr-only">{heroActionLabel}</span>
              </a>
              <Link className="button-quiet" href="/visuals">
                LIHAT VISUALS <ArrowUpRight size={16} />
              </Link>
              <a className="hero-signal-link" href="#signal">
                KABAR TERBARU <ArrowDownRight size={14} />
              </a>
            </div>
          </div>
          <div className="home-hero-atmosphere" aria-hidden="true">
            <span className="home-hero-atmosphere-cloud home-hero-atmosphere-cloud-a" />
            <span className="home-hero-atmosphere-cloud home-hero-atmosphere-cloud-b" />
            <span className="home-hero-atmosphere-cloud home-hero-atmosphere-cloud-c" />
          </div>
            <BrandMotionMark src={officialBrand.rmxMark} />
            <a className="hero-scroll-cue" href="#platforms" aria-label="Scroll untuk menjelajah">
              <span>SCROLL TO EXPLORE</span>
              <ArrowDownRight size={15} />
            </a>
          </section>
        </div>

        <div className="an-scroll-scene an-scroll-scene-platforms" data-scroll-scene="platforms" data-scroll-pin="true">
        <section
          ref={platformSectionRef}
          className="home-signal-deck reveal-target"
          id="platforms"
          aria-labelledby="signal-deck-title"
        >
          <SectionIndex number="01" label="LINKS MUSIK" />
          <div className="home-signal-copy">
            <p className="eyebrow">
              <span /> MUSIK ONLINE
            </p>
            <h2 id="signal-deck-title">
              DENGAR
              <br />
              DI MANA SAJA.
            </h2>
            <Link className="home-deck-cta" href="/music">
              LIHAT MUSIK <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="home-platform-rack">
            {editablePlatformLinks.map((platform, index) => (
              <a
                className={`home-platform-card platform-${platform.label.toLowerCase().replace(/\s+/g, "-")}`}
                key={platform.label}
                href={platform.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Buka Akbar Nawasunda di ${platform.label}`}
              >
                <span className="home-platform-number">{formatPublicIndex(index)}</span>
                <span className="home-platform-icon-shell">
                  <PlatformIcon label={platform.label} />
                </span>
                <span className="home-platform-copy">
                  <strong>{platform.label}</strong>
                </span>
                <ArrowUpRight className="home-platform-arrow" size={15} />
              </a>
            ))}
          </div>
          <PlatformMarquee links={editablePlatformLinks} />
        </section>
        </div>

        <div className="an-scroll-scene an-scroll-scene-current" data-scroll-scene="current-release">
        <section
          ref={currentSectionRef}
          className="section section-current reveal-target"
          id="music"
        >
          <SectionIndex number="02" label="RILISAN UTAMA" />
          <div className="section-heading">
            <p className="eyebrow">RILISAN TERBARU</p>
            <h2>
              SEDANG
              <br />
              DIDENGARKAN.
            </h2>
          </div>
          {contentIsLoading ? (
            <p className="content-state">MEMUAT RILISAN…</p>
          ) : contentHasError ? (
            <p className="content-state content-state-warn">
              MENAMPILKAN ARSIP RILISAN.
            </p>
          ) : null}
          <div className="feature-release">
            <div className="release-cover">
              <ResilientArtworkImage
                src={activeRelease.image}
                backupSrc={officialBrand.socialPreview}
                alt="Abstract visual for current release"
              />
              <span className="cover-orbit" />
            </div>
            <div className="release-detail">
              <p className="mono-label">
                {cmsCurrentRelease
                  ? `${cmsCurrentRelease.format || cmsCurrentRelease.platform || "RELEASE"}${cmsCurrentRelease.year ? ` · ${cmsCurrentRelease.year}` : ""}`
                  : managedRelease?.label || currentRelease.eyebrow}
              </p>
              <h3>{activeRelease.title}</h3>
              <p>
                {cmsCurrentRelease?.story ||
                  managedRelease?.subtitle ||
                  "Buka rilisan ini di platform resminya."}
              </p>
              <div className="release-detail-actions">
                <a
                  className="text-link"
                  href={activeRelease.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  BUKA RILISAN <ArrowUpRight size={16} />
                </a>
                <span>{activeRelease.type}</span>
              </div>
            </div>
          </div>
        </section>
        </div>

        <div className="an-scroll-scene an-scroll-scene-journey" data-scroll-scene="journey">
          <ArtistEditorialSections journey={journey} showPhotoStory={false} />
        </div>

        <div className="an-scroll-scene an-scroll-scene-photo-story" data-scroll-scene="photo-story">
          <ArtistEditorialSections photoStories={photoStories} showJourney={false} />
        </div>

        <div className="an-scroll-scene an-scroll-scene-catalog" data-scroll-scene="catalog" data-scroll-pin="true">
        <section
          ref={releaseSectionRef}
          className="section release-section reveal-target"
        >
          <SectionIndex number="05" label="KATALOG" />
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
              href={editablePlatformLinks.find(link => link.label === "Spotify")?.href || "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw"}
              target="_blank"
              rel="noreferrer"
            >
              SPOTIFY <PlatformIcon label="Spotify" />{" "}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="release-grid" data-scroll-horizontal-track="true" aria-busy={contentIsLoading}>
            {contentIsLoading
              ? [1, 2, 3, 4].map(index => <SkeletonCard key={index} />)
              : displayReleases.map((release, index) => (
                  <TiltCard
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
                    <span className="release-number">{formatPublicIndex(index)}</span>
                    <PlatformIcon label={release.platform} />
                    <p>
                      {release.format} · {release.year}
                    </p>
                    <h3>{release.title}</h3>
                    <span className="release-platform-line">
                      {release.platform} <ArrowUpRight size={14} />
                    </span>
                  </TiltCard>
                ))}
          </div>
        </section>
        </div>

        <div className="an-scroll-scene an-scroll-scene-visuals" data-scroll-scene="visuals">
        <section
          ref={visualSectionRef}
          className="section visual-section reveal-target"
          id="visuals"
        >
          <SectionIndex number="06" label="KARYA VIDEO" />
          <div className="section-heading">
            <p className="eyebrow">VISUAL</p>
            <h2>
              VIDEO
              <br />
              RESMI.
            </h2>
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
                  alt={`${video.title} — official visual artwork`}
                />
                <div className="video-overlay" />
                <div className="video-content">
                  <span>{video.label}</span>
                  <h3>{video.title}</h3>
                  <div className="round-play">
                    <Play size={17} fill="currentColor" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
        </div>

        <div className="an-scroll-scene an-scroll-scene-live" data-scroll-scene="live">
        <section
          ref={liveSectionRef}
          className="section live-section reveal-target"
          id="live"
        >
          <SectionIndex number="07" label="LIVE" />
          <div
            className="live-backdrop"
            style={{
              backgroundImage: "url(/assets/akbar-night-frequency-hero-optimized.webp)",
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
                (featuredEvent ? "Tanggal, venue, dan rute resmi pertunjukan." : "Jadwal akan tampil setelah diumumkan secara resmi.")}
            </p>
            <a
              ref={liveActionRef}
              className="button-primary"
              href={featuredEvent?.ticketUrl || featuredEvent?.rsvpUrl || managedLive?.href || "#signal"}
              target={featuredEvent?.ticketUrl || featuredEvent?.rsvpUrl || managedLive?.href ? "_blank" : undefined}
              rel={featuredEvent?.ticketUrl || featuredEvent?.rsvpUrl || managedLive?.href ? "noreferrer" : undefined}
            >
              <Ticket size={16} />
              <span>{featuredEvent?.ticketUrl ? "TIKET SHOW" : featuredEvent?.rsvpUrl ? "RSVP SHOW" : "BERI TAHU SAYA"}</span>
            </a>
          </div>
          <div className="live-status">
            <span>{featuredEvent ? "SHOW BERIKUTNYA" : managedLive?.label || "INFO JADWAL"}</span>
            <strong>
              {featuredEvent?.title || managedLive?.title || (
                <>
                  BELUM ADA
                  <br />
                  TANGGAL
                </>
              )}
            </strong>
            <small>{featuredEvent ? formatHomeEventDate(featuredEvent.date) : managedLive ? "UPDATE RESMI" : "AKAN DIUMUMKAN"}</small>
          </div>
          {cmsEvents.length ? <div className="home-live-events" aria-label="Jadwal pertunjukan">
            {cmsEvents.slice(0, 3).map(event => {
              const eventHref = event.ticketUrl || event.rsvpUrl || "#signal";
              const locationLabel = [event.venue, event.city, event.country].filter(Boolean).join(", ") || "Detail venue menyusul";
              return <article className="home-live-event" key={event._id}>
                <span>{formatHomeEventDate(event.date)}</span>
                <strong>{event.title}</strong>
                <small>{event.mapsUrl ? <a className="an-event-location-link" href={event.mapsUrl} target="_blank" rel="noreferrer">{locationLabel} <ArrowUpRight size={12} /></a> : locationLabel}</small>
                <a className="home-live-event-source" href={eventHref} target={eventHref.startsWith("http") ? "_blank" : undefined} rel={eventHref.startsWith("http") ? "noreferrer" : undefined} aria-label={`${event.title} — buka sumber resmi`}>
                  {event.ticketUrl ? "TIKET" : event.rsvpUrl ? "RSVP" : "LIHAT JADWAL"} <ArrowUpRight size={14} />
                </a>
              </article>;
            })}
          </div> : null}
        </section>
        </div>

        {gameEnabled ? (
        <div className="an-scroll-scene an-scroll-scene-game" data-scroll-scene="game">
          <section
            ref={gameSectionRef}
            className="section game-teaser-section reveal-target"
            id="game"
            aria-labelledby="game-teaser-title"
          >
            <SectionIndex number="08" label="PLAYABLE SIGNAL" />
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
              <span className="game-teaser-score">DROP  /  01</span>
            </div>
            <div className="game-teaser-copy">
              <p className="eyebrow"><Gamepad2 size={14} /> {gameConfig?.kicker || "PLAYABLE SIGNAL"}</p>
              <h2 id="game-teaser-title">ENTER THE<br />FREQUENCY.</h2>
              <p>{gameConfig?.intro || "Run the signal, collect the notes, and chase the drop."}</p>
              <Link className="button-primary" href="/game/jedag-run">
                MAIN JEDAG RUN <ArrowUpRight size={15} />
              </Link>
            </div>
          </section>
        </div>
        ) : null}

        <div className="an-scroll-scene an-scroll-scene-signal" data-scroll-scene="signal">
        <section
          ref={signalSectionRef}
          className="signal-section reveal-target"
          id="signal"
        >
          <SectionIndex number="09" label="NEWS" />
          <div>
            <p className="eyebrow">
              <Sparkles size={14} /> KABAR TERBARU
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
        </div>
      </main>

      <footer className="an-footer">
        <div className="footer-brand">
          <span className="an-mark">AN</span>
          <strong>AKBAR NAWASUNDA</strong>
          <p>PRODUCER / REMIXER / INDONESIA</p>
        </div>
        <div className="footer-links">
          <span>CONNECT</span>
          {editablePlatformLinks.slice(0, 4).map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label} <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
        <div className="footer-links">
          <span>ACCESS</span>
          <Link href="/epk">
            Electronic Press Kit <ArrowUpRight size={13} />
          </Link>

          <a href="mailto:akbarnawasunda@gmail.com">
            Book / Collaborate <ArrowUpRight size={13} />
          </a>
          <Link href="/privacy">
            Privacy <ArrowUpRight size={13} />
          </Link>
        </div>
        <p className="footer-bottom">
          © {new Date().getFullYear()} AKBAR NAWASUNDA · ALL RIGHTS RESERVED
        </p>
      </footer>
      </div>
      <HomeMenuOverlay
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
}
