import { ArrowUpRight, MapPin, Radio, Sparkles } from "lucide-react";
import { CtaPanel } from "@/components/editorial/EditorialKit";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { officialBrand, verifiedArtistProfile } from "@/content/artistPlatform";
import { publicJourney, usePublicArtistContent } from "@/content/publicContent";
import "./EcosystemPages.css";

export default function About() {
  const cms = usePublicArtistContent();
  const profile = cms.data?.profile;
  const shortBio = profile?.shortBio || verifiedArtistProfile.shortBio;
  const journey = publicJourney(cms.data);
  const longBio = journey.intro || profile?.longBio || verifiedArtistProfile.longBio;
  const genres = profile?.genres?.length ? profile.genres : verifiedArtistProfile.genres;
  const location = profile?.location || verifiedArtistProfile.location;
  const locationUrl = profile?.locationUrl;

  return (
    <div className="nf-page an-about-page">
      <NightHeader active="/about" />
      <main>
        <section
          className="nf-page-hero an-about-hero"
          style={
            {
              "--page-image": `url(${profile?.portraitImage || officialBrand.socialPreview})`,
            } as React.CSSProperties
          }
        >
          <div>
            <h1 className="an-about-title">
              AKBAR
              <br />
              NAWASUNDA.
            </h1>
            <p>{shortBio}</p>
          </div>
          <div className="nf-hero-note">
            <span>BERASAL DARI</span>
            {locationUrl ? (
              <a
                className="nf-location-link"
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{location}</strong>
                <ArrowUpRight size={12} />
              </a>
            ) : (
              <strong>{location.toUpperCase()}</strong>
            )}
            <a className="nf-text-button" href="/music">
              LIHAT MUSIK <ArrowUpRight size={14} />
            </a>
          </div>
        </section>

        <section className="nf-section an-profile-section">
          <div className="an-profile-aside">
            <MapPin size={17} />
            {locationUrl ? (
              <a
                className="an-profile-location-link"
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span>{location}</span>
                <ArrowUpRight size={12} />
              </a>
            ) : (
              <span>{location}</span>
            )}
            <span>AKA {verifiedArtistProfile.aliases.join(" / ")}</span>
          </div>
          <div className="an-profile-copy">
            <h2>
              PERJALANAN
              <br />
              MUSIK.
            </h2>
            <p>{longBio}</p>
            {profile?.artistStatement ? (
              <blockquote>“{profile.artistStatement}”</blockquote>
            ) : (
              <p className="an-profile-note">
                Karya orisinal dirilis sebagai Akbar Nawasunda; katalog remix
                juga dikenal melalui DJ Akbar Remix.
              </p>
            )}
            <div className="an-genre-row">
              {genres.map((genre) => (
                <span key={genre}>
                  <Radio size={12} /> {genre}
                </span>
              ))}
            </div>
          </div>
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
              <a className="ed-button--ghost" href="/live">
                JADWAL LIVE <ArrowUpRight size={14} />
              </a>
            </>
          }
        />

        <section className="nf-section dark-panel an-about-path">
          <div>
            <h2>
              DENGAR
              <br />
              RILISAN.
            </h2>
          </div>
          <div className="an-about-actions">
            <a className="nf-button" href="/music">
              <Sparkles size={15} /> MUSIC
            </a>
            <a className="nf-text-button" href="/epk">
              EPK &amp; BOOKING <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
      </main>
      <NightFooter />
    </div>
  );
}