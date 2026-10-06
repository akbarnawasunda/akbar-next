import { ArrowDownRight, ArrowUpRight, Disc3, Play } from "lucide-react";
import { Link } from "wouter";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import {
  artworkThumb,
  officialBrand,
  releases,
} from "@/content/artistPlatform";
import {
  publicPlatformLinks,
  usePublicArtistContent,
} from "@/content/publicContent";
import "./PressureCatalog.css";

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

const language = {
  id: {
    index: "[ 01 / MUSICAL ARCHIVE ]",
    kicker: "AKBAR NAWASUNDA / OFFICIAL DISCOGRAPHY",
    title: "MUSIK",
    deck: "Bukan daftar putar biasa. Ini jejak rilisan, edit, dan remix yang terus bergerak dari Bandung Barat ke speaker mana pun.",
    latest: "TRANSMISI TERKINI",
    play: "PUTAR SEKARANG",
    detail: "BACA DETAIL",
    archiveIndex: "[ 02 / ALL SIGNALS ]",
    archiveTitle: `SEMUA YANG
PERNAH DILEPAS.`,
    archiveNote:
      "Klik sebuah entri untuk membuka catatan rilis dan tautan resminya.",
    listenIndex: "[ 03 / OFFICIAL EXITS ]",
    listenTitle: `DENGARKAN
DI TEMPATMU.`,
    listenCopy:
      "Pilih layanan yang kamu pakai. Semua pintu di bawah mengarah ke kanal resmi Akbar Nawasunda.",
    booking: "BUTUH REMIX, PRODUKSI, ATAU LISENSI?",
    bookingCta: "KIRIM BRIEF",
    release: "RILISAN",
    open: "BUKA",
  },
  en: {
    index: "[ 01 / MUSICAL ARCHIVE ]",
    kicker: "AKBAR NAWASUNDA / OFFICIAL DISCOGRAPHY",
    title: "MUSIC",
    deck: "Not a conventional playlist. A moving record of releases, edits, and remixes from Bandung Barat to any speaker.",
    latest: "CURRENT TRANSMISSION",
    play: "PLAY NOW",
    detail: "READ RELEASE NOTE",
    archiveIndex: "[ 02 / ALL SIGNALS ]",
    archiveTitle: `EVERYTHING
THAT WAS RELEASED.`,
    archiveNote: "Open an entry for the release note and its official links.",
    listenIndex: "[ 03 / OFFICIAL EXITS ]",
    listenTitle: `LISTEN
YOUR WAY.`,
    listenCopy:
      "Choose your service. Every route below leads to an official Akbar Nawasunda channel.",
    booking: "NEED A REMIX, PRODUCTION, OR LICENSING?",
    bookingCta: "SEND A BRIEF",
    release: "RELEASE",
    open: "OPEN",
  },
} as const;

