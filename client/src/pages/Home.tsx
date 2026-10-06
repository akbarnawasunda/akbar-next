import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Disc3,
  Play,
  Radio,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import FanSignalSection, {
  FAN_SIGNAL_SOURCES,
} from "@/components/FanSignalSection";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { SundaScript } from "@/components/signature/SundaScript";
import { officialBrand, releases } from "@/content/artistPlatform";
import { SUNDA_NAME } from "@/content/sundaneseScript";
import {
  publicPlatformLinks,
  publicUpcomingEvents,
  usePublicArtistContent,
} from "@/content/publicContent";
import "./Home.css";
import "./PressureHome.css";

type CatalogEntry = {
  title: string;
  format: string;
  year: string;
  platform: string;
  href: string;
  image: string;
  story?: string;
  credits?: string;
};

const slugFor = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .toUpperCase();
}

/**
 * The landing page is deliberately a poster rather than a content dashboard.
 * CMS values still flow through it, but their presentation is arranged as an
 * evolving transmission from Bandung Barat: a single release, a loud archive,
 * and direct exits to the artist's official channels.
 */
export default function Home() {
  const cms = usePublicArtistContent();
  const stageRef = useRef<HTMLElement>(null);
  const managedReleases = cms.data?.releases ?? [];

  const managedCatalog: CatalogEntry[] = managedReleases.map(release => {
    const archived = releases.find(
      item =>
        item.title.trim().toLowerCase() === release.title.trim().toLowerCase()
    );

    return {
      title: release.title,
      format: release.format || archived?.format || "Release",
      year: release.year || archived?.year || "—",
      platform: release.platform || archived?.platform || "Official link",
      href:
        release.url ||
        archived?.href ||
        "https://soundcloud.com/akbarnawasunda",
      image:
        release.artworkUrl || archived?.image || officialBrand.socialPreview,
      story: release.story,
      credits: release.credits,
    };
  });

  const archiveCatalog: CatalogEntry[] = releases
    .filter(
      legacy =>
        !managedCatalog.some(
          item =>
            item.title.trim().toLowerCase() ===
            legacy.title.trim().toLowerCase()
        )
    )
    .map(release => ({
      ...release,
      image: release.image || officialBrand.socialPreview,
    }));

  const catalog = [...managedCatalog, ...archiveCatalog];
  const currentManaged =
    managedCatalog.find((_, index) => managedReleases[index]?.isCurrent) ||
    managedCatalog[0];
  const featured = currentManaged ||
    catalog[0] || {
      title: "Masih Mencintainya — Papinka",
      format: "Remix",
      year: "2025",
      platform: "SoundCloud",
      href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda",
      image: officialBrand.socialPreview,
    };

  const platforms = publicPlatformLinks(cms.data);
  const nextEvent = publicUpcomingEvents(cms.data)[0];
  const hero = cms.data?.hero;
  const profile = cms.data?.profile;
  const heroImage =
    hero?.heroImage || profile?.portraitImage || officialBrand.portrait;
  const heroBody =
    hero?.heroBody ||
    "Produser musik, remixer, dan DJ dari Bandung Barat. Akbar Nawasunda membentuk breakbeat, Indo bass, dan bahasa remix menjadi tekanan yang bergerak ke depan.";
  const archive = catalog.slice(0, 8);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !window.matchMedia("(pointer: fine)").matches) return;

    const move = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      stage.style.setProperty(
        "--pressure-x",
        `${(event.clientX - bounds.left) / bounds.width}`
      );
      stage.style.setProperty(
        "--pressure-y",
        `${(event.clientY - bounds.top) / bounds.height}`
      );
    };
    const leave = () => {
      stage.style.removeProperty("--pressure-x");
      stage.style.removeProperty("--pressure-y");
    };

    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    return () => {
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="an-site pressure-site" data-page="home">
      <NightHeader />
      <main id="top" tabIndex={-1}>
        <section
          className="pressure-hero"
          ref={stageRef}
          aria-labelledby="pressure-title"
        >
          <div className="pressure-hero__grid" aria-hidden="true" />
          <p className="pressure-hero__edition">AN / 01—26 · BANDUNG BARAT</p>
          <p className="pressure-hero__side">
            SOUND IN MOTION · SOUND IN MOTION
          </p>

          <h1
            className="pressure-hero__title hero-title-editorial"
            id="pressure-title"
            data-no-scramble="true"
            aria-label="Akbar Nawasunda"
          >
            <span>AKBAR</span>
            <span>NAWA</span>
            <span>SUNDA</span>
          </h1>

          <figure className="pressure-hero__portrait">
            <div className="pressure-hero__portrait-frame">
              <img
                src={heroImage}
                alt="Potret Akbar Nawasunda"
                width={800}
                height={1000}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={event => {
                  event.currentTarget.src = officialBrand.portraitFallback;
                }}
              />
            </div>
            <figcaption>
              <span>01 / PORTRAIT</span>
              <span>ROOTED IN WEST JAVA</span>
            </figcaption>
          </figure>

          <div className="pressure-hero__copy">
            <p className="pressure-eyebrow">
              <Radio size={13} aria-hidden="true" />
              {hero?.heroKicker || "RAW BASS PRESSURE / LIVE SIGNAL"}
            </p>
            <SundaScript entry={SUNDA_NAME} lang="id" tone="hero" />
            <p>{heroBody}</p>
            <div className="pressure-actions">
              <a
                className="pressure-action pressure-action--solid"
                href={featured.href}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={14} fill="currentColor" aria-hidden="true" />
                DENGAR RILISAN
              </a>
              <Link className="pressure-action" href="/visuals">
                MASUK KE VISUAL <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <a className="pressure-scroll" href="#current-release">
            <span>GULIR UNTUK MASUK</span>
            <ArrowDown size={17} aria-hidden="true" />
          </a>

          <div className="pressure-hero__stamp" aria-hidden="true">
            <span>AN</span>
            <i />
            <small>ORIGIN / RHYTHM / PRESSURE</small>
          </div>
        </section>

        <div
          className="pressure-runner"
          aria-label="Akbar Nawasunda — producer, remixer, DJ dari Bandung Barat"
        >
          <div>
            <span>BREAKBEAT</span>
            <b>✳</b>
            <span>INDO BASS</span>
            <b>✳</b>
            <span>DJ AKBAR REMIX</span>
            <b>✳</b>
            <span>AKBAR NAWASUNDA</span>
            <b>✳</b>
            <span>BREAKBEAT</span>
            <b>✳</b>
            <span>INDO BASS</span>
          </div>
        </div>

        <section className="pressure-origin" aria-labelledby="origin-title">
          <p className="pressure-index">[ 02 / THE ORIGIN ]</p>
          <h2 id="origin-title">
            BUKAN SEKADAR
            <em> REMIX.</em>
            <br />
            SEBUAH ARAH BARU.
          </h2>
          <div className="pressure-origin__text">
            <p>
              Nama ini bergerak dari eksperimen DJ Akbar Remix menuju ruang yang
              lebih personal: ritme lokal, melodinya sendiri, dan low end yang
              tidak minta izin untuk memenuhi ruangan.
            </p>
            <Link href="/universe" className="pressure-text-link">
              BACA PERJALANANNYA <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <dl className="pressure-origin__facts">
            <div>
              <dt>BASE</dt>
              <dd>Bandung Barat / ID</dd>
            </div>
            <div>
              <dt>MODE</dt>
              <dd>Producer · Remixer · DJ</dd>
            </div>
            <div>
              <dt>FREQUENCY</dt>
              <dd>Breakbeat / Indo Bass</dd>
            </div>
          </dl>
        </section>

        <section
          className="pressure-current"
          id="current-release"
          aria-labelledby="current-title"
          aria-busy={cms.isLoading}
        >
          <header className="pressure-section-head">
            <p className="pressure-index">[ 03 / CURRENT TRANSMISSION ]</p>
            <p>
              {cms.isLoading
                ? "MENYAMBUNG KE ARSIP..."
                : "RILISAN YANG SEDANG MENEKAN"}
            </p>
          </header>
          <div className="pressure-current__layout">
            <div className="pressure-current__copy">
              <span className="pressure-current__number">01</span>
              <p className="pressure-eyebrow">
                <Disc3 size={13} aria-hidden="true" /> {featured.format} ·{" "}
                {featured.year}
              </p>
              <h2 id="current-title">{featured.title}</h2>
              <p>
                {featured.story ||
                  "Satu titik masuk ke arus Akbar Nawasunda. Putar versi penuhnya di kanal resmi, atau buka catatan rilisannya."}
              </p>
              <div className="pressure-actions">
                <a
                  className="pressure-action pressure-action--solid"
                  href={featured.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Play size={14} fill="currentColor" aria-hidden="true" />
                  PUTAR SEKARANG
                </a>
                <Link
                  className="pressure-action"
                  href={`/music/${slugFor(featured.title)}`}
                >
                  DETAIL RILISAN <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <figure className="pressure-current__art">
              <span className="pressure-current__orbit" aria-hidden="true">
                AKBAR NAWASUNDA · AKBAR NAWASUNDA ·{" "}
              </span>
              <ResilientArtworkImage
                src={featured.image}
                backupSrc={officialBrand.socialPreview}
                alt={`Artwork ${featured.title}`}
                loading="eager"
                fetchPriority="high"
              />
              <figcaption>{featured.platform} / OFFICIAL LINK</figcaption>
            </figure>
            <aside className="pressure-current__margin">
              <span>CATALOGUE</span>
              <strong>{String(catalog.length).padStart(2, "0")}</strong>
              <span>
                ENTRIES
                <br />
                IN MOTION
              </span>
            </aside>
          </div>
        </section>

        <section className="pressure-archive" aria-labelledby="archive-title">
          <header className="pressure-archive__head">
            <p className="pressure-index">[ 04 / SELECTED FREQUENCIES ]</p>
            <h2 id="archive-title">
              ARSIP
              <br />
              <em>YANG BERGERAK.</em>
            </h2>
            <Link href="/music" className="pressure-text-link">
              LIHAT SELURUH KATALOG{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </header>
          <div className="pressure-archive__rows">
            {archive.map((release, index) => (
              <Link
                className="pressure-release-row"
                href={`/music/${slugFor(release.title)}`}
                key={`${release.title}-${index}`}
              >
                <span className="pressure-release-row__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="pressure-release-row__art">
                  <ResilientArtworkImage
                    src={release.image}
                    backupSrc={officialBrand.socialPreview}
                    alt=""
                  />
                </span>
                <span className="pressure-release-row__title">
                  {release.title}
                </span>
                <span className="pressure-release-row__meta">
                  {release.format}
                  <br />
                  {release.year}
                </span>
                <ArrowUpRight
                  className="pressure-release-row__arrow"
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>

        <section className="pressure-exits" aria-labelledby="exits-title">
          <div className="pressure-exits__intro">
            <p className="pressure-index">[ 05 / OPEN CHANNELS ]</p>
            <h2 id="exits-title">
              PILIH PINTU
              <br />
              MASUKMU.
            </h2>
            <p>
              Semua link di bawah adalah jalur resmi untuk musik, video, dan
              sinyal terbaru dari studio.
            </p>
          </div>
          <nav
            className="pressure-exits__links"
            aria-label="Kanal resmi Akbar Nawasunda"
          >
            {platforms.map((platform, index) => (
              <a
                className={`an-channel platform-${platform.label
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                href={platform.href}
                target="_blank"
                rel="noreferrer"
                key={platform.label}
                aria-label={`Buka Akbar Nawasunda di ${platform.label}`}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{platform.label}</strong>
                <PlatformIcon label={platform.label} />
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <div className="pressure-exits__booking">
            <p>PERFORMANCE / REMIX / LICENSING</p>
            <Link
              href="/inquire?source=home"
              className="pressure-action pressure-action--solid"
            >
              KIRIM BRIEF <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            {nextEvent ? (
              <Link href="/live" className="pressure-exits__date">
                NEXT: {formatEventDate(nextEvent.date)} ·{" "}
                {nextEvent.city || nextEvent.title}
              </Link>
            ) : (
              <Link href="/epk" className="pressure-exits__date">
                BOOKING TERBUKA / LIHAT EPK
              </Link>
            )}
          </div>
        </section>

        <FanSignalSection
          source={FAN_SIGNAL_SOURCES.home}
          anchorId="signal-list"
          className="pressure-fan-signal"
          eyebrow="[ 06 / PRIVATE SIGNAL ]"
          title={
            <>
              JANGAN KETINGGALAN.
              <br />
              MASUK KE FREKUENSI.
            </>
          }
          description="Rilisan, catatan studio, dan kabar panggung langsung dari kanal resmi. Tidak ada noise, berhenti kapan saja."
        />
      </main>
      <NightFooter />
    </div>
  );
}
