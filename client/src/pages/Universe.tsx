import { ArrowDown, ArrowUpRight, Disc3, Music2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import FanSignalSection from "@/components/FanSignalSection";
import { FAN_SIGNAL_SOURCES } from "@shared/types";
import { slugify } from "@shared/slug";
import {
  artworkThumb,
  officialBrand,
  releases,
  verifiedArtistProfile,
} from "@/content/artistPlatform";
import {
  publicJourney,
  publicPhotoStories,
  usePublicArtistContent,
} from "@/content/publicContent";
import { ArtistPhotoStorySection } from "@/components/ArtistEditorialSections";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { Reveal } from "@/components/Reveal";
import {
  EditorialSection,
  SignalIndicator,
} from "@/components/editorial/EditorialKit";
import { EraTimeline } from "@/components/signature/EraTimeline";
import { publicEras } from "@/content/eras";
import "./EcosystemPages.css";
import "./ArchiveUpgrade.css";
import "./ArchiveArtwork.css";
import "./ArchiveStage.css";

const routes = [
  {
    number: "01",
    title: "Dengar rilisan",
    copy: "Masuk ke katalog, artwork, dan tautan dengar resmi yang tersedia.",
    href: "/music",
    icon: Disc3,
  },
  {
    number: "02",
    title: "Remix / kolaborasi",
    copy: "Kirim konteks project untuk remix request, custom arrangement, atau kolaborasi.",
    href: "/inquire?type=remix&source=archive",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Booking / lisensi",
    copy: "Gunakan jalur inquiry resmi untuk performance, kebutuhan penggunaan musik, atau kerja sama.",
    href: "/inquire?type=booking&source=archive",
    icon: Music2,
  },
];

export default function Universe() {
  const cms = usePublicArtistContent();
  const journey = publicJourney(cms.data);
  const photoStories = publicPhotoStories(cms.data);
  const cmsReleases = cms.data?.releases ?? [];
  const cmsCatalog = cmsReleases.map(item => {
    const fallback = releases.find(
      release =>
        release.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    );
    return {
      title: item.title,
      year: item.year || fallback?.year || "—",
      platform: item.platform || fallback?.platform || "Official link",
      href:
        item.url || fallback?.href || "https://soundcloud.com/akbarnawasunda",
      image: item.artworkUrl || fallback?.image || officialBrand.socialPreview,
    };
  });
  const catalog = [
    ...cmsCatalog,
    ...releases
      .filter(
        release =>
          !cmsCatalog.some(
            item =>
              item.title.trim().toLowerCase() ===
              release.title.trim().toLowerCase()
          )
      )
      .map(release => ({
        title: release.title,
        year: release.year,
        platform: release.platform,
        href: release.href,
        image: release.image,
      })),
  ];
  const eras = publicEras(cms.data, "id");

  return (
    <div className="nf-page an-archive-page">
      <NightHeader active="/universe" />
      <main id="main-content" tabIndex={-1}>
        {/* Babak 1 — pembuka arsip: satu potret arsip sebagai jangkar,
            sisanya fakta yang bisa diverifikasi. */}
        <section className="an-arc-hero" aria-labelledby="archive-title">
          <figure className="an-arc-hero-plate">
            <img
              src={officialBrand.archivePortrait}
              alt="Artwork editorial Akbar Nawasunda dengan tema future city"
              width={800}
              height={1000}
              loading="eager"
              decoding="async"
            />
            <figcaption>Arsip visual · Bandung Barat</figcaption>
          </figure>
          <div className="an-arc-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              Arsip resmi · 2020—sekarang
            </p>
            <h1 id="archive-title">Perjalanan Akbar Nawasunda.</h1>
            <p className="an-arc-lede">
              Dari DJ Akbar Remix ke Akbar Nawasunda — satu katalog, beberapa
              babak, dan semua tautan resminya di satu tempat.
            </p>
            <dl className="an-facts">
              <div>
                <dt>Mulai</dt>
                <dd>2020</dd>
              </div>
              <div>
                <dt>Basis</dt>
                <dd>Bandung Barat</dd>
              </div>
              <div>
                <dt>Rilisan</dt>
                <dd>{catalog.length}</dd>
              </div>
            </dl>
            <div className="an-arc-hero-actions">
              <a className="an-btn an-btn--quiet" href="#timeline">
                Telusuri babak <ArrowDown size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* Babak 2 — asal & konteks: teks panjang jadi subjek, bukan
            pelengkap di bawah judul. */}
        <Reveal>
          <section
            id="origin"
            className="an-section an-arc-origin"
            aria-labelledby="archive-origin-title"
          >
            <div className="an-arc-origin-head an-rise">
              <p className="an-meta">Asal &amp; konteks</p>
              <h2 id="archive-origin-title" className="an-title">
                {journey.title || "Perjalanan musik."}
              </h2>
              <ul className="an-arc-genres">
                {verifiedArtistProfile.genres.map(genre => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            </div>
            <div className="an-arc-origin-body an-rise">
              <p className="an-arc-intro">
                {journey.intro || verifiedArtistProfile.longBio}
              </p>
              <p className="an-arc-detail">
                {verifiedArtistProfile.location} ·{" "}
                {verifiedArtistProfile.aliases.join(" / ")}
              </p>
            </div>
          </section>
        </Reveal>

        {/* Babak 3 — linimasa babak, isi utama arsip. */}
        <EditorialSection
          id="timeline"
          title={
            <>
              SATU NAMA,
              <br />
              BANYAK BABAK.
            </>
          }
          lede="Setiap babak terbaca penuh di halaman ini. Gulir untuk melihat garis babak menyala dan artwork terkait berganti."
          aside={<SignalIndicator label="ARSIP INTERAKTIF" />}
        >
          <EraTimeline eras={eras} lang="id" />
        </EditorialSection>

        {/* Babak 4 — catatan dari studio: satu gambar, satu keterangan. */}
        <Reveal>
          <section
            className="an-section an-arc-studio"
            aria-labelledby="archive-studio-title"
          >
            <figure className="an-arc-studio-plate an-rise">
              <img
                src={officialBrand.editorialPortrait}
                alt="Potret editorial Akbar Nawasunda dengan cahaya merah"
                width={667}
                height={1000}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="an-arc-studio-copy an-rise">
              <p className="an-meta">Catatan visual</p>
              <h2 id="archive-studio-title" className="an-title">
                Dari studio.
              </h2>
              <p>
                Salah satu arah visual dari dunia Akbar Nawasunda: industrial,
                kontras, dan dekat dengan energi electronic bass.
              </p>
              <p className="an-arc-note">Bukan rilisan audio</p>
              <div className="an-arc-hero-actions">
                <Link className="an-btn an-btn--quiet" href="/visuals">
                  Lihat visual <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        <ArtistPhotoStorySection photoStories={photoStories} />

        {/* Babak 5 — dinding artwork: enam rilisan, lebar bergantian. */}
        <Reveal>
          <section
            className="an-section an-arc-wall"
            aria-labelledby="archive-artwork-title"
          >
            <header className="an-head an-head--row">
              <div>
                <p className="an-meta">{catalog.length} rilisan · kanal resmi</p>
                <h2 id="archive-artwork-title" className="an-title">
                  Artwork rilisan.
                </h2>
              </div>
              <Link className="an-btn an-btn--quiet" href="/music">
                Buka katalog <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </header>
            <div className="an-arc-wall-grid">
              {catalog.slice(0, 6).map(release => (
                <Link
                  className="an-arc-wall-item an-rise"
                  href={`/music/${slugify(release.title)}`}
                  key={release.title}
                >
                  <span className="an-arc-wall-art">
                    <ResilientArtworkImage
                      src={artworkThumb(release.image)}
                      backupSrc={release.image}
                      alt={`Artwork ${release.title}`}
                    />
                  </span>
                  <span className="an-arc-wall-meta">
                    <small>
                      {release.year} · {release.platform}
                    </small>
                    <strong>{release.title}</strong>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Babak 6 — jalur resmi sebagai indeks, bukan kartu. */}
        <section
          className="an-section an-arc-routes"
          aria-labelledby="archive-routes-title"
        >
          <div className="an-arc-route-head">
            <p className="an-meta">Jalur resmi</p>
            <h2 id="archive-routes-title" className="an-title">
              Music, remix, booking, lisensi.
            </h2>
            <p>Semua kebutuhan itu masuk lewat satu jalur resmi yang sama.</p>
          </div>
          <ul className="an-index an-arc-route-list">
            {routes.map(route => {
              const Icon = route.icon;
              return (
                <li key={route.title}>
                  <Link className="an-index-row" href={route.href}>
                    <span className="an-meta">{route.number}</span>
                    <span className="an-arc-route-copy">
                      <strong>{route.title}</strong>
                      <small>{route.copy}</small>
                    </span>
                    <Icon size={16} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <FanSignalSection
          source={FAN_SIGNAL_SOURCES.universe}
          title={
            <>
              TETAP DI
              <br />
              FREKUENSI.
            </>
          }
          description="Ikuti perjalanan, rilisan, dan kolaborasi baru Akbar Nawasunda dari satu kanal resmi."
        />
      </main>
      <NightFooter />
    </div>
  );
}
