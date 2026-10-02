import { ArrowUpRight, MapPin, Radio } from "lucide-react";
import { Link } from "wouter";
import { CtaPanel } from "@/components/editorial/EditorialKit";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { ResilientArtworkImage } from "@/components/ResilientArtworkImage";
import { Reveal } from "@/components/Reveal";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import { publicJourney, usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";
import "./ArchiveStage.css";

export default function About() {
  const cms = usePublicArtistContent();
  const profile = cms.data?.profile;
  const shortBio = profile?.shortBio || verifiedArtistProfile.shortBio;
  const journey = publicJourney(cms.data);
  const longBio =
    journey.intro || profile?.longBio || verifiedArtistProfile.longBio;
  const genres = profile?.genres?.length
    ? profile.genres
    : verifiedArtistProfile.genres;
  const location = profile?.location || verifiedArtistProfile.location;
  const locationUrl = profile?.locationUrl;
  const portrait = profile?.portraitImage || officialBrand.portrait;

  return (
    <div className="nf-page an-about-page">
      <NightHeader active="/about" />
      <main id="main-content" tabIndex={-1}>
        {/* Potret resmi dan identitas: foto memegang separuh halaman,
            tipografi tidak ditumpuk di atasnya. */}
        <section className="an-ab-hero" aria-labelledby="about-title">
          <figure className="an-ab-hero-plate">
            <ResilientArtworkImage
              src={portrait}
              backupSrc={officialBrand.portraitFallback}
              alt="Potret resmi Akbar Nawasunda"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>{location} · Potret resmi</figcaption>
          </figure>
          <div className="an-ab-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              Profil artis
            </p>
            <h1 id="about-title">Akbar Nawasunda.</h1>
            <p className="an-ab-lede">{shortBio}</p>
            <dl className="an-facts">
              <div>
                <dt>Basis</dt>
                <dd>{location}</dd>
              </div>
              <div>
                <dt>Alias</dt>
                <dd>{verifiedArtistProfile.aliases.join(" / ")}</dd>
              </div>
              <div>
                <dt>Mulai</dt>
                <dd>2020</dd>
              </div>
            </dl>
            <div className="an-ab-hero-actions">
              <Link className="an-btn an-btn--solid" href="/music">
                Dengar musik <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              {locationUrl ? (
                <a
                  className="an-btn an-btn--quiet"
                  href={locationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin size={14} aria-hidden="true" /> {location}
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* Biografi sebagai halaman baca: satu kolom teks yang terukur,
            pernyataan artis jadi kutipan besar. */}
        <Reveal>
          <section
            className="an-section an-ab-bio"
            aria-labelledby="about-bio-title"
          >
            <div className="an-ab-bio-aside an-rise">
              <p className="an-meta">Biografi</p>
              <p className="an-meta">
                Aka {verifiedArtistProfile.aliases.join(" / ")}
              </p>
            </div>
            <div className="an-ab-bio-body an-rise">
              <h2 id="about-bio-title" className="an-title">
                Perjalanan musik.
              </h2>
              <p className="an-ab-long">{longBio}</p>
              {profile?.artistStatement ? (
                <blockquote className="an-ab-quote">
                  “{profile.artistStatement}”
                </blockquote>
              ) : (
                <p className="an-ab-long">
                  Karya orisinal dirilis sebagai Akbar Nawasunda; katalog remix
                  juga dikenal melalui DJ Akbar Remix.
                </p>
              )}
              <ul className="an-ab-genres">
                {genres.map(genre => (
                  <li key={genre}>
                    <Radio size={12} aria-hidden="true" /> {genre}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        {/* Pita potret penuh lebar — jeda visual sebelum jalur lanjut. */}
        <section className="an-ab-band" aria-label="Potret editorial">
          <figure className="an-ab-band-plate">
            <img
              src={officialBrand.editorialPortrait}
              alt="Potret editorial Akbar Nawasunda dengan cahaya merah"
              width={667}
              height={1000}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <p className="an-ab-band-caption">
            <span>Potret editorial · Bandung Barat</span>
            <span>Akbar Nawasunda</span>
          </p>
        </section>

        <CtaPanel
          title={
            <>
              MULAI SATU
              <br />
              PROYEK BARU.
            </>
          }
          copy="Booking panggung, remix custom, lisensi, atau kolaborasi rilisan — semuanya masuk lewat satu jalur inquiry resmi."
          actions={
            <>
              <a className="ed-button" href="/inquire?source=about">
                KIRIM INQUIRY <ArrowUpRight size={14} />
              </a>
              <Link className="ed-button--ghost" href="/live">
                JADWAL LIVE <ArrowUpRight size={14} />
              </Link>
            </>
          }
        />

        <section
          className="an-section an-ab-path"
          aria-labelledby="about-path-title"
        >
          <header className="an-head">
            <p className="an-meta">Lanjut dari sini</p>
            <h2 id="about-path-title" className="an-title">
              Dengar, baca, atau ajak kerja sama.
            </h2>
          </header>
          <div className="an-ab-path-grid">
            <Link className="an-ab-path-item" href="/music">
              <span>
                <strong>Dengar rilisan</strong>
                <small>
                  Katalog lengkap dengan artwork, metadata, dan tautan dengar
                  resmi.
                </small>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link className="an-ab-path-item" href="/epk">
              <span>
                <strong>EPK &amp; press kit</strong>
                <small>
                  Bio siap pakai, foto resmi, dan kebutuhan promo untuk media.
                </small>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link className="an-ab-path-item" href="/live">
              <span>
                <strong>Jadwal live</strong>
                <small>
                  Tanggal terkonfirmasi dan jalur booking panggung.
                </small>
              </span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <NightFooter />
    </div>
  );
}
