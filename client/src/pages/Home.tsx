import { Fragment, type CSSProperties, useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { Link } from "wouter";
import FanSignalSection from "@/components/FanSignalSection";
import { MusicEmbed } from "@/components/MusicEmbed";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { PlatformIcon } from "@/components/PlatformIcon";
import { PlatformMarquee } from "@/components/PlatformMarquee";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { SignatureStage } from "@/components/signature/SignatureStage";
import { SundaScript } from "@/components/signature/SundaScript";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import {
  currentRelease,
  officialBrand,
  releases,
} from "@/content/artistPlatform";
import {
  publicPlatformLinks,
  usePublicArtistContent,
} from "@/content/publicContent";
import { SUNDA_NAME } from "@/content/sundaneseScript";
import { trpc } from "@/lib/trpc";
import "@/components/OfficialBrand.css";
import "./Home.css";
import "./HomeStage.css";
import "./ResonanceHome.css";

const releaseSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function Home() {
  const publicContent = usePublicArtistContent();
  const managedQuery = trpc.content.list.useQuery(undefined, {
    enabled: publicContent.isError,
  });
  const managedContent = managedQuery.data ?? [];
  const contentIsLoading = publicContent.isLoading || managedQuery.isLoading;
  const managedHero = managedContent.find(item => item.kind === "hero");
  const managedRelease = managedContent.find(item => item.kind === "release");
  const rawManagedLive = managedContent.find(item => item.kind === "live");
  // Keep an unconfirmed legacy event out of the public register.
  const managedLive =
    rawManagedLive && !/no date announced|tba/i.test(rawManagedLive.title)
      ? rawManagedLive
      : undefined;
  void managedLive;

  const cmsHero = publicContent.data?.hero;
  const cmsProfile = publicContent.data?.profile;
  const cmsReleases = publicContent.data?.releases ?? [];
  const cmsCurrentRelease =
    cmsReleases.find(item => item.isCurrent) || cmsReleases[0];

  const catalog = cmsReleases.length
    ? cmsReleases.map(item => {
        const archive = releases.find(
          release =>
            release.title.trim().toLowerCase() ===
            item.title.trim().toLowerCase()
        );
        return {
          title: item.title,
          format: item.format || archive?.format || "Release",
          year: item.year || archive?.year || "—",
          platform: item.platform || archive?.platform || "Official",
          href:
            item.url ||
            archive?.href ||
            "https://soundcloud.com/akbarnawasunda",
          image:
            item.artworkUrl || archive?.image || officialBrand.socialPreview,
        };
      })
    : releases;

  const normalizeManagedTitle = (value: string) =>
    value.toLowerCase() === "garam & madu × backpacker"
      ? "Garam & Madu × Backpacker"
      : value;
  const fallbackReleaseYear =
    releases.find(
      release =>
        release.title.trim().toLowerCase() ===
        currentRelease.title.trim().toLowerCase()
    )?.year || "—";

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
        story: cmsCurrentRelease.story,
        year: cmsCurrentRelease.year || fallbackReleaseYear,
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
          story: managedRelease.subtitle,
          year: fallbackReleaseYear,
        }
      : { ...currentRelease, story: undefined, year: fallbackReleaseYear };

  const configuredPortrait =
    cmsHero?.heroImage || cmsProfile?.portraitImage || officialBrand.portrait;
  const [portraitSrc, setPortraitSrc] = useState(configuredPortrait);
  const [playerOpen, setPlayerOpen] = useState(false);
  useEffect(() => setPortraitSrc(configuredPortrait), [configuredPortrait]);

  const suppliedHeroTitle = cmsHero?.heroTitle || managedHero?.title;
  // Retire the old "make the night move" campaign line without allowing
  // stale CMS copy to displace the artist's name.
  const heroTitle = /make the night move/i.test(suppliedHeroTitle || "")
    ? undefined
    : suppliedHeroTitle;
  const displayHeroTitle = (heroTitle || "AKBAR NAWASUNDA.").trim();
  const heroTitleWords = displayHeroTitle.split(/\s+/);
  const heroBody =
    cmsHero?.heroBody ||
    managedHero?.subtitle ||
    "Produser musik, remixer, dan DJ dari Bandung Barat. Breakbeat, electronic bass, dan remix untuk rilisan serta kolaborasi.";
  const platforms = publicPlatformLinks(publicContent.data);
  const archivePreview = catalog.slice(0, 6);

  return (
    <div className="an-site" data-page="home" data-home-edition="resonance">
      <NightHeader />

      <main id="top" tabIndex={-1}>
        <section
          className="an-hero-scene resonance-opening"
          aria-labelledby="hero-title"
        >
          <div className="resonance-folio" aria-hidden="true">
            <span>AN / PUBLIC REGISTER</span>
            <span>06° 52′ S · 107° 28′ E</span>
          </div>

          <div className="an-hero-inner resonance-opening__copy">
            <p className="resonance-kicker">
              <span>Bandung Barat</span>
              <span>Independent electronic artist</span>
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
                  <Fragment key={`${word}-${index}`}>
                    {index > 0 ? " " : null}
                    <span
                      className="hero-title-mask"
                      style={{ "--hero-word-index": index } as CSSProperties}
                    >
                      <span className="hero-title-word">{word}</span>
                    </span>
                  </Fragment>
                ))}
              </span>
            </h1>
            <div className="resonance-opening__statement">
              <SundaScript entry={SUNDA_NAME} lang="id" tone="hero" />
              <p className="an-hero-lede">{heroBody}</p>
            </div>
            <a
              className="resonance-primary-action"
              href={activeRelease.href}
              target="_blank"
              rel="noreferrer"
              data-signal-magnetic
              data-signal-interactive
              data-cursor="music"
            >
              <span>DENGAR SEKARANG</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>

          <figure className="an-hero-plate resonance-opening__portrait">
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
                width={800}
                height={1000}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() => {
                  if (portraitSrc !== officialBrand.portraitFallback) {
                    setPortraitSrc(officialBrand.portraitFallback);
                  }
                }}
              />
            </picture>
            <figcaption className="resonance-portrait-caption">
              <span>Fig. 01</span>
              <span>Artist portrait / Bandung Barat</span>
            </figcaption>
          </figure>

          <a className="an-hero-scroll" href="#current">
            <span>Masuk ke frekuensi</span>
            <ArrowDown size={14} aria-hidden="true" />
          </a>
        </section>

        <section
          className="resonance-current"
          id="signal"
          aria-labelledby="current-title"
          aria-busy={contentIsLoading}
        >
          <header className="resonance-section-heading">
            <p>
              <span>01</span> Current transmission
            </p>
            <p>Master object / listen on demand</p>
          </header>
          <dl
            className="ed-signal-board resonance-status"
            aria-label="Status terbaru"
          >
            <div>
              <dt>RILISAN TERBARU</dt>
              <dd>{activeRelease.title}</dd>
              <span>{activeRelease.type}</span>
            </div>
            <div>
              <dt>STATUS BOOKING</dt>
              <dd>Terbuka untuk booking &amp; remix</dd>
              <span>Kontak langsung / tanpa perantara</span>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>Bandung Barat</dd>
              <span>Breakbeat / electronic bass</span>
            </div>
          </dl>
          <div className="resonance-current__layout">
            <figure className="resonance-current__art" data-cursor="artwork">
              <ResilientArtworkImage
                src={activeRelease.image}
                backupSrc={officialBrand.socialPreview}
                alt={`Artwork ${activeRelease.title}`}
              />
              <figcaption>{activeRelease.type}</figcaption>
            </figure>
            <div className="resonance-current__copy">
              <p className="resonance-current__year">{activeRelease.year}</p>
              <h2 id="current-title">{activeRelease.title}</h2>
              <p className="resonance-current__story">
                {activeRelease.story ||
                  "Rilisan aktif dari arsip Akbar Nawasunda. Dengarkan melalui player resmi atau buka sumbernya langsung."}
              </p>
              <div className="resonance-current__actions">
                <button
                  type="button"
                  onClick={() => setPlayerOpen(open => !open)}
                  aria-expanded={playerOpen}
                  data-cursor="music"
                >
                  {playerOpen ? (
                    <Pause size={13} />
                  ) : (
                    <Play size={13} fill="currentColor" />
                  )}
                  {playerOpen ? "Tutup player" : "Putar di sini"}
                </button>
                <Link href={`/music/${releaseSlug(activeRelease.title)}`}>
                  Catatan rilisan <ArrowUpRight size={14} />
                </Link>
              </div>
              {playerOpen ? (
                <div className="an-feature-player" data-cursor="music">
                  <MusicEmbed
                    url={activeRelease.href}
                    title={activeRelease.title}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <SignatureStage alsoKnownAs="Juga dikenal sebagai DJ Akbar Remix dan akbarnawasunda.my.id." />

        <section
          className="resonance-register"
          aria-labelledby="register-title"
        >
          <header className="resonance-register__head">
            <div>
              <p className="resonance-section-number">02 / Selected archive</p>
              <h2 id="register-title">Catatan suara.</h2>
            </div>
            <Link href="/music">
              Seluruh arsip <ArrowUpRight size={14} />
            </Link>
          </header>
          <ol className="resonance-release-index">
            {archivePreview.map((release, index) => (
              <li key={`${release.title}-${release.year}`}>
                <Link
                  href={`/music/${releaseSlug(release.title)}`}
                  data-cursor="artwork"
                >
                  <span className="resonance-release-index__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="resonance-release-index__title">
                    {release.title}
                  </span>
                  <span>{release.format}</span>
                  <span>{release.platform}</span>
                  <span>{release.year}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="resonance-crossing"
          aria-labelledby="crossing-title"
        >
          <div className="resonance-crossing__alias">
            <p>Previous transmission identity</p>
            <img
              src={officialBrand.rmxMark}
              alt="DJ Akbar Remix"
              width={640}
              height={360}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="resonance-crossing__copy">
            <p className="resonance-section-number">03 / Continuum</p>
            <h2 id="crossing-title">
              Dua nama.
              <br />
              Satu lintasan.
            </h2>
            <p>
              DJ Akbar Remix bukan catatan kaki. Ia adalah lapisan awal dari
              bahasa produksi yang kini bergerak sebagai Akbar Nawasunda.
            </p>
            <Link href="/universe">
              Baca perjalanan <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>

        <section
          className="an-channels resonance-channels"
          aria-labelledby="channels-title"
        >
          <header className="resonance-register__head">
            <div>
              <p className="resonance-section-number">04 / Official channels</p>
              <h2 id="channels-title">Sumber resmi.</h2>
            </div>
            <p>{platforms.length} kanal terverifikasi</p>
          </header>
          <ul className="an-channels-list">
            {platforms.map((platform, index) => (
              <li key={platform.label} className="an-channel-row">
                <a
                  className={`an-channel platform-${platform.label.toLowerCase().replace(/\s+/g, "-")}`}
                  href={platform.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Buka Akbar Nawasunda di ${platform.label}`}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="an-channel-name">{platform.label}</span>
                  <span className="an-channel-mark" aria-hidden="true">
                    <PlatformIcon label={platform.label} />
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <PlatformMarquee links={platforms} />
        </section>

        <section
          className="resonance-exit ed-cta-shell"
          aria-labelledby="exit-title"
        >
          <p className="resonance-section-number">05 / Exit route</p>
          <h2 id="exit-title">
            BAWA SUARA INI
            <br />
            ke panggungmu.
          </h2>
          <p>
            Performance, remix custom, lisensi, atau kolaborasi. Kirim konteks,
            tanggal, dan bentuk proyek; jawaban dimulai dari kebutuhan nyata.
          </p>
          <div className="resonance-exit__links">
            <Link href="/inquire?source=home">
              Mulai percakapan <ArrowUpRight size={15} />
            </Link>
            <Link href="/epk">
              Buka EPK <ArrowUpRight size={15} />
            </Link>
            <Link href="/game/jedag-run">
              JEDAG RUN <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>

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
          description="Rilisan baru, video, dan jadwal — langsung ke email kamu."
        />
      </main>

      <NightFooter />
    </div>
  );
}
