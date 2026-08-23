import {
  ArrowDownRight,
  ArrowUpRight,
  Disc3,
  Headphones,
  Mail,
  Play,
  Radio,
  Sparkles,
  Ticket,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { PlatformIcon } from "@/components/PlatformIcon";
import { BrandMotionMark } from "@/components/BrandMotionMark";
import { PlatformMarquee, SectionIndex } from "@/components/PlatformMarquee";
import { ResilientBrandImage } from "@/components/ResilientBrandImage";
import { SkeletonCard } from "@/components/SkeletonCard";
import { TiltCard } from "@/components/TiltCard";
import {
  allPlatformLinks,
  currentRelease,
  officialBrand,
  platformLinks,
  publicStorageAsset,
  releases,
  videos,
} from "@/content/artistPlatform";
import { trpc } from "@/lib/trpc";
import { useMagnetic } from "@/hooks/useMagnetic";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSanityArtistContent } from "@/sanity/publicContent";
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

export default function Home() {
  usePerformanceMonitor();
  const currentSectionRef = useScrollReveal<HTMLElement>();
  const releaseSectionRef = useScrollReveal<HTMLElement>();
  const visualSectionRef = useScrollReveal<HTMLElement>();
  const platformSectionRef = useScrollReveal<HTMLElement>();
  const liveSectionRef = useScrollReveal<HTMLElement>();
  const signalSectionRef = useScrollReveal<HTMLElement>();
  const primaryActionRef = useMagnetic<HTMLAnchorElement>();
  const liveActionRef = useMagnetic<HTMLAnchorElement>();
  const [email, setEmail] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [portraitSrc, setPortraitSrc] = useState(officialBrand.portrait);
  const contentQuery = trpc.content.list.useQuery();
  const sanityContent = useSanityArtistContent();
  const managedContent = contentQuery.data ?? [];
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
  const activeRelease = managedRelease
    ? {
        ...currentRelease,
        title: managedRelease.title,
        type: managedRelease.label || currentRelease.type,
        href: managedRelease.href || currentRelease.href,
        image:
          managedRelease.imageUrl &&
          managedRelease.imageUrl !== officialBrand.socialPreview
            ? managedRelease.imageUrl
            : currentRelease.image,
      }
    : currentRelease;
  const cmsHero = sanityContent.data?.hero;
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
    "Produser dan remixer asal Bandung Barat.";
  const heroActionUrl =
    cmsHero?.primaryActionUrl || managedHero?.href || activeRelease.href;
  const heroActionLabel = cmsHero?.primaryActionLabel || "DENGAR SEKARANG";
  const activeVideos = managedVideos.length
    ? managedVideos.map(item => ({
        title: item.title,
        label: item.label || "VISUAL",
        href: item.href || "https://www.youtube.com/@akbarnawasunda",
        image: item.imageUrl || officialBrand.socialPreview,
      }))
    : videos;
  const subscribe = trpc.fanSignal.subscribe.useMutation({
    onSuccess: () => {
      setEmail("");
      toast.success(
        "Sinyal diterima. Kamu masuk jalur update Akbar Nawasunda."
      );
    },
    onError: () =>
      toast.error("Sinyal belum terkirim. Coba lagi dalam beberapa saat."),
  });

  const submitSignal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate({ email, source: "home" });
  };

  return (
    <div className="an-site">
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
          <Radio size={14} /> FAN SIGNAL
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
        <div
          id="an-mobile-navigation"
          className={`an-mobile-navigation${mobileNavOpen ? " is-open" : ""}`}
          aria-hidden={!mobileNavOpen}
        >
          <Link href="/music" onClick={() => setMobileNavOpen(false)}>
            MUSIC
          </Link>
          <Link href="/visuals" onClick={() => setMobileNavOpen(false)}>
            VISUALS
          </Link>
          <Link href="/live" onClick={() => setMobileNavOpen(false)}>
            LIVE
          </Link>
          <Link href="/universe" onClick={() => setMobileNavOpen(false)}>
            ARCHIVE
          </Link>
          <Link href="/about" onClick={() => setMobileNavOpen(false)}>
            ABOUT
          </Link>
          <a
            className="mobile-signal"
            href="#signal"
            onClick={() => setMobileNavOpen(false)}
          >
            JOIN FAN SIGNAL
          </a>
        </div>
      </header>

      <main id="top">
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
            <h1>{heroTitle || "AKBAR NAWASUNDA."}</h1>
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
                <span>{heroActionLabel}</span>
              </a>
              <a className="button-quiet" href="#signal">
                MASUK FAN SIGNAL <ArrowDownRight size={16} />
              </a>
            </div>
          </div>
          <BrandMotionMark src={officialBrand.rmxMark} />
        </section>

        <section
          ref={platformSectionRef}
          className="home-signal-deck reveal-target"
          aria-labelledby="signal-deck-title"
        >
          <SectionIndex number="01" label="OFFICIAL NETWORK" />
          <div className="home-signal-copy">
            <p className="eyebrow">
              <span /> PLATFORM RESMI
            </p>
            <h2 id="signal-deck-title">
              DENGAR
              <br />
              DI PLATFORM PILIHAN.
            </h2>
            <Link className="home-deck-cta" href="/music">
              LIHAT MUSIK <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="home-platform-rack">
            {allPlatformLinks.map((platform, index) => (
              <a
                className={`home-platform-card platform-${platform.label.toLowerCase().replace(/\s+/g, "-")}`}
                key={platform.label}
                href={platform.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Buka Akbar Nawasunda di ${platform.label}`}
              >
                <span className="home-platform-number">0{index + 1}</span>
                <span className="home-platform-icon-shell">
                  <PlatformIcon label={platform.label} />
                </span>
                <span className="home-platform-copy">
                  <strong>{platform.label}</strong>
                  <small>PLATFORM RESMI</small>
                </span>
                <ArrowUpRight className="home-platform-arrow" size={15} />
              </a>
            ))}
          </div>
          <PlatformMarquee />
        </section>

        <section
          ref={currentSectionRef}
          className="section section-current reveal-target"
          id="music"
        >
          <SectionIndex number="02" label="CURRENT RELEASE" />
          <div className="section-heading">
            <p className="eyebrow">RILISAN TERBARU</p>
            <h2>
              SEDANG
              <br />
              DIDENGARKAN.
            </h2>
          </div>
          {contentQuery.isLoading ? (
            <p className="content-state">MEMUAT RILISAN…</p>
          ) : contentQuery.isError ? (
            <p className="content-state content-state-warn">
              MENAMPILKAN ARSIP RILISAN.
            </p>
          ) : null}
          <div className="feature-release">
            <div className="release-cover">
              <img
                src={activeRelease.image}
                alt="Abstract visual for current release"
                loading="lazy"
                decoding="async"
              />
              <span className="cover-orbit" />
            </div>
            <div className="release-detail">
              <p className="mono-label">
                {managedRelease?.label
                  ? `MANAGED RELEASE · ${managedRelease.label}`
                  : currentRelease.eyebrow}
              </p>
              <h3>{activeRelease.title}</h3>
              <p>
                {managedRelease?.subtitle ||
                  "Buka rilisan ini di platform resminya."}
              </p>
              <div className="release-detail-actions">
                <a
                  className="text-link"
                  href={activeRelease.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  OPEN RELEASE <ArrowUpRight size={16} />
                </a>
                <span>{activeRelease.type}</span>
              </div>
            </div>
          </div>
        </section>

        <section
          ref={releaseSectionRef}
          className="section release-section reveal-target"
        >
          <SectionIndex number="03" label="DISCOGRAPHY" />
          <div className="section-inline">
            <div>
              <p className="eyebrow">DISKOGRAFI</p>
              <h2>
                SEMUA
                <br />
                RILISAN.
              </h2>
            </div>
            <a
              className="text-link"
              href="https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw"
              target="_blank"
              rel="noreferrer"
            >
              SPOTIFY <PlatformIcon label="Spotify" />{" "}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="release-grid" aria-busy={contentQuery.isLoading}>
            {contentQuery.isLoading
              ? [1, 2, 3, 4].map(index => <SkeletonCard key={index} />)
              : releases.map((release, index) => (
                  <TiltCard
                    key={release.title}
                    className="release-card"
                    href={release.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {release.image && (
                      <div className="release-card-art">
                        <img
                          src={release.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <span className="release-number">0{index + 1}</span>
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

        <section
          ref={visualSectionRef}
          className="section visual-section reveal-target"
          id="visuals"
        >
          <SectionIndex number="04" label="OFFICIAL VISUALS" />
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
                <img src={video.image} alt="" loading="lazy" decoding="async" />
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

        <section
          ref={liveSectionRef}
          className="section live-section reveal-target"
          id="live"
        >
          <SectionIndex number="05" label="LIVE SIGNAL" />
          <div
            className="live-backdrop"
            style={{
              backgroundImage: `url(${publicStorageAsset("/manus-storage/an-night-frequency-stage_113bf174.jpg")})`,
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
              {managedLive?.subtitle ||
                "Jadwal akan tampil setelah diumumkan secara resmi."}
            </p>
            <a
              ref={liveActionRef}
              className="button-primary"
              href={managedLive?.href || "#signal"}

              target={managedLive?.href ? "_blank" : undefined}
              rel={managedLive?.href ? "noreferrer" : undefined}
            >
              <Ticket size={16} />
              <span>DAPATKAN UPDATE</span>
            </a>
          </div>
          <div className="live-status">
            <span>{managedLive?.label || "JADWAL"}</span>
            <strong>
              {managedLive?.title || (
                <>
                  BELUM ADA
                  <br />
                  TANGGAL
                </>
              )}
            </strong>
            <small>{managedLive ? "UPDATE RESMI" : "AKAN DIUMUMKAN"}</small>
          </div>
        </section>

        <section
          ref={signalSectionRef}
          className="signal-section reveal-target"
          id="signal"
        >
          <SectionIndex number="06" label="FAN SIGNAL" />
          <div>
            <p className="eyebrow">
              <Sparkles size={14} /> FAN SIGNAL
            </p>
            <h2>
              UPDATE
              <br />
              RILISAN.
            </h2>
            <p>Kabar rilisan, visual, dan jadwal dari kanal resmi.</p>
          </div>
          <form onSubmit={submitSignal}>
            <label htmlFor="fan-email">EMAIL ADDRESS</label>
            <div className="signal-input">
              <Mail size={18} />
              <input
                id="fan-email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="nama@kamu.com"
                autoComplete="email"
                required
              />
              <button type="submit" disabled={subscribe.isPending}>
                {subscribe.isPending ? "SENDING" : "JOIN"}
                <ArrowUpRight size={17} />
              </button>
            </div>
            <small>
              Dengan mendaftar, kamu setuju menerima update dari Akbar
              Nawasunda. Berhenti kapan saja.
            </small>
          </form>
        </section>
      </main>

      <footer className="an-footer">
        <div className="footer-brand">
          <span className="an-mark">AN</span>
          <strong>AKBAR NAWASUNDA</strong>
          <p>PRODUCER / REMIXER / INDONESIA</p>
        </div>
        <div className="footer-links">
          <span>CONNECT</span>
          {platformLinks.map(link => (
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
          © {new Date().getFullYear()} AKBAR NAWASUNDA · ALL SIGNALS RESERVED
        </p>
      </footer>
    </div>
  );
}