/** Shared by /music and /en/music. The surrounding page provides its locale chrome. */
export function MusicView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = language[locale];
  const cms = usePublicArtistContent();
  const cmsReleases = cms.data?.releases ?? [];
  const managed: CatalogEntry[] = cmsReleases.map(release => {
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
  const catalog = [
    ...managed,
    ...releases
      .filter(
        release =>
          !managed.some(
            item =>
              item.title.trim().toLowerCase() ===
              release.title.trim().toLowerCase()
          )
      )
      .map(release => ({
        ...release,
        image: release.image || officialBrand.socialPreview,
      })),
  ];
  const featured = managed.find((_, index) => cmsReleases[index]?.isCurrent) ||
    managed[0] ||
    catalog[0] || {
      title: "Masih Mencintainya — Papinka",
      format: "Remix",
      year: "2025",
      platform: "SoundCloud",
      href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda",
      image: officialBrand.socialPreview,
    };
  const platforms = publicPlatformLinks(cms.data);
  const root = locale === "en" ? "/en/music" : "/music";
  const inquire =
    locale === "en"
      ? "/en/inquire?type=remix&source=music"
      : "/inquire?type=remix&source=music";

  return (
    <main className="pressure-catalog" id="main-content" tabIndex={-1}>
      <section className="pressure-catalog__hero" aria-labelledby="music-title">
        <div className="pressure-catalog__hero-grid" aria-hidden="true" />
        <p className="pressure-catalog__index">{t.index}</p>
        <div className="pressure-catalog__headline">
          <p>{t.kicker}</p>
          <h1 id="music-title">
            <span>{t.title}</span>
            <span aria-hidden="true">{t.title}</span>
          </h1>
        </div>
        <div className="pressure-catalog__intro">
          <p>{t.deck}</p>
          <a href="#all-releases" className="pressure-catalog__down">
            <span>
              {catalog.length} {t.release}
            </span>
            <ArrowDownRight size={18} aria-hidden="true" />
          </a>
        </div>
        <figure className="pressure-catalog__disc">
          <span
            className="pressure-catalog__disc-ring pressure-catalog__disc-ring--one"
            aria-hidden="true"
          />
          <span
            className="pressure-catalog__disc-ring pressure-catalog__disc-ring--two"
            aria-hidden="true"
          />
          <ResilientArtworkImage
            src={featured.image}
            backupSrc={officialBrand.socialPreview}
            alt={`Artwork ${featured.title}`}
            loading="eager"
            fetchPriority="high"
          />
          <figcaption>
            {t.latest}
            <br />
            {featured.platform} · {featured.year}
          </figcaption>
        </figure>
      </section>

      <section
        className="pressure-catalog__feature"
        aria-labelledby="feature-title"
      >
        <div className="pressure-catalog__feature-number">NOW</div>
        <div className="pressure-catalog__feature-copy">
          <p className="pressure-catalog__label">
            <Disc3 size={13} aria-hidden="true" /> {featured.format} /{" "}
            {featured.year}
          </p>
          <h2 id="feature-title">{featured.title}</h2>
          <p>
            {featured.story ||
              "Satu rilisan yang sedang berada di depan. Dengarkan versi lengkapnya melalui kanal resmi, lalu buka dokumennya untuk konteks dan kredit."}
          </p>
          <div className="pressure-catalog__feature-actions">
            <a
              href={featured.href}
              target="_blank"
              rel="noreferrer"
              className="pressure-catalog__button pressure-catalog__button--dark"
              data-signal-magnetic
            >
              <Play size={14} fill="currentColor" aria-hidden="true" /> {t.play}
            </a>
            <Link
              href={`${root}/${slugFor(featured.title)}`}
              className="pressure-catalog__button"
              data-signal-magnetic
            >
              {t.detail} <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="pressure-catalog__archive"
        id="all-releases"
        aria-labelledby="archive-title"
      >
        <header>
          <p className="pressure-catalog__index">{t.archiveIndex}</p>
          <h2>
            {t.archiveTitle.split("\n").map((line, index) => (
              <span key={line + index}>{line}</span>
            ))}
          </h2>
          <p>{t.archiveNote}</p>
        </header>
        <ol className="pressure-catalog__list">
          {catalog.map((release, index) => (
            <li key={`${release.title}-${index}`}>
              <Link
                href={`${root}/${slugFor(release.title)}`}
                className="pressure-catalog__entry"
              >
                <span className="pressure-catalog__entry-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="pressure-catalog__entry-art">
                  <ResilientArtworkImage
                    src={artworkThumb(release.image)}
                    backupSrc={release.image || officialBrand.socialPreview}
                    alt=""
                  />
                </span>
                <span className="pressure-catalog__entry-name">
                  {release.title}
                </span>
                <span className="pressure-catalog__entry-data">
                  {release.format} / {release.year}
                  <br />
                  {release.platform}
                </span>
                <span className="pressure-catalog__entry-open">
                  {t.open} <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="pressure-catalog__services"
        aria-labelledby="services-title"
      >
        <div className="pressure-catalog__services-copy">
          <p className="pressure-catalog__index">{t.listenIndex}</p>
          <h2 id="services-title">
            {t.listenTitle.split("\n").map((line, index) => (
              <span key={line + index}>{line}</span>
            ))}
          </h2>
          <p>{t.listenCopy}</p>
        </div>
        <nav
          className="pressure-catalog__services-links"
          aria-label="Official streaming services"
        >
          {platforms.map((platform, index) => (
            <a
              href={platform.href}
              target="_blank"
              rel="noreferrer"
              key={platform.label}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{platform.label}</strong>
              <PlatformIcon label={platform.label} />
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
        </nav>
        <div className="pressure-catalog__brief">
          <p>{t.booking}</p>
          <Link
            href={inquire}
            className="pressure-catalog__button pressure-catalog__button--acid"
            data-signal-magnetic
          >
            {t.bookingCta} <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function Music() {
  return (
    <div className="nf-page pressure-music-page">
      <NightHeader active="/music" />
      <MusicView locale="id" />
      <NightFooter />
    </div>
  );
}
